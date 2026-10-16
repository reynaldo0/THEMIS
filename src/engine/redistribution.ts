import { REDISTRIBUTION_ENABLED, REDISTRIBUTION_MIN_DIFF } from "@/lib/constants";
import type { CarOccupancy, RedistributionResult } from "@/types";

interface CarLike {
  carId: number;
  occupancyRatio: number;
  densityIndicator: string;
}

/**
 * Target redistribusi harus masih punya ruang — di bawah 70%.
 * Selaras dengan DOOR_TARGET_CAPACITY_MAX di backend.
 */
const TARGET_MAX_OCCUPANCY = 0.7;

/**
 * Redistribution engine — mirror `backend/app/ai/redistribution_engine.py`.
 *
 * Pemilihan gerbong tujuan: BUKAN yang paling lengang secara global, melainkan
 * gerbong TERDEKAT (selisih nomor gerbong terkecil) yang cukup lebih lengang
 * (`REDISTRIBUTION_MIN_DIFF`). Ini menghindari rekomendasi memindahkan
 * penumpang ke ujung rangkaian saat ada gerbong dekat yang memadai.
 *
 * Prioritas target:
 *   1. Gerbong di bawah 70% (masih nyaman).
 *   2. Bila SELURUH gerbong padat (>70%, "padat banget"), tetap pindah ke
 *      gerbong relatif paling sepi yang jaraknya paling dekat — agar sistem
 *      tidak diam saat rangkaian jenuh.
 * Bila jarak sama, dipilih yang paling sepi.
 */
export function analyze(
  allCarData: CarLike[],
  currentCarId?: number,
): RedistributionResult | null {
  if (!REDISTRIBUTION_ENABLED || allCarData.length === 0) return null;

  if (currentCarId != null) {
    const current = allCarData.find((c) => c.carId === currentCarId);
    if (!current) return null;
    if (current.densityIndicator !== "RED" && current.densityIndicator !== "YELLOW") {
      return null;
    }

    const target = pickNearestTarget(allCarData, current);
    if (!target) return null;

    return buildRecommendation(current, target);
  }

  return globalAnalysis(allCarData);
}

/** Gerbong tujuan terdekat yang cukup lebih lengang (utamakan yang <70%). */
function pickNearestTarget(cars: CarLike[], source: CarLike): CarLike | null {
  const emptier = cars.filter(
    (c) =>
      c.carId !== source.carId &&
      source.occupancyRatio - c.occupancyRatio >= REDISTRIBUTION_MIN_DIFF,
  );
  if (emptier.length === 0) return null;

  // Tier 1: masih di bawah 70%. Tier 2: padat banget → pakai yang relatif sepi.
  const comfortable = emptier.filter((c) => c.occupancyRatio < TARGET_MAX_OCCUPANCY);
  const pool = comfortable.length > 0 ? comfortable : emptier;

  pool.sort((a, b) => {
    const da = Math.abs(a.carId - source.carId);
    const db = Math.abs(b.carId - source.carId);
    if (da !== db) return da - db; // terdekat lebih dulu
    return a.occupancyRatio - b.occupancyRatio; // lalu paling sepi
  });
  return pool[0];
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
    reason: `Gerbong ${from.carId} (${pct(from.occupancyRatio)}) -> gerbong ${to.carId} (${pct(
      to.occupancyRatio,
    )}, terdekat & <70%)`,
  };
}

function globalAnalysis(cars: CarLike[]): RedistributionResult | null {
  if (cars.length < 2) return null;

  const most = [...cars].sort((a, b) => b.occupancyRatio - a.occupancyRatio)[0];
  if (most.occupancyRatio <= 0.6) return null;

  const target = pickNearestTarget(cars, most);
  if (!target) return null;

  const diff = most.occupancyRatio - target.occupancyRatio;
  if (diff < REDISTRIBUTION_MIN_DIFF) return null;

  return {
    action: "GLOBAL_REDISTRIBUTION",
    fromCarId: most.carId,
    toCarId: target.carId,
    fromOccupancy: round4(most.occupancyRatio),
    toOccupancy: round4(target.occupancyRatio),
    occupancyDiff: round4(diff),
    confidence: round4(Math.min(0.95, diff)),
    reason: `Ketimpangan terdeteksi: gerbong ${most.carId} (${pct(
      most.occupancyRatio,
    )}) -> gerbong terdekat ${target.carId} (${pct(target.occupancyRatio)}, <70%)`,
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
