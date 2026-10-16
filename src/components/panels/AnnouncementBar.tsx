import { Megaphone } from "lucide-react";
import { useThemisStore } from "@/store/useThemisStore";
import { cn } from "@/lib/cn";

/**
 * Pita pengumuman suara. `compact` dipakai di mobile (di bawah viewport 3D):
 * hanya teks Indonesia dan maksimal dua baris agar tidak menutupi objek.
 */
export function AnnouncementBar({ compact = false }: { compact?: boolean }) {
  const announcement = useThemisStore((s) => s.announcement);
  if (!announcement) return null;

  return (
    <div className={cn("glass flex items-start", compact ? "gap-2.5 rounded-xl px-2.5 py-2" : "gap-3 rounded-xl px-3 py-2.5")}>
      <span
        className={cn(
          "flex shrink-0 items-center gap-1.5 rounded-md bg-primary/10 font-bold uppercase tracking-widest text-primary",
          compact ? "px-1.5 py-1 text-[9px]" : "mt-0.5 px-2 py-1 text-[10px]",
        )}
      >
        <Megaphone size={compact ? 10 : 11} /> Siaran
      </span>
      <div className="min-w-0">
        <p className={cn("leading-snug text-slate-700", compact ? "line-clamp-2 text-[11px]" : "text-[12px]")}>
          {announcement.textId ?? announcement.text}
        </p>
        {!compact && (
          <p className="mt-1 border-t border-line/70 pt-1 text-[11px] leading-snug text-faint">
            {announcement.textEn}
          </p>
        )}
      </div>
    </div>
  );
}
