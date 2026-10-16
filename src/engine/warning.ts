import type { CarOccupancy, Warning } from "@/types";

/**
 * Warning generation — mirrors `StateManager` / `DecisionEngine.evaluate`.
 *
 *   RED    -> warning_type RED_DENSITY,    severity CRITICAL
 *   YELLOW -> warning_type YELLOW_DENSITY, severity WARNING
 *   GREEN  -> none
 */
export function generateWarnings(cars: CarOccupancy[], trainId: string): Warning[] {
  const now = new Date().toISOString();
  const warnings: Warning[] = [];

  for (const car of cars) {
    if (car.densityIndicator === "RED") {
      warnings.push({
        id: `${trainId}-${car.carId}-RED_DENSITY`,
        trainId,
        carId: car.carId,
        warningType: "RED_DENSITY",
        severity: "CRITICAL",
        message: `Car ${car.carId} is RED density (occupancy: ${(car.occupancyRatio * 100).toFixed(1)}%)`,
        timestamp: now,
        isActive: true,
      });
    } else if (car.densityIndicator === "YELLOW") {
      warnings.push({
        id: `${trainId}-${car.carId}-YELLOW_DENSITY`,
        trainId,
        carId: car.carId,
        warningType: "YELLOW_DENSITY",
        severity: "WARNING",
        message: `Car ${car.carId} is YELLOW density (occupancy: ${(car.occupancyRatio * 100).toFixed(1)}%)`,
        timestamp: now,
        isActive: true,
      });
    }
  }

  return warnings.sort((a, b) => b.carId - a.carId);
}

export const SEVERITY_ORDER: Record<Warning["severity"], number> = {
  CRITICAL: 3,
  WARNING: 2,
  INFO: 1,
};

export function highestSeverity(warnings: Warning[]): Warning["severity"] | null {
  if (warnings.length === 0) return null;
  return warnings.reduce<Warning["severity"]>(
    (acc, w) => (SEVERITY_ORDER[w.severity] > SEVERITY_ORDER[acc] ? w.severity : acc),
    "INFO",
  );
}

export function getLedState(density: string): string {
  return density === "GREEN" || density === "YELLOW" || density === "RED" ? density : "OFF";
}

export function getAudioEvent(density: string): string | null {
  if (density === "YELLOW") return "warning_chime";
  if (density === "RED") return "alert_tone";
  return null;
}
