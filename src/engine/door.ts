import {
  DOOR_MIDDLE_OPEN_ON_RED,
  DOOR_TARGET_CAPACITY_MAX,
} from "@/lib/constants";
import { carCode } from "@/lib/format";
import type { CarOccupancy, DoorState, RedistributionResult } from "@/types";

/**
 * Door engine — mirrors `backend/app/ai/door_engine.py`.
 *
 * Doors only open when the carriage is RED *and* a valid redistribution
 * target with capacity exists (targetOccupancy < 0.7).
 */
export function evaluateDoor(
  car: CarOccupancy,
  redistribution: RedistributionResult | null,
): DoorState {
  const base = { carId: car.carId, densityIndicator: car.densityIndicator };

  if (car.densityIndicator === "RED") {
    if (redistribution && redistribution.toCarId != null) {
      const target = redistribution.toOccupancy;
      if (DOOR_MIDDLE_OPEN_ON_RED && target < DOOR_TARGET_CAPACITY_MAX) {
        return {
          ...base,
          doorAction: "OPEN_MIDDLE",
          reason: `RED density with redistribution target Car ${redistribution.toCarId} (${pct(
            target,
          )})`,
        };
      }
      return {
        ...base,
        doorAction: "CLOSE",
        reason: `RED density but target Car ${redistribution.toCarId} is also busy (${pct(target)})`,
      };
    }
    return { ...base, doorAction: "CLOSE", reason: "RED density but no valid redistribution target" };
  }

  if (car.densityIndicator === "YELLOW") {
    return { ...base, doorAction: "CLOSE", reason: "YELLOW density - door remains closed, monitoring" };
  }

  return { ...base, doorAction: "CLOSE", reason: "GREEN density - no action needed" };
}

export function doorState(doorAction: DoorState["doorAction"]) {
  if (doorAction === "OPEN_MIDDLE") {
    return { isOpen: true, animationState: "OPENING" as const, doorPosition: "MIDDLE" as const };
  }
  return { isOpen: false, animationState: "CLOSING" as const, doorPosition: "MIDDLE" as const };
}

export function doorLabel(doorAction: DoorState["doorAction"]): string {
  return doorAction === "OPEN_MIDDLE" ? "Pintu tengah terbuka" : "Pintu tertutup";
}

export { carCode };
function pct(v: number): string {
  return `${Math.round(v * 100)}%`;
}
