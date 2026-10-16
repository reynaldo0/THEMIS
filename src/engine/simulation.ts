import { CAPACITY_PER_CAR, FLOOR_AREA_M2, NUM_CAMERAS_PER_CAR } from "@/lib/constants";
import { classifyFreeSpace } from "@/engine/density";
import { predict } from "@/engine/prediction";
import { riskScore } from "@/engine/risk";
import type { CarOccupancy, DensityIndicator } from "@/types";

/**
 * Builds a full `CarOccupancy` fleet from raw occupancy ratios — the dummy
 * data path used until the FastAPI WebSocket feed is connected.
 */
export function buildCars(ratios: number[], timestamp = new Date().toISOString()): CarOccupancy[] {
  return ratios.map((occupancyRatio, idx) => {
    const carId = idx + 1;
    const clamped = clamp01(occupancyRatio);
    const freeSpaceRatio = round4(1 - clamped);
    const densityIndicator = classifyFreeSpace(freeSpaceRatio);
    return {
      carId,
      occupancyRatio: round4(clamped),
      freeSpaceRatio,
      densityIndicator,
      spatialOccupancyScore: round4(clamped * (0.92 + (carId % 5) * 0.02)),
      riskScore: riskScore(clamped),
      floorAreaM2: FLOOR_AREA_M2,
      cameraId: `car${String(carId).padStart(2, "0")}_cam01`,
      cameraStatus: "active" as const,
      capacity: CAPACITY_PER_CAR,
      passengers: Math.round(clamped * CAPACITY_PER_CAR),
      prediction: predict(carId, clamped),
      timestamp,
    };
  });
}

export function countByDensity(cars: CarOccupancy[]) {
  const counts: Record<DensityIndicator, number> = { GREEN: 0, YELLOW: 0, RED: 0 };
  for (const c of cars) counts[c.densityIndicator] += 1;
  return counts;
}

export function averageOccupancy(cars: CarOccupancy[]): number {
  if (cars.length === 0) return 0;
  return cars.reduce((s, c) => s + c.occupancyRatio, 0) / cars.length;
}

export function totalPassengers(cars: CarOccupancy[]): number {
  return cars.reduce((s, c) => s + c.passengers, 0);
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function round4(v: number): number {
  return Math.round(v * 10000) / 10000;
}

export const TOTAL_FLOOR_AREA = FLOOR_AREA_M2;
export const CAMERA_COUNT_PER_CAR = NUM_CAMERAS_PER_CAR;
