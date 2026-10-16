/**
 * Risk score table — identical in backend `OccupancyEngine` and `persistence`.
 *
 *   occ < 0.4 -> 0.1
 *   occ < 0.7 -> 0.4
 *   occ < 0.9 -> 0.7
 *   else      -> 1.0
 */
export function riskScore(occupancyRatio: number): number {
  if (occupancyRatio < 0.4) return 0.1;
  if (occupancyRatio < 0.7) return 0.4;
  if (occupancyRatio < 0.9) return 0.7;
  return 1.0;
}

export function riskLabel(score: number): string {
  if (score < 0.25) return "Rendah";
  if (score < 0.55) return "Sedang";
  if (score < 0.85) return "Tinggi";
  return "Kritis";
}
