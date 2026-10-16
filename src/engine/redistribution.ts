import { REDISTRIBUTION_ENABLED, REDISTRIBUTION_MIN_DIFF } from "@/lib/constants";
import type { CarOccupancy, RedistributionResult } from "@/types";

interface CarLike {
  carId: number;
  occupancyRatio: number;
  densityIndicator: string;
}

/**
 * Redistribution engine — mirrors `backend/app/ai/redistribution_engine.py`.
 *
 * Focused mode (currentCarId provided): only when the current car is RED or
 * YELLOW; the first (least occupied) car whose occupancy is at least
 * `REDISTRIBUTION_MIN_DIFF` lower wins. confidence = min(0.95, diff).
 */
export function analyze(
  allCarData: CarLike[],
  currentCarId?: number,
): RedistributionResult | null {
  if (!REDISTRIBUTION_ENABLED || allCarData.length === 0) return null;

  const sorted = [...allCarData].sort((a, b) => a.occupancyRatio - b.occupancyRatio);

  if (currentCarId != null) {
    const current = allCarData.find((c) => c.carId === currentCarId);
    if (!current) return null;
    if (current.densityIndicator !== "RED" && current.densityIndicator !== "YELLOW") {
      return null;
    }

    const target = sorted.find(
      (c) =>
        c.carId !== currentCarId &&
        current.occupancyRatio - c.occupancyRatio >= REDISTRIBUTION_MIN_DIFF,
    );
    if (!target) return null;

    return buildRecommendation(current, target);
  }

  return globalAnalysis(sorted);
}

function buildRecommendation(from: CarLike, to: CarLike): RedistributionResult {
  const diff = from.occupancyRatio - to.occupancyRatio;
  return {
    action: "REDISTRIBUTION",
    fromCarId: from.carId,
    toCarId: to.carId,
    fromOccupancy: round4(from.occupancyRatio),
    toOccupancy: round4(to.occupancyRatio),
    occupancyDiff: round4(diff),
    confidence: round4(Math.min(0.95, diff)),
    reason: `Car ${from.carId} (${pct(from.occupancyRatio)}) is more occupied than Car ${to.carId} (${pct(to.occupancyRatio)})`,
  };
}

function globalAnalysis(sorted: CarLike[]): RedistributionResult | null {
  if (sorted.length < 2) return null;
  const least = sorted[0];
  const most = sorted[sorted.length - 1];
  const diff = most.occupancyRatio - least.occupancyRatio;

  if (diff < REDISTRIBUTION_MIN_DIFF || most.occupancyRatio <= 0.6) return null;

  return {
    action: "GLOBAL_REDISTRIBUTION",
    fromCarId: most.carId,
    toCarId: least.carId,
    fromOccupancy: round4(most.occupancyRatio),
    toOccupancy: round4(least.occupancyRatio),
    occupancyDiff: round4(diff),
    confidence: round4(Math.min(0.95, diff)),
    reason: `Significant imbalance detected: Car ${most.carId} (${pct(
      most.occupancyRatio,
    )}) vs Car ${least.carId} (${pct(least.occupancyRatio)})`,
  };
}

export function analyzeFleet(cars: CarOccupancy[]): RedistributionResult | null {
  return analyze(
    cars.map((c) => ({
      carId: c.carId,
      occupancyRatio: c.occupancyRatio,
      densityIndicator: c.densityIndicator,
    })),
  );
}

function pct(v: number): string {
  return `${Math.round(v * 100)}%`;
}

function round4(v: number): number {
  return Math.round(v * 10000) / 10000;
}
