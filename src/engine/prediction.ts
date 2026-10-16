import { PREDICTION_HORIZON_MINUTES } from "@/lib/constants";
import type { Prediction, Trend } from "@/types";

/**
 * Prediction heuristic mirrored from `GET /api/v1/occupancy`.
 *
 *   occ < 0.3 -> stable,     conf ~0.90, delta [-0.02, +0.05]
 *   occ < 0.6 -> mixed,      conf 0.72..0.85, delta [-0.03, +0.06]
 *   occ < 0.8 -> mixed,      conf 0.70..0.88, delta [-0.02, +0.08]
 *   else      -> increasing, conf 0.80..0.92, delta [+0.01, +0.10]
 */
export function predict(carId: number, occupancyRatio: number): Prediction {
  const rng = mulberry32(carId * 7919 + Math.floor(occupancyRatio * 10_000));

  let delta: number;
  let confidence: number;
  let trend: Trend = "stable";

  if (occupancyRatio < 0.3) {
    delta = -0.02 + rng() * 0.07;
    confidence = 0.9;
    trend = "stable";
  } else if (occupancyRatio < 0.6) {
    delta = -0.03 + rng() * 0.09;
    confidence = 0.72 + rng() * 0.13;
  } else if (occupancyRatio < 0.8) {
    delta = -0.02 + rng() * 0.1;
    confidence = 0.7 + rng() * 0.18;
  } else {
    delta = 0.01 + rng() * 0.09;
    confidence = 0.8 + rng() * 0.12;
  }

  if (trend !== "stable") {
    trend = delta > 0.01 ? "increasing" : delta < -0.01 ? "decreasing" : "stable";
  }

  const predicted = clamp01(occupancyRatio + delta);

  return {
    trend,
    predictedOccupancyRatio: round(predicted, 4),
    confidence: round(confidence, 2),
    horizonMinutes: PREDICTION_HORIZON_MINUTES,
  };
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function round(v: number, digits: number): number {
  const f = 10 ** digits;
  return Math.round(v * f) / f;
}

/** Tiny deterministic PRNG so the demo is stable across renders. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
