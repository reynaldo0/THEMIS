import { Megaphone } from "lucide-react";
import { useThemisStore } from "@/store/useThemisStore";

export function AnnouncementBar() {
  const announcement = useThemisStore((s) => s.announcement);
  if (!announcement) return null;

  return (
    <div className="pointer-events-auto glass flex items-center gap-3 overflow-hidden rounded-xl px-3 py-2">
      <span className="flex shrink-0 items-center gap-1.5 rounded-md bg-primary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
        <Megaphone size={11} /> Siaran
      </span>
      <div className="relative flex-1 overflow-hidden">
        <div className="animate-marquee flex w-max gap-16 whitespace-nowrap text-[12px] text-slate-700">
          <span>{announcement.text}</span>
          <span aria-hidden>{announcement.text}</span>
        </div>
      </div>
    </div>
  );
}
