import type { ScenarioMeta, ScenarioName } from "@/types";

export interface ScenarioDefinition extends ScenarioMeta {
  cars: number[];
}

/**
 * Dummy fleet occupancy per scenario.
 *
 * Values follow the documented PROJECT THEMIS ranges for the SF10 formation
 * (10 cars) as published in the API docs / Postman collection:
 *
 *   empty     : all 0%
 *   normal    : 29% .. 42%  (avg ~35%)
 *   peak_hour : 57% .. 97%  (avg ~77%)
 *   holiday   : 7%  .. 22%  (avg ~14%)
 *   imbalanced: 97/94/90% then 48% .. 5%
 *   emergency : 75% .. 99%  (all RED)
 */
export const SCENARIOS: Record<ScenarioName, ScenarioDefinition> = {
  empty: {
    name: "empty",
    label: "Kosong",
    tagline: "Tanpa penumpang",
    description: "Kereta kosong, seluruh gerbong hijau. Kondisi ideal untuk transit / awal rute.",
    pattern: "empty",
    accent: "#22c55e",
    cars: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  normal: {
    name: "normal",
    label: "Sedang",
    tagline: "Trafik seimbang",
    description: "Okupansi siang hari yang seimbang. Sebagian besar gerbong lengang.",
    pattern: "normal",
    accent: "#22c55e",
    cars: [0.38, 0.42, 0.35, 0.4, 0.33, 0.3, 0.36, 0.34, 0.31, 0.29],
  },
  peak_hour: {
    name: "peak_hour",
    label: "Penuh",
    tagline: "Jam sibuk",
    description: "Rush hour pagi/sore. Mayoritas gerbong padat, distribusi tidak merata.",
    pattern: "peak",
    accent: "#ef4444",
    cars: [0.9, 0.86, 0.97, 0.93, 0.82, 0.74, 0.68, 0.62, 0.58, 0.57],
  },
  holiday: {
    name: "holiday",
    label: "Libur",
    tagline: "Trafik ringan",
    description: "Hari libur, okupansi rendah. Seluruh gerbong hijau.",
    pattern: "holiday",
    accent: "#38bdf8",
    cars: [0.18, 0.14, 0.22, 0.12, 0.09, 0.07, 0.15, 0.17, 0.11, 0.13],
  },
  imbalanced: {
    name: "imbalanced",
    label: "Timpang",
    tagline: "Uji redistribusi",
    description: "Ketimpangan berat pada 3 gerbong depan. Pemicu utama engine redistribusi.",
    pattern: "imbalanced",
    accent: "#f59e0b",
    cars: [0.97, 0.94, 0.9, 0.48, 0.42, 0.35, 0.28, 0.2, 0.12, 0.05],
  },
  emergency: {
    name: "emergency",
    label: "Darurat",
    tagline: "Multi RED",
    description: "Seluruh gerbong merah. Skenario eskalasi dan protokol darurat.",
    pattern: "emergency",
    accent: "#dc2626",
    cars: [0.99, 0.96, 0.93, 0.9, 0.88, 0.85, 0.82, 0.79, 0.76, 0.75],
  },
};

export const SCENARIO_ORDER: ScenarioName[] = [
  "empty",
  "normal",
  "peak_hour",
  "holiday",
  "imbalanced",
  "emergency",
];

export const DEFAULT_SCENARIO: ScenarioName = "peak_hour";

export function scenarioList(): ScenarioDefinition[] {
  return SCENARIO_ORDER.map((name) => SCENARIOS[name]);
}

/**
 * Small random walk used by the live simulation tick — mirrors
 * `seeder.simulate_occupancy_change` (+/- 0.03 per tick).
 */
export function jitter(value: number, amplitude: number, rng: () => number = Math.random): number {
  const next = value + (rng() * 2 - 1) * amplitude;
  return Math.max(0, Math.min(1, next));
}
