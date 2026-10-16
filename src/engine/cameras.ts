import { NUM_CAMERAS_PER_CAR, TOTAL_CARS } from "@/lib/constants";
import type { CameraInfo } from "@/types";

const POSITION_LABEL = ["front_left", "front_right", "rear_left", "rear_right"] as const;

/**
 * 40 ceiling fisheye cameras — `car01_cam01` .. `car10_cam04`
 * (4 cameras per carriage, matching the documented SF10 lookup table).
 */
export const CAMERAS: CameraInfo[] = Array.from({ length: TOTAL_CARS }, (_, carIdx) => {
  const car = carIdx + 1;
  return Array.from({ length: NUM_CAMERAS_PER_CAR }, (_, camIdx) => {
    return {
      id: `car${String(car).padStart(2, "0")}_cam${String(camIdx + 1).padStart(2, "0")}`,
      type: "ceiling_fisheye" as const,
      zone: `car_${car}_${POSITION_LABEL[camIdx]}`,
      carMapping: car,
      status: "online" as const,
      resolution: "640x640",
    };
  });
}).flat();

export function camerasForCar(carId: number): CameraInfo[] {
  return CAMERAS.filter((c) => c.carMapping === carId);
}
