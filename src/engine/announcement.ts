import type { Announcement, RedistributionResult } from "@/types";
import { WOMEN_CARS } from "@/lib/constants";

/**
 * Announcement engine — mirror dari `backend/app/ai/announcement_engine.py`,
 * namun versi twin ini menghasilkan dua bahasa sekaligus:
 *
 *   - text / textId : bahasa Indonesia (diucapkan lebih dulu)
 *   - textEn        : bahasa Inggris (diucapkan setelahnya)
 *
 * Nada dibuat natural seperti pengumuman di dalam kereta (tidak kaku), tetap
 * informatif: menyebut gerbong asal, gerbong tujuan, sisa ruang, dan catatan
 * gerbong khusus wanita bila relevan.
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
  const from = redistribution.fromCarId;
  if (to == null) return null;

  const free = Math.round((1 - redistribution.toOccupancy) * 100);
  const womenId = WOMEN_CARS.has(to) ? " Gerbong tujuan khusus penumpang wanita." : "";
  const womenEn = WOMEN_CARS.has(to) ? " This is a women-only carriage." : "";

  const textId =
    `Perhatian, Bapak dan Ibu penumpang. Gerbong ${from} sedang padat. ` +
    `Silakan beralih ke gerbong ${to}, tersisa sekitar ${free} persen ruang kosong.` +
    womenId +
    ` Terima kasih.`;

  const textEn =
    `Attention, passengers. Carriage ${from} is crowded. ` +
    `Please move to carriage ${to}, about ${free} percent of the space is still free.` +
    womenEn +
    ` Thank you.`;

  return {
    type: "REDISTRIBUTION",
    text: textId,
    textId,
    textEn,
    fromCarId: from,
    toCarId: to,
    priority: "HIGH",
  };
}
