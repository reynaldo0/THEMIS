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
  const womenId = WOMEN_CARS.has(to)
    ? " Gerbong tujuan ini juga gerbong khusus wanita."
    : "";
  const womenEn = WOMEN_CARS.has(to)
    ? " Please note the destination carriage is also a women-only carriage."
    : "";

  const textId =
    `Perhatian, Bapak dan Ibu penumpang. Gerbong ${from} sudah cukup padat ya. ` +
    `Kalau mau lebih lega, silakan berpindah ke gerbong ${to}, masih ada sekitar ${free} persen ruang kosong di sana.` +
    womenId +
    ` Tetap berpegangan dan jaga barang bawaan Anda. Terima kasih.`;

  const textEn =
    `Attention, passengers. Carriage ${from} is getting quite crowded. ` +
    `If you would like more space, please move to carriage ${to}, where about ${free} percent is still free.` +
    womenEn +
    ` Please hold on and keep an eye on your belongings. Thank you.`;

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
