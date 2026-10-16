import {
  DENSITY_GREEN_THRESHOLD,
  DENSITY_RED_THRESHOLD,
  DENSITY_YELLOW_THRESHOLD,
  OCCUPANCY_GREEN_MAX,
  OCCUPANCY_YELLOW_MAX,
} from "@/lib/constants";
import type { DensityIndicator } from "@/types";

/**
 * Density class based on free-space semantics — mirrors
 * backend `DensityClassifier._classify_from_free_space`.
 *
 *   free > 0.6 -> GREEN  (occupancy < 0.4)
 *   free > 0.3 -> YELLOW (0.4 <= occupancy < 0.7)
 *   otherwise  -> RED    (occupancy >= 0.7)
 */
export function classifyFreeSpace(freeSpace: number): DensityIndicator {
  if (freeSpace > DENSITY_GREEN_THRESHOLD) return "GREEN";
  if (freeSpace > DENSITY_YELLOW_THRESHOLD) return "YELLOW";
  if (freeSpace > DENSITY_RED_THRESHOLD) return "RED";
  return "RED";
}

export function classifyOccupancy(occupancy: number): DensityIndicator {
  if (occupancy < OCCUPANCY_GREEN_MAX) return "GREEN";
  if (occupancy < OCCUPANCY_YELLOW_MAX) return "YELLOW";
  return "RED";
}

export function densityConfidence(
  indicator: DensityIndicator,
  freeSpace: number,
): number {
  if (freeSpace <= DENSITY_RED_THRESHOLD) return 0.95;
  if (indicator === "GREEN") return 0.9;
  if (indicator === "YELLOW") return 0.8;
  return 0.85;
}

export function densityReason(indicator: DensityIndicator, freeSpace: number): string {
  if (freeSpace <= DENSITY_RED_THRESHOLD) return "Very low free space, critical density";
  if (indicator === "GREEN") return "High free space available";
  if (indicator === "YELLOW") return "Moderate free space remaining";
  return "Low free space, high density";
}

export const DENSITY_ORDER: DensityIndicator[] = ["GREEN", "YELLOW", "RED"];
