import {
  BALANCE_WEIGHT,
  DISTANCE_WEIGHT,
  OCCUPANCY_WEIGHT,
  RECO_CONFIDENCE_BOOST,
  RECO_CONFIDENCE_CEILING,
  RECO_MAX,
  RECO_MIN_IMBALANCE,
  RECO_MIN_OCCUPANCY_SOURCE,
  WOMEN_CARS,
} from "@/lib/constants";
import type { CarOccupancy, Recommendation, RecommendationItem } from "@/types";

/**
 * `GET /api/v1/recommendation` scoring — mirrors the backend endpoint.
 *
 *   score      = (1 - targetOcc) * 0.55
 *              + balance        * 0.30
 *              - |carDelta| * 0.5 * 0.15
 *   balance    = 1 - |targetOcc - congestionAvg|
 *   confidence = min(0.97, score + 0.3)
 */
export function buildRecommendation(cars: CarOccupancy[]): Recommendation | null {
  if (cars.length < 2) return null;

  const sortedByOcc = [...cars].sort((a, b) => b.occupancyRatio - a.occupancyRatio);
  const source = sortedByOcc[0];
  if (source.occupancyRatio < RECO_MIN_OCCUPANCY_SOURCE) return null;

  const congestionAvg =
    cars.reduce((sum, c) => sum + c.occupancyRatio, 0) / cars.length;

  const candidates = cars
    .filter(
      (c) =>
        c.carId !== source.carId &&
        source.occupancyRatio - c.occupancyRatio >= RECO_MIN_IMBALANCE,
    )
    .map((c) => {
      const occScore = 1 - c.occupancyRatio;
      const balanceMetric = 1 - Math.abs(c.occupancyRatio - congestionAvg);
      const distancePenalty = Math.abs(c.carId - source.carId) * 0.5 * DISTANCE_WEIGHT;
      const score =
        occScore * OCCUPANCY_WEIGHT + balanceMetric * BALANCE_WEIGHT - distancePenalty;
      return { car: c, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, RECO_MAX);

  if (candidates.length === 0) return null;

  const recommendations: RecommendationItem[] = candidates.map(({ car, score }, i) => {
    const isWomenPriority = WOMEN_CARS.has(car.carId);
    const confidence = Math.min(RECO_CONFIDENCE_CEILING, Math.max(0, score) + RECO_CONFIDENCE_BOOST);
    return {
      action: "REDISTRIBUTION",
      fromCarId: source.carId,
      toCarId: car.carId,
      confidence: round2(confidence),
      reason:
        `Gerbong ${source.carId} ${pct(source.occupancyRatio)} -> Gerbong ${car.carId} ${pct(
          car.occupancyRatio,
        )}.` + (isWomenPriority ? " (Khusus Wanita)" : ""),
      priority: i + 1,
      label: i === 0 ? "#1 Best Choice" : `#${i + 1} Alternative`,
      isWomenPriority,
      score: round4(score),
    };
  });

  return {
    fromCarId: source.carId,
    fromOccupancy: round4(source.occupancyRatio),
    congestionAvg: round4(congestionAvg),
    highestOccupancy: round4(source.occupancyRatio),
    recommendedCars: recommendations.map((r) => r.toCarId),
    recommendations,
    timestamp: new Date().toISOString(),
  };
}

function pct(v: number): string {
  return `${Math.round(v * 100)}%`;
}
function round2(v: number): number {
  return Math.round(v * 100) / 100;
}
function round4(v: number): number {
  return Math.round(v * 10000) / 10000;
}
