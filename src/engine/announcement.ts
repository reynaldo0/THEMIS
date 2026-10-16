import type { Announcement, RedistributionResult } from "@/types";

/**
 * Announcement engine — mirrors `backend/app/ai/announcement_engine.py`.
 *
 *   "Carriage {to} has available capacity ({free}% free).
 *    Passengers in Carriage {from} are advised to move to Carriage {to}."
 */
export function generateAnnouncement(
  redistribution: RedistributionResult | null,
): Announcement | null {
  if (!redistribution) return null;
  if (
    redistribution.action !== "REDISTRIBUTION" &&
    redistribution.action !== "GLOBAL_REDISTRIBUTION"
  ) {
    return null;
  }
  const to = redistribution.toCarId;
  if (to == null) return null;

  const availablePct = Math.round((1 - redistribution.toOccupancy) * 100);

  return {
    type: "REDISTRIBUTION",
    text: `Carriage ${to} has available capacity (${availablePct}% free). Passengers in Carriage ${redistribution.fromCarId} are advised to move to Carriage ${to}.`,
    fromCarId: redistribution.fromCarId,
    toCarId: to,
    priority: "HIGH",
  };
}
