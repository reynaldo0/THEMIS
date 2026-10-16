import { ListTree } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { useThemisStore } from "@/store/useThemisStore";
import { formatClock } from "@/lib/format";

const TYPE_COLOR: Record<string, string> = {
  WARNING: "#ED242B",
  RECOVERY: "#16A34A",
  RECOMMENDATION: "#2D2A70",
  SCENARIO: "#EC6C25",
  SYSTEM: "#94A3B8",
};

export function TimelinePanel() {
  const eventLog = useThemisStore((s) => s.eventLog);

  return (
    <Panel title="Riwayat Aktivitas" icon={<ListTree size={13} />} bodyClassName="px-2.5 py-2.5">
      <ul className="scrollbar-slim relative max-h-[210px] space-y-2 overflow-y-auto pr-1.5">
        <span className="absolute bottom-1 left-[7px] top-1 w-px bg-slate-200" aria-hidden />
        {eventLog.map((e) => {
          const color = TYPE_COLOR[e.type] ?? "#2D2A70";
          return (
            <li key={e.id} className="relative pl-5">
              <span
                className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full border-2 bg-white"
                style={{ borderColor: color }}
              />
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color }}>
                  {e.type}
                </span>
                <span className="font-mono text-[9px] text-faint">{formatClock(e.timestamp)}</span>
              </div>
              <p className="mt-0.5 text-[11px] leading-snug text-muted">{e.message}</p>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
