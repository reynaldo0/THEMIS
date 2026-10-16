import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { SIMULATION_JITTER, SIMULATION_TICK_MS, TRAIN_ID, FORMATION } from "@/lib/constants";
import { SCENARIOS, DEFAULT_SCENARIO, jitter } from "@/engine/scenarios";
import { buildCars, averageOccupancy, countByDensity, totalPassengers } from "@/engine/simulation";
import { buildRecommendation } from "@/engine/recommendation";
import { analyzeFleet } from "@/engine/redistribution";
import { evaluateDoor } from "@/engine/door";
import { generateAnnouncement } from "@/engine/announcement";
import { generateWarnings } from "@/engine/warning";
import { computeCales } from "@/engine/cales";
import { stationAt, DEFAULT_STATION_INDEX } from "@/engine/stations";
import type {
  Announcement,
  CalesMetrics,
  CarOccupancy,
  DoorState,
  Recommendation,
  RedistributionResult,
  ScenarioName,
  TimelineEvent,
  Warning,
} from "@/types";

export interface HistoryPoint {
  t: string;
  avg: number;
  red: number;
  yellow: number;
  green: number;
  cars: number[];
}

interface ThemisState {
  scenario: ScenarioName;
  cars: CarOccupancy[];
  warnings: Warning[];
  recommendation: Recommendation | null;
  redistribution: RedistributionResult | null;
  doorStates: Record<number, DoorState>;
  announcement: Announcement | null;
  cales: Record<number, CalesMetrics>;
  calesHistory: Record<number, number[]>;
  history: HistoryPoint[];
  eventLog: TimelineEvent[];
  selectedCarId: number | null;
  hoveredCarId: number | null;
  isLive: boolean;
  tick: number;
  tickMs: number;
  stationIndex: number;
  viewMode: "2d" | "3d";

  setScenario: (s: ScenarioName) => void;
  selectCar: (carId: number | null) => void;
  hoverCar: (carId: number | null) => void;
  toggleLive: () => void;
  step: () => void;
  nextStation: () => void;
  setViewMode: (m: "2d" | "3d") => void;
}

const initialCars = buildCars(SCENARIOS[DEFAULT_SCENARIO].cars);

function initialLog(): TimelineEvent[] {
  return [
    {
      id: "boot-1",
      timestamp: new Date().toISOString(),
      type: "SYSTEM",
      message: `Digital twin ${TRAIN_ID} (${FORMATION}) siap — mode simulasi dummy.`,
      severity: "success",
    },
  ];
}

