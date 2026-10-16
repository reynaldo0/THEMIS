import { useEffect, useState } from "react";
import { Volume2, VolumeX, Wifi, WifiOff, Home } from "lucide-react";
import { useThemisStore, useStation, useTrainSummary } from "@/store/useThemisStore";
import { percent } from "@/lib/format";
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
        <a href="#/" title="Kembali ke beranda" className="flex min-w-0 items-center">
          <img
            src="/themis-logo.png"
            alt="THEMIS — Spatial Occupancy Intelligence"
            className="h-6 w-auto sm:h-8"
          />
        </a>
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
