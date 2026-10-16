/**
 * PROJECT THEMIS — Shared domain types.
 *
 * The shapes here intentionally mirror the PROJECT THEMIS v6 JSON contract
 * (PipelineState, CarSpatialOccupancy, Warning, Decision, Recommendation)
 * so the 3D twin can later be wired to the real FastAPI backend by simply
 * swapping the dummy data source for the WebSocket feed.
 */

export type DensityIndicator = "GREEN" | "YELLOW" | "RED";
export type CalesStatus = "GREEN" | "YELLOW" | "ORANGE" | "RED";
export type Trend = "increasing" | "decreasing" | "stable";
export type Severity = "INFO" | "WARNING" | "CRITICAL";
export type DoorAction = "OPEN_MIDDLE" | "CLOSE";
export type CameraStatus = "online" | "offline" | "degraded";

export type ScenarioName =
  | "empty"
  | "normal"
  | "peak_hour"
  | "holiday"
  | "imbalanced"
  | "emergency";

export interface Prediction {
  trend: Trend;
  predictedOccupancyRatio: number;
  confidence: number;
  horizonMinutes: number;
}

export interface CarOccupancy {
  carId: number;
  occupancyRatio: number;
  freeSpaceRatio: number;
  densityIndicator: DensityIndicator;
  spatialOccupancyScore: number;
  riskScore: number;
  floorAreaM2: number;
  cameraId: string;
  cameraStatus: "active" | "inactive";
  capacity: number;
  passengers: number;
  prediction: Prediction;
  timestamp: string;
}

export interface Warning {
  id: string;
  trainId: string;
  carId: number;
  warningType: string;
  severity: Severity;
  message: string;
  timestamp: string;
  isActive: boolean;
}

export interface RecommendationItem {
  action: "REDISTRIBUTION";
  fromCarId: number;
  toCarId: number;
  confidence: number;
  reason: string;
  priority: number;
  label: string;
  isWomenPriority: boolean;
  score: number;
}

export interface Recommendation {
  fromCarId: number;
  fromOccupancy: number;
  congestionAvg: number;
  highestOccupancy: number;
  recommendedCars: number[];
  recommendations: RecommendationItem[];
  timestamp: string;
}

export interface RedistributionResult {
  action: "REDISTRIBUTION" | "GLOBAL_REDISTRIBUTION";
  fromCarId: number;
  toCarId: number;
  fromOccupancy: number;
  toOccupancy: number;
  occupancyDiff: number;
  confidence: number;
  reason: string;
}

export interface DoorState {
  carId: number;
  doorAction: DoorAction;
  densityIndicator: DensityIndicator;
  reason: string;
}

export interface Announcement {
  type: "REDISTRIBUTION";
  text: string;
  fromCarId: number;
  toCarId: number;
  priority: "HIGH";
}

export interface CalesMetrics {
  carId: number;
  calesScore: number;
  status: CalesStatus;
  healthIndex: number;
  damageMultiplier: number;
  asymmetryRatio: number;
  severityWeight: number;
  durationFactor: number;
  recommendedAction: string;
  inspectionPriority: number;
  rul: CalesRul;
}

export interface CalesRul {
  wheelFlangeRul: number;
  airSpringRul: number;
  chevronRubberRul: number;
  damageMultiplier: number;
}

export interface CalesOpex {
  wheelReprofileEst: number;
  airSpringOverhaulEst: number;
  catastrophicRiskEst: number;
  totalPotentialCost: number;
}

export interface PipelineState {
  carId: string;
  occupancyRatio: number;
  freeSpaceRatio: number;
  densityIndicator: DensityIndicator;
  spatialOccupancyScore: number;
  recommendedTarget: number | null;
  doorAction: DoorAction;
  announcement: string | null;
  calesScore: number;
  healthIndex: number;
  damageMultiplier: number;
  inspectionPriority: number;
  recommendedAction: string;
  timestamp: string;
}

export interface CameraInfo {
  id: string;
  type: "ceiling_fisheye";
  zone: string;
  carMapping: number;
  status: CameraStatus;
  resolution: string;
}

export interface Station {
  id: string;
  name: string;
  code: string;
  distanceKm: number;
}

export interface HistoryRecord {
  timestamp: string;
  carId: number;
  occupancyRatio: number;
  freeSpaceRatio: number;
  spatialOccupancyScore: number;
  densityIndicator: DensityIndicator;
  cameraId: string;
  stationId: string;
}

export interface HistorySummary {
  averageOccupancy: number;
  peakOccupancy: number;
  peakTime: string;
  totalRecords: number;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  type: string;
  message: string;
  severity: "info" | "warning" | "success";
}

export interface TrainInfo {
  id: string;
  formation: string;
  totalCars: number;
  capacityPerCar: number;
  floorAreaM2: number;
  avgOccupancyRatio: number;
  greenCars: number;
  yellowCars: number;
  redCars: number;
  totalPassengers: number;
}

export interface ScenarioMeta {
  name: ScenarioName;
  label: string;
  tagline: string;
  description: string;
  pattern: string;
  accent: string;
}