export const useThemisStore = create<ThemisState>((set, get) => ({
  scenario: DEFAULT_SCENARIO,
  cars: initialCars,
  warnings: generateWarnings(initialCars, TRAIN_ID),
  recommendation: buildRecommendation(initialCars),
  redistribution: analyzeFleet(initialCars),
  doorStates: buildDoorStates(initialCars, analyzeFleet(initialCars)),
  announcement: generateAnnouncement(analyzeFleet(initialCars)),
  cales: buildCales(initialCars, {}, {}),
  calesHistory: {},
  history: [toHistoryPoint(initialCars, 0)],
  eventLog: initialLog(),
  selectedCarId: null,
  hoveredCarId: null,
  isLive: true,
  tick: 0,
  tickMs: SIMULATION_TICK_MS,
  stationIndex: DEFAULT_STATION_INDEX,
  viewMode: "3d",

  setScenario: (scenario) => {
    const def = SCENARIOS[scenario];
    const cars = buildCars(def.cars);
    const redistribution = analyzeFleet(cars);
    const event: TimelineEvent = {
      id: `scn-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: "SCENARIO",
      message: `Skenario "${def.label}" — ${def.tagline}. ${def.description}`,
      severity: def.accent === "#ef4444" || def.accent === "#dc2626" ? "warning" : "info",
    };
    set({
      scenario,
      cars,
      warnings: generateWarnings(cars, TRAIN_ID),
      recommendation: buildRecommendation(cars),
      redistribution,
      doorStates: buildDoorStates(cars, redistribution),
      announcement: generateAnnouncement(redistribution),
      cales: buildCales(cars, get().calesHistory, {}),
      calesHistory: {},
      history: [toHistoryPoint(cars, 0)],
      tick: 0,
      eventLog: [event, ...get().eventLog].slice(0, 40),
    });
  },

  selectCar: (selectedCarId) => set({ selectedCarId }),
  hoverCar: (hoveredCarId) => set({ hoveredCarId }),
  toggleLive: () => set({ isLive: !get().isLive }),
  setViewMode: (viewMode) => set({ viewMode }),

  nextStation: () =>
    set((s) => ({ stationIndex: Math.min(15, s.stationIndex + 1) })),

  step: () => {
    const state = get();
    const base = SCENARIOS[state.scenario].cars;
    const tick = state.tick + 1;

    const ratios = state.cars.map((_, i) => {
      const drift = Math.sin((tick + i * 3) / 6) * 0.015;
      return jitter(base[i] + drift, SIMULATION_JITTER);
    });

    const cars = buildCars(ratios);
    const warnings = generateWarnings(cars, TRAIN_ID);
    const redistribution = analyzeFleet(cars);
    const recommendation = buildRecommendation(cars);
    const announcement = generateAnnouncement(redistribution);
    const calesHistory = { ...state.calesHistory };
    for (const car of cars) {
      const hist = [...(calesHistory[car.carId] ?? []), car.spatialOccupancyScore];
      calesHistory[car.carId] = hist.slice(-24);
    }
    const cales = buildCales(cars, calesHistory, {});
    const doorStates = buildDoorStates(cars, redistribution);
    const history = [...state.history, toHistoryPoint(cars, tick)].slice(-48);

    const events: TimelineEvent[] = [];
    const prevRed = countByDensity(state.cars).RED;
    const nowRed = countByDensity(cars).RED;
    if (nowRed > prevRed) {
      events.push({
        id: `evt-red-${tick}`,
        timestamp: cars[0].timestamp,
        type: "WARNING",
        message: `Eskalasi: ${nowRed} gerbong memasuki zona padat (RED).`,
        severity: "warning",
      });
    } else if (nowRed < prevRed) {
      events.push({
        id: `evt-ok-${tick}`,
        timestamp: cars[0].timestamp,
        type: "RECOVERY",
        message: `Redistribusi berdampak — sisa ${nowRed} gerbong padat.`,
        severity: "success",
      });
    }
    if (redistribution && tick % 5 === 0) {
      events.push({
        id: `evt-reco-${tick}`,
        timestamp: cars[0].timestamp,
        type: "RECOMMENDATION",
        message: `Rekomendasi: pindah dari gerbong ${redistribution.fromCarId} ke gerbong ${redistribution.toCarId} (selisih ${Math.round(redistribution.occupancyDiff * 100)}%).`,
        severity: "info",
      });
    }

    set({
      cars,
      warnings,
      redistribution,
      recommendation,
      announcement,
      cales,
      calesHistory,
      doorStates,
      history,
      tick,
      eventLog: [...events.reverse(), ...state.eventLog].slice(0, 40),
    });
  },
}));

function buildDoorStates(
  cars: CarOccupancy[],
  redistribution: RedistributionResult | null,
): Record<number, DoorState> {
  const map: Record<number, DoorState> = {};
  for (const car of cars) {
    map[car.carId] = evaluateDoor(car, redistribution);
  }
  return map;
}

function buildCales(
  cars: CarOccupancy[],
  history: Record<number, number[]>,
  _fleetAvg: Record<number, number>,
): Record<number, CalesMetrics> {
  const avgOccupancy = averageOccupancy(cars);
  const map: Record<number, CalesMetrics> = {};
  for (const car of cars) {
    map[car.carId] = computeCales(car, history[car.carId] ?? [], avgOccupancy);
  }
  return map;
}

function toHistoryPoint(cars: CarOccupancy[], tick: number): HistoryPoint {
  const counts = countByDensity(cars);
  return {
    t: String(tick),
    avg: averageOccupancy(cars),
    red: counts.RED,
    yellow: counts.YELLOW,
    green: counts.GREEN,
    cars: cars.map((c) => c.occupancyRatio),
  };
}

export function useStation() {
  return useThemisStore((s) => stationAt(s.stationIndex));
}

export function useSelectedCar(): CarOccupancy | null {
  return useThemisStore((s) =>
    s.selectedCarId == null ? null : (s.cars.find((c) => c.carId === s.selectedCarId) ?? null),
  );
}

export function useTrainSummary() {
  return useThemisStore(
    useShallow((s) => {
      const counts = countByDensity(s.cars);
      return {
        avgOccupancy: averageOccupancy(s.cars),
        totalPassengers: totalPassengers(s.cars),
        greenCars: counts.GREEN,
        yellowCars: counts.YELLOW,
        redCars: counts.RED,
        activeWarnings: s.warnings.length,
        camerasOnline: s.cars.length * 4,
      };
    }),
  );
}
