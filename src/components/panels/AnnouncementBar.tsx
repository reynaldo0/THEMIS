import { Megaphone } from "lucide-react";
import { useThemisStore } from "@/store/useThemisStore";

export function AnnouncementBar() {
  const announcement = useThemisStore((s) => s.announcement);
  if (!announcement) return null;

  return (
    <div className="pointer-events-auto glass flex items-start gap-3 rounded-xl px-3 py-2.5">
      <span className="mt-0.5 flex shrink-0 items-center gap-1.5 rounded-md bg-primary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
        <Megaphone size={11} /> Siaran
      </span>
      <div className="min-w-0">
        <p className="text-[12px] leading-snug text-slate-700">{announcement.textId ?? announcement.text}</p>
        <p className="mt-1 border-t border-line/70 pt-1 text-[11px] leading-snug text-faint">
          {announcement.textEn}
        </p>
      </div>
    </div>
  );
}
