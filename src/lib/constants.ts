/**
 * PROJECT THEMIS — mirrored runtime constants.
 *
 * Values are copied from the backend `app/config/settings.py` and the v6
 * architecture documents so the frontend-only twin behaves identically to
 * the live pipeline.
 */

export const TRAIN_ID = "SF10-001";
export const FORMATION = "SF10";
export const TOTAL_CARS = 10;
export const NUM_CAMERAS_PER_CAR = 4;
export const TOTAL_CAMERAS = TOTAL_CARS * NUM_CAMERAS_PER_CAR;

export const CAPACITY_PER_CAR = 200;
export const FLOOR_AREA_M2 = 42.0;

/** Free-space semantics (DensityClassifier). */
export const DENSITY_GREEN_THRESHOLD = 0.6;
export const DENSITY_YELLOW_THRESHOLD = 0.3;
export const DENSITY_RED_THRESHOLD = 0.0;

/** Occupancy semantics (OccupancyEngine / StateManager / seeder). */
export const OCCUPANCY_GREEN_MAX = 0.4;
export const OCCUPANCY_YELLOW_MAX = 0.7;

export const REDISTRIBUTION_ENABLED = true;
export const REDISTRIBUTION_MIN_DIFF = 0.2;

/** /recommendation endpoint scoring. */
export const RECO_MIN_OCCUPANCY_SOURCE = 0.5;
export const RECO_MIN_IMBALANCE = 0.12;
export const RECO_MAX = 3;
export const WOMEN_CARS = new Set<number>([1, 6]);
export const DISTANCE_WEIGHT = 0.15;
export const OCCUPANCY_WEIGHT = 0.55;
export const BALANCE_WEIGHT = 0.3;
export const RECO_CONFIDENCE_CEILING = 0.97;
export const RECO_CONFIDENCE_BOOST = 0.3;

/** Door automation. */
export const DOOR_MIDDLE_OPEN_ON_RED = true;
export const DOOR_TARGET_CAPACITY_MAX = 0.7;

/** CALES bogie maintenance. */
export const CALES_HISTORY_SIZE = 100;
export const CALES_WHEEL_FLANGE_NOMINAL_MONTHS = 12;
export const CALES_AIR_SPRING_NOMINAL_MONTHS = 192;
export const CALES_CHEVRON_RUBBER_NOMINAL_MONTHS = 72;

export const PREDICTION_HORIZON_MINUTES = 15;

/** Simulation tick (mirrors `simulate_occupancy_change`).
 *  4 dtk — cukup renyah agar grafik & indikator terlihat berubah. */
export const SIMULATION_TICK_MS = 4000;
export const SIMULATION_JITTER = 0.03;

/** Jeda minimum antar pengumuman suara (agar kalimat tidak terpotong).
 *  Dipisah dari laju data — data visual boleh cepat, suara tetap tenang. */
export const ANNOUNCE_MIN_GAP_MS = 18000;
