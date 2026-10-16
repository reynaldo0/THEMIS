import { useEffect, useState } from "react";
import { Volume2, VolumeX, Wifi, WifiOff, Home } from "lucide-react";
import { useThemisStore, useStation, useTrainSummary } from "@/store/useThemisStore";
import { percent } from "@/lib/format";
import { FORMATION, TRAIN_ID } from "@/lib/constants";
import { StatusPill } from "@/components/ui/KpiCard";

interface HeaderProps {
  voiceEnabled: boolean;
  onToggleVoice: () => void;
}

export function Header({ voiceEnabled, onToggleVoice }: HeaderProps) {
  const summary = useTrainSummary();
  const station = useStation();
  const isLive = useThemisStore((s) => s.isLive);
  const tick = useThemisStore((s) => s.tick);
  const [clock, setClock] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="glass z-30 flex h-14 shrink-0 items-center justify-between gap-3 rounded-2xl px-3 sm:h-16 sm:px-4">
      <div className="flex min-w-0 items-center gap-2.5">
        <a
          href="#/"
          title="Kembali ke beranda"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary sm:h-10 sm:w-10"
        >
          <img src="/themis-icon.svg" alt="THEMIS" className="h-5 w-5 sm:h-6 sm:w-6" />
        </a>
        <div className="min-w-0">
          <h1 className="truncate font-display text-[15px] font-bold leading-none tracking-tight sm:text-[17px]">
            <span className="gradient-text">PROJECT THEMIS</span>{" "}
            <span className="hidden text-muted sm:inline">· 3D Twin</span>
          </h1>
          <p className="mt-1 hidden text-[11px] text-faint sm:block">
            Spatial Occupancy Intelligence · {TRAIN_ID} · Formasi {FORMATION}
          </p>
          <p className="mt-1 text-[10px] text-faint sm:hidden">{station.name}</p>
        </div>
      </div>

      <div className="hidden items-center gap-2 lg:flex">
        <StatusPill label={isLive ? "Live" : "Paused"} color={isLive ? "#16A34A" : "#F59E0B"} pulse={isLive} />
        <span className="glass-soft rounded-full px-3 py-1.5 font-mono text-[11px] text-muted">
          {station.name} · tick {tick}
        </span>
        <span className="glass-soft rounded-full px-3 py-1.5 font-mono text-[11px] font-semibold text-primary">
          {percent(summary.avgOccupancy, 1)} avg
        </span>
        <span className="glass-soft rounded-full px-3 py-1.5 font-mono text-[11px] text-muted">
          {summary.redCars}R · {summary.yellowCars}Y · {summary.greenCars}G
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <a
          href="#/"
          title="Beranda"
          className="glass-soft rounded-xl p-2 text-muted transition hover:text-ink"
        >
          <Home size={16} />
        </a>
        <button
          onClick={onToggleVoice}
          title={voiceEnabled ? "Matikan suara pengumuman" : "Nyalakan suara pengumuman"}
          className="glass-soft rounded-xl p-2 text-muted transition hover:text-ink"
        >
          {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
        <div className="glass-soft hidden items-center gap-2 rounded-xl px-3 py-2 sm:flex">
          {isLive ? <Wifi size={14} className="text-green" /> : <WifiOff size={14} className="text-yellow" />}
          <div className="text-right leading-none">
            <div className="font-mono text-[13px] font-semibold text-ink">
              {clock.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </div>
            <div className="mt-0.5 text-[9px] uppercase tracking-wider text-faint">
              {clock.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "short" })}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
