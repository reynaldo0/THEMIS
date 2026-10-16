import { Activity, AlertTriangle, Gauge, TrainFront, Users, Video } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { KpiCard, StatusPill } from "@/components/ui/KpiCard";
import { ScenarioSwitcher } from "@/components/panels/ScenarioSwitcher";
import { OccupancyChart } from "@/components/panels/OccupancyChart";
import { percent, DENSITY_LABEL } from "@/lib/format";
import { useThemisStore, useStation, useTrainSummary } from "@/store/useThemisStore";
import { FORMATION, TRAIN_ID, TOTAL_CAMERAS } from "@/lib/constants";
import { cn } from "@/lib/cn";

const legend = [
  { label: DENSITY_LABEL.GREEN, range: "< 40% · lega", color: "#16A34A" },
  { label: DENSITY_LABEL.YELLOW, range: "40–70% · sedang", color: "#F59E0B" },
  { label: DENSITY_LABEL.RED, range: "> 70% · padat", color: "#ED242B" },
];

export function LeftPanel({ className }: { className?: string }) {
  const summary = useTrainSummary();
  const station = useStation();
  const isLive = useThemisStore((s) => s.isLive);
  const toggleLive = useThemisStore((s) => s.toggleLive);
  const nextStation = useThemisStore((s) => s.nextStation);

  return (
    <aside className={cn("scrollbar-slim flex w-full shrink-0 flex-col gap-2.5 lg:w-[292px] lg:overflow-y-auto lg:pb-3 lg:pr-1", className)}>
      <Panel title="Status Kereta" icon={<TrainFront size={13} />}>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="font-display text-lg font-bold text-ink">{TRAIN_ID}</div>
            <div className="text-[11px] text-muted">Formasi {FORMATION} · 10 gerbong</div>
          </div>
          <button
            onClick={toggleLive}
            className="rounded-lg border border-line bg-white px-3 py-1.5 text-[11px] font-semibold text-ink transition hover:border-primary/30"
          >
            {isLive ? "Pause" : "Resume"}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <KpiCard
            label="Okupansi Rata-rata"
            value={percent(summary.avgOccupancy)}
            sub="spatial occupancy"
            icon={<Gauge size={14} />}
            accent="#2D2A70"
          />
          <KpiCard
            label="Penumpang"
            value={summary.totalPassengers.toLocaleString("id-ID")}
            sub="dari 2.000 kapasitas"
            icon={<Users size={14} />}
            accent="#EC6C25"
          />
          <KpiCard
            label="Gerbong Padat"
            value={`${summary.redCars}/10`}
            sub={`${summary.yellowCars} sedang · ${summary.greenCars} lega`}
            icon={<AlertTriangle size={14} />}
            accent="#ED242B"
          />
          <KpiCard
            label="Kamera Aktif"
            value={`${summary.camerasOnline}/${TOTAL_CAMERAS}`}
            sub="fisheye plafon 640×640"
            icon={<Video size={14} />}
            accent="#16A34A"
          />
        </div>
      </Panel>

      <Panel title="Skenario Simulasi" icon={<Activity size={13} />}>
        <ScenarioSwitcher />
      </Panel>

      <Panel title="Perjalanan" icon={<TrainFront size={13} />}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-faint">Posisi</div>
            <div className="font-display text-base font-semibold text-ink">{station.name}</div>
            <div className="text-[11px] text-muted">{station.distanceKm.toFixed(1)} km · arah Bogor</div>
          </div>
          <button
            onClick={nextStation}
            className="rounded-lg border border-primary/25 bg-primary/5 px-3 py-1.5 text-[11px] font-semibold text-primary transition hover:bg-primary/10"
          >
            Maju →
          </button>
        </div>
      </Panel>

      <Panel title="Grafik Okupansi" icon={<Activity size={13} />} bodyClassName="px-2 py-2">
        <OccupancyChart />
      </Panel>

      <Panel title="Legenda Density">
        <ul className="space-y-2">
          {legend.map((l) => (
            <li key={l.label} className="flex items-center justify-between text-[12px]">
              <span className="flex items-center gap-2 text-ink">
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: l.color }} />
                {l.label}
              </span>
              <span className="text-faint">{l.range}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex items-center justify-between border-t border-line/80 pt-3">
          <StatusPill label="Simulation Mode" color="#2D2A70" pulse />
          <span className="text-[10px] text-faint">dummy · siap WS /ws</span>
        </div>
      </Panel>
    </aside>
  );
}
