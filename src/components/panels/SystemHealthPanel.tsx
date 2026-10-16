import { Server, Cpu, Database, Radio, Box, Video, Sparkles, Timer } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { useThemisStore, useTrainSummary } from "@/store/useThemisStore";

/** Mirror `SystemHealth.tsx` — 8 check, mode simulasi lokal. */
export function SystemHealthPanel() {
  const tick = useThemisStore((s) => s.tick);
  const tickMs = useThemisStore((s) => s.tickMs);
  const summary = useTrainSummary();

  const uptimeMinutes = Math.floor((tick * tickMs) / 60000);
  const uptimeSec = (tick * tickMs) / 1000;

  const items = [
    { icon: Server, label: "Backend", value: "Simulasi Lokal", status: "ok" as const },
    { icon: Cpu, label: "Spatial Engine", value: "Heuristic Mode", status: "ok" as const },
    { icon: Database, label: "Database", value: "Dummy In-Memory", status: "ok" as const },
    { icon: Radio, label: "WebSocket", value: "Stub · siap /ws", status: "warning" as const },
    { icon: Box, label: "Unity / Blender", value: "Pipeline siap", status: "warning" as const },
    { icon: Video, label: "Kamera", value: `${summary.camerasOnline} / 40 active`, status: "ok" as const },
    { icon: Sparkles, label: "AI Pipeline", value: "9 Engines Active", status: "ok" as const },
    {
      icon: Timer,
      label: "Uptime",
      value: uptimeSec < 60 ? `${Math.round(uptimeSec)}s` : `${uptimeMinutes}m`,
      status: "ok" as const,
    },
  ];

  const statusColor = { ok: "#16A34A", warning: "#F59E0B", error: "#ED242B" };
  const okCount = items.filter((i) => i.status === "ok").length;

  return (
    <Panel
      title="System Health"
      action={
        <span className="font-mono text-[10px] font-semibold text-green">
          {okCount}/{items.length} OK
        </span>
      }
      bodyClassName="px-3 py-2.5"
    >
      <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
        {items.map((item) => (
          <li
            key={item.label}
            className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5"
          >
            <span className="flex min-w-0 items-center gap-1.5 text-[11px] text-muted">
              <item.icon size={11} className="shrink-0 text-faint" />
              <span className="truncate">{item.label}</span>
            </span>
            <span className="flex shrink-0 items-center gap-1.5">
              <span className="truncate font-mono text-[10px] text-ink">{item.value}</span>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: statusColor[item.status] }} />
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
