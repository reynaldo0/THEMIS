import {
  CALES_AIR_SPRING_NOMINAL_MONTHS,
  CALES_CHEVRON_RUBBER_NOMINAL_MONTHS,
  CALES_WHEEL_FLANGE_NOMINAL_MONTHS,
} from "@/lib/constants";
import type {
  CalesMetrics,
  CalesOpex,
  CalesRul,
  CalesStatus,
  CarOccupancy,
} from "@/types";

/**
 * CALES (Condition & Load Enhanced Safety) engine — mirrors
 * `backend/app/ai/ccales_engine.py`.
 *
 *   asymmetry      = currentScore / fleetAvgScore (default 0.5)
 *   severityWeight = <=1.0 -> 1.0 | <=1.5 -> 1.5 | <=2.0 -> 2.0 | else 3.0
 *   durationFactor = 1 + 0.1 * count(score > 0.7 within last 10 snapshots)
 *   calesScore     = min(1, currentScore * severityWeight * durationFactor)
 *   healthIndex    = max(0, 100 - calesScore * 100)
 */
export function computeCales(
  car: CarOccupancy,
  history: number[],
  fleetAvgOccupancy: number,
): CalesMetrics {
  const currentScore = car.spatialOccupancyScore;
  const avgScore = fleetAvgOccupancy > 0 ? fleetAvgOccupancy : 0.5;

  const asymmetryRatio = currentScore / avgScore;
  const severityWeight =
    asymmetryRatio <= 1.0
      ? 1.0
      : asymmetryRatio <= 1.5
        ? 1.5
        : asymmetryRatio <= 2.0
          ? 2.0
          : 3.0;

  const window = history.slice(-10);
  const durationFactor =
    window.length < 2 ? 1.0 : 1.0 + 0.1 * window.filter((s) => s > 0.7).length;

  const calesScore = Math.min(1.0, currentScore * severityWeight * durationFactor);
  const healthIndex = Math.max(0, 100 - calesScore * 100);
  const status = calesStatus(calesScore);

  return {
    carId: car.carId,
    calesScore: round4(calesScore),
    status,
    healthIndex: round2(healthIndex),
    damageMultiplier: damageMultiplier(status),
    asymmetryRatio: round2(asymmetryRatio),
    severityWeight,
    durationFactor: round2(durationFactor),
    recommendedAction: recommendedAction(status),
    inspectionPriority: inspectionPriority(calesScore),
    rul: calculateRul(calesScore),
  };
}

export function calesStatus(score: number): CalesStatus {
  if (score < 0.3) return "GREEN";
  if (score < 0.5) return "YELLOW";
  if (score < 0.7) return "ORANGE";
  return "RED";
}

export function damageMultiplier(status: CalesStatus): number {
  switch (status) {
    case "GREEN":
    case "YELLOW":
      return 1.0;
    case "ORANGE":
      return 2.5;
    case "RED":
      return 3.0;
  }
}

export function recommendedAction(status: CalesStatus): string {
  switch (status) {
    case "GREEN":
      return "CONTINUE_MONITORING";
    case "YELLOW":
      return "SCHEDULE_INSPECTION";
    case "ORANGE":
      return "PRIORITY_INSPECTION";
    case "RED":
      return "IMMEDIATE_DEPOT_INSPECTION";
  }
}

export function inspectionPriority(calesScore: number): number {
  if (calesScore > 0.7) return 1;
  if (calesScore > 0.5) return 2;
  if (calesScore > 0.3) return 3;
  return 0;
}

export function calculateRul(calesScore: number): CalesRul {
  const damageMultiplier = 1 + calesScore * 2;
  return {
    wheelFlangeRul: round1(CALES_WHEEL_FLANGE_NOMINAL_MONTHS / damageMultiplier),
    airSpringRul: round1(CALES_AIR_SPRING_NOMINAL_MONTHS / damageMultiplier),
    chevronRubberRul: round1(CALES_CHEVRON_RUBBER_NOMINAL_MONTHS / damageMultiplier),
    damageMultiplier: round2(damageMultiplier),
  };
}

export function estimateOpex(status: CalesStatus, calesScore: number): CalesOpex {
  const base: Record<CalesStatus, [number, number, number]> = {
    GREEN: [15_000_000, 0, 0],
    YELLOW: [20_000_000, 0, 500_000_000],
    ORANGE: [25_000_000, 150_000_000, 1_000_000_000],
    RED: [25_000_000, 150_000_000, 2_000_000_000],
  };
  const scale = 1 + calesScore;
  const [wheel, air, catastrophic] = base[status];
  const wheelReprofileEst = wheel * scale;
  const airSpringOverhaulEst = air * scale;
  const catastrophicRiskEst = catastrophic * scale;
  return {
    wheelReprofileEst,
    airSpringOverhaulEst,
    catastrophicRiskEst,
    totalPotentialCost: wheelReprofileEst + airSpringOverhaulEst + catastrophicRiskEst,
  };
}

export interface InspectionEntry {
  priorityRank: number;
  carId: number;
  calesScore: number;
  status: CalesStatus;
  healthIndex: number;
  recommendedAction: string;
}

export function rankInspection(metrics: CalesMetrics[]): InspectionEntry[] {
  return [...metrics]
    .sort((a, b) => b.calesScore - a.calesScore)
    .map((m, i) => ({
      priorityRank: i + 1,
      carId: m.carId,
      calesScore: m.calesScore,
      status: m.status,
      healthIndex: m.healthIndex,
      recommendedAction: m.recommendedAction,
    }));
}

export const ACTION_LABEL: Record<string, string> = {
  CONTINUE_MONITORING: "Monitoring rutin",
  SCHEDULE_INSPECTION: "Jadwalkan inspeksi",
  PRIORITY_INSPECTION: "Inspeksi prioritas",
  IMMEDIATE_DEPOT_INSPECTION: "Inspeksi depo segera",
};

export const COMPONENTS = [
  { key: "wheelFlangeRul" as const, label: "Wheel Flange", nominal: CALES_WHEEL_FLANGE_NOMINAL_MONTHS },
  { key: "airSpringRul" as const, label: "Air Spring", nominal: CALES_AIR_SPRING_NOMINAL_MONTHS },
  { key: "chevronRubberRul" as const, label: "Chevron Rubber", nominal: CALES_CHEVRON_RUBBER_NOMINAL_MONTHS },
];

function round1(v: number): number {
  return Math.round(v * 10) / 10;
}
function round2(v: number): number {
  return Math.round(v * 100) / 100;
}
function round4(v: number): number {
  return Math.round(v * 10000) / 10000;
}
