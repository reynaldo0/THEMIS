import type { DensityIndicator } from "@/types";
import { useGLTF } from "@react-three/drei";
import { TOTAL_CARS } from "@/lib/constants";

/**
 * GLB train models exported from Blender (via the Unity/digital-twin
 * pipeline in themis-twin). Each file is ONE carriage with baked passengers:
 *
 *   train-low.glb     ~12 passengers  → GREEN  (Kosong)
 *   train-medium.glb  ~42 passengers  → YELLOW (Sedang)
 *   train-high.glb    ~132 passengers → RED    (Penuh)
 */
export const MODEL_URLS = {
  LOW: "/models/train-low.glb",
  MEDIUM: "/models/train-medium.glb",
  HIGH: "/models/train-high.glb",
} as const;

export type OccupancyVariant = "LOW" | "MEDIUM" | "HIGH";

/** Same thresholds as backend OccupancyEngine (0.4 / 0.7). */
export function variantFor(density: DensityIndicator): OccupancyVariant {
  if (density === "RED") return "HIGH";
  if (density === "YELLOW") return "MEDIUM";
  return "LOW";
}

export const MODEL_URL_BY_VARIANT: Record<OccupancyVariant, string> = {
  LOW: MODEL_URLS.LOW,
  MEDIUM: MODEL_URLS.MEDIUM,
  HIGH: MODEL_URLS.HIGH,
};

/** Blender export is ~22 m per car; scaled to fit the station diorama. */
export const MODEL_SCALE = 0.24;

export const CAR_STRIDE = 5.27 + 0.28;
export const TRAIN_LENGTH = 10 * CAR_STRIDE - 0.28;

/** Posisi X sebuah gerbong (carId 1-based) — sama dengan layout di Train.tsx. */
export function carX(carId: number): number {
  const total = TOTAL_CARS * CAR_STRIDE - (CAR_STRIDE - 5.27);
  const start = -total / 2 + 5.27 / 2;
  return start + (carId - 1) * CAR_STRIDE;
}

// Hanya varian awal yang dimuat saat start — varian lain di-prefetch di
// latar belakang agar TTI pertama jauh lebih cepat (file GLB 6–10 MB).
useGLTF.preload(MODEL_URLS.LOW);

let prefetched = false;
export function prefetchVariants() {
  if (prefetched) return;
  prefetched = true;
  useGLTF.preload(MODEL_URLS.MEDIUM);
  useGLTF.preload(MODEL_URLS.HIGH);
}
