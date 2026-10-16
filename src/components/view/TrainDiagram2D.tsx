import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { useThemisStore, useStation } from "@/store/useThemisStore";
import { DENSITY_COLOR, DENSITY_LABEL, percent } from "@/lib/format";
import { WOMEN_CARS, TRAIN_ID, FORMATION } from "@/lib/constants";
import { SCENARIOS } from "@/engine/scenarios";
import { Female } from "@/components/icons/Female";
import { cn } from "@/lib/cn";

/**
 * Skema 2D satu gerbong-per-blok (side elevation) — mengikuti gaya web
 * frontend utama: blok warna density, pintu beranimasi, badge
 * Penuh/Tujuan, dan alur "Pindah Penumpang" beranimasi di atas kereta.
 */
export function TrainDiagram2D() {
  const cars = useThemisStore((s) => s.cars);
  const doorStates = useThemisStore((s) => s.doorStates);
  const redistribution = useThemisStore((s) => s.redistribution);
  const selectedCarId = useThemisStore((s) => s.selectedCarId);
  const selectCar = useThemisStore((s) => s.selectCar);
  const tick = useThemisStore((s) => s.tick);
  const scenario = useThemisStore((s) => s.scenario);
  const station = useStation();

  const from = redistribution?.fromCarId;
  const to = redistribution?.toCarId;

  // Posisi pusat blok sebagai % lebar baris kereta (10 blok sama lebar).
  const centerPct = (carId: number) => ((carId - 0.5) / cars.length) * 100;

  return (
    <div className="scrollbar-slim h-full w-full overflow-auto bg-gradient-to-b from-[#f5f7fc] to-[#e7ecf8] p-3 sm:p-4">
      <div className="mx-auto flex h-full min-h-[260px] min-w-[780px] max-w-4xl flex-col">
        {/* Header stasiun */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-primary px-3 py-1.5 text-center shadow-sm">
              <div className="text-[11px] font-bold tracking-[0.18em] text-white">
                {station.name.toUpperCase()}
              </div>
              <div className="text-[7.5px] tracking-[0.3em] text-white/70">STASIUN · {station.code}</div>
            </div>
            <div className="text-[11px] leading-tight text-muted">
              <div className="font-semibold text-ink">
                {TRAIN_ID} · Formasi {FORMATION}
              </div>
              <div>
                Skenario <span className="font-semibold text-ink">{SCENARIOS[scenario].label}</span> · tick {tick}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <DotLegend color="#16A34A" label="Kosong" />
            <DotLegend color="#F59E0B" label="Sedang" />
            <DotLegend color="#ED242B" label="Penuh" />
          </div>
        </div>

        {/* Jalur alur redistribusi (di atas kereta) */}
        <div className="relative mt-3 h-11">
          {from != null && to != null && (
            <FlowTrack
              key={`${from}-${to}`}
              leftPct={Math.min(centerPct(from), centerPct(to))}
              widthPct={Math.abs(centerPct(to) - centerPct(from))}
              fromCarId={from}
              toCarId={to}
            />
          )}
        </div>

        {/* Baris kereta */}
        <div className="relative">
          <div className="flex items-end gap-1">
            {cars.map((car) => {
              const color = DENSITY_COLOR[car.densityIndicator];
              const isSelected = selectedCarId === car.carId;
              const isSource = from === car.carId;
              const isTarget = to === car.carId;
              const doorOpen = doorStates[car.carId]?.doorAction === "OPEN_MIDDLE";
              return (
                <button
                  key={car.carId}
                  onClick={() => selectCar(isSelected ? null : car.carId)}
                  className={cn(
                    "relative min-w-0 flex-1 rounded-xl border bg-white pb-3 pt-2.5 text-left transition-all duration-200",
                    isSelected ? "border-primary ring-2 ring-primary/40" : "border-line hover:border-primary/30",
                  )}
                  style={
                    isSource
                      ? { borderColor: "#ED242B", boxShadow: "0 0 0 3px rgba(237,36,43,.15)" }
                      : isTarget
                        ? { borderColor: "#16A34A", boxShadow: "0 0 0 3px rgba(22,163,74,.15)" }
                        : undefined
                  }
                >
                  {/* strip atap */}
                  <span className="absolute inset-x-2 top-0 h-1 rounded-b-full" style={{ background: color }} />

                  {/* badge sumber / tujuan */}
                  {isSource && (
                    <span className="animate-badge-bob absolute -top-2.5 left-1/2 z-10 rounded-full bg-red-500 px-1.5 py-px text-[8px] font-bold uppercase tracking-wider text-white shadow">
                      Penuh
                    </span>
                  )}
                  {isTarget && (
                    <span className="animate-badge-bob absolute -top-2.5 left-1/2 z-10 rounded-full bg-green-600 px-1.5 py-px text-[8px] font-bold uppercase tracking-wider text-white shadow" style={{ animationDelay: "0.3s" }}>
                      Tujuan
                    </span>
                  )}

                  <div className="flex items-center justify-between px-1">
                    <span className="font-mono text-[9px] font-bold text-slate-500">
                      G{String(car.carId).padStart(2, "0")}
                    </span>
                    {WOMEN_CARS.has(car.carId) && <Female className="h-2.5 w-2.5 text-pink-500" />}
                  </div>

                  <div className="mt-0.5 text-center font-display text-[15px] font-bold leading-none" style={{ color }}>
                    {percent(car.occupancyRatio)}
                  </div>
                  <div className="mt-0.5 text-center text-[7.5px] font-semibold uppercase tracking-wider" style={{ color }}>
                    {DENSITY_LABEL[car.densityIndicator]}
                  </div>

                  <div className="mx-1.5 mt-1.5 h-1 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${car.occupancyRatio * 100}%`, background: color }}
                    />
                  </div>

                  {/* Pintu geser */}
                  <div className="mx-auto mt-1.5 flex w-fit items-center gap-[3px]">
                    <span
                      className="h-3.5 w-[9px] rounded-[2px] transition-all duration-500"
                      style={{
                        background: doorOpen ? "rgba(45,42,112,.75)" : "#cbd5e1",
                        transform: doorOpen ? "translateX(-5px)" : "none",
                      }}
                    />
                    <span
                      className="h-3.5 w-[9px] rounded-[2px] transition-all duration-500"
                      style={{
                        background: doorOpen ? "rgba(45,42,112,.75)" : "#cbd5e1",
                        transform: doorOpen ? "translateX(5px)" : "none",
                      }}
                    />
                  </div>

                  {/* Trend */}
                  <div className="mt-1 flex justify-center">
                    {car.prediction.trend === "increasing" ? (
                      <TrendingUp size={11} className="text-red-500" />
                    ) : car.prediction.trend === "decreasing" ? (
                      <TrendingDown size={11} className="text-green-600" />
                    ) : (
                      <Minus size={11} className="text-slate-400" />
                    )}
                  </div>

                  {/* Roda */}
                  <div className="absolute inset-x-3 -bottom-[7px] flex justify-between">
                    <span className="h-2.5 w-2.5 rounded-full border-2 border-slate-400 bg-white" />
                    <span className="h-2.5 w-2.5 rounded-full border-2 border-slate-400 bg-white" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Rel + peron */}
          <div className="mt-2.5 h-[3px] rounded-full bg-slate-400" />
          <div className="mt-1 flex items-center justify-between">
            <span className="rounded-sm bg-warning/15 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-[#b45309]">
              Garis Peron
            </span>
            <span className="text-[10px] text-faint">Gerbong 1 &amp; 6 · gerbong wanita</span>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-auto pt-3">
          {redistribution ? (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-secondary/25 bg-secondary/5 px-3 py-2 text-[11.5px] text-ink">
              <span className="rounded-md bg-red-500 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                G{String(redistribution.fromCarId).padStart(2, "0")}
              </span>
              <span className="font-semibold text-secondary">Pindah Penumpang</span>
              <span className="rounded-md bg-green-600 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                G{String(redistribution.toCarId).padStart(2, "0")}
              </span>
              <span className="text-muted">
                · selisih {percent(redistribution.occupancyDiff)} · confidence {percent(redistribution.confidence)}
              </span>
            </div>
          ) : (
            <div className="text-center text-[11px] text-faint">
              Distribusi seimbang — tidak ada redistribusi aktif.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DotLegend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1 rounded-full border border-line bg-white px-2 py-1 text-[9.5px] font-semibold text-ink">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

/** Track alur penumpang: titik-titik bergerak dari blok sumber ke tujuan. */
function FlowTrack({
  leftPct,
  widthPct,
  fromCarId,
  toCarId,
}: {
  leftPct: number;
  widthPct: number;
  fromCarId: number;
  toCarId: number;
}) {
  const reversed = toCarId < fromCarId;
  return (
    <div className="absolute inset-x-0 top-2" style={{ left: `${leftPct}%`, width: `${widthPct}%` }}>
      {/* Track */}
      <div className="relative h-3 rounded-full border border-secondary/30 bg-gradient-to-r from-red-200/70 via-amber-100/70 to-green-200/70">
        {/* Titik penumpang beranimasi */}
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="flow-dot absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full border border-white shadow-sm"
            style={{
              background: reversed ? "#16A34A" : "#ED242B",
              animationDelay: `${i * 0.4}s`,
            }}
          />
        ))}
        {/* Panah tujuan */}
        <span
          className="absolute -top-1 text-[11px] font-bold"
          style={{ [reversed ? "left" : "right"]: "-4px", color: reversed ? "#16A34A" : "#ED242B" } as React.CSSProperties}
        >
          {reversed ? "◀" : "▶"}
        </span>
      </div>
      {/* Label */}
      <div className="mt-1 flex justify-center">
        <span className="rounded-full border border-secondary/25 bg-white px-2.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-secondary shadow-sm">
          Pindah Penumpang · G{String(fromCarId).padStart(2, "0")} → G{String(toCarId).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}
