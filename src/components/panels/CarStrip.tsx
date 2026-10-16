import { Female } from "@/components/icons/Female";
import { useThemisStore } from "@/store/useThemisStore";
import { DENSITY_COLOR, DENSITY_LABEL, percent } from "@/lib/format";
import { WOMEN_CARS } from "@/lib/constants";
import { cn } from "@/lib/cn";

/**
 * Strip gerbong di bawah viewport — mirror `TrainOverview`:
 * badge "Penuh" (sumber) & "Tujuan" (target), gerbong wanita 1 & 6,
 * tren prediksi per gerbong.
 */
export function CarStrip() {
  const cars = useThemisStore((s) => s.cars);
  const selectedCarId = useThemisStore((s) => s.selectedCarId);
  const hoveredCarId = useThemisStore((s) => s.hoveredCarId);
  const selectCar = useThemisStore((s) => s.selectCar);
  const hoverCar = useThemisStore((s) => s.hoverCar);
  const redistribution = useThemisStore((s) => s.redistribution);

  return (
    <div className="pointer-events-auto">
      <div className="scrollbar-slim flex items-stretch gap-1.5 overflow-x-auto rounded-2xl p-2">
        {cars.map((car) => {
          const color = DENSITY_COLOR[car.densityIndicator];
          const active = selectedCarId === car.carId || hoveredCarId === car.carId;
          const isSource = redistribution?.fromCarId === car.carId;
          const isTarget = redistribution?.toCarId === car.carId;
          const isWomen = WOMEN_CARS.has(car.carId);
          return (
            <button
              key={car.carId}
              onClick={() => selectCar(car.carId === selectedCarId ? null : car.carId)}
              onMouseEnter={() => hoverCar(car.carId)}
              onMouseLeave={() => hoverCar(null)}
              className={cn(
                "relative w-[92px] shrink-0 rounded-xl border bg-white px-2 py-1.5 text-left transition",
                active ? "border-primary/40 shadow-sm" : "border-line hover:border-primary/25",
              )}
              style={
                isSource
                  ? { borderColor: "rgba(237,36,43,.55)", boxShadow: "0 0 0 2px rgba(237,36,43,.12)" }
                  : isTarget
                    ? { borderColor: "rgba(22,163,74,.55)", boxShadow: "0 0 0 2px rgba(22,163,74,.12)" }
                    : undefined
              }
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-muted">
                  G{String(car.carId).padStart(2, "0")}
                </span>
                {isWomen && <Female className="h-3 w-3 text-pink-500" />}
              </div>
              <div className="mt-0.5 font-display text-[15px] font-bold leading-none" style={{ color }}>
                {percent(car.occupancyRatio)}
              </div>
              <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${car.occupancyRatio * 100}%`, background: color }}
                />
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-[8.5px] font-semibold uppercase tracking-wider" style={{ color }}>
                  {DENSITY_LABEL[car.densityIndicator]}
                </span>
                {car.prediction.trend === "increasing" && <span className="text-[9px] text-red-500">▲</span>}
                {car.prediction.trend === "decreasing" && <span className="text-[9px] text-green-600">▼</span>}
              </div>
              {isSource && (
                <span className="animate-badge-bob absolute -top-2 left-1/2 rounded-full bg-red-500 px-1.5 py-px text-[8px] font-bold uppercase tracking-wider text-white shadow">
                  Penuh
                </span>
              )}
              {isTarget && (
                <span
                  className="animate-badge-bob absolute -top-2 left-1/2 rounded-full bg-green-600 px-1.5 py-px text-[8px] font-bold uppercase tracking-wider text-white shadow"
                  style={{ animationDelay: "0.3s" }}
                >
                  Tujuan
                </span>
              )}
            </button>
          );
        })}
      </div>
      {redistribution && (
        <div className="mt-1.5 text-center text-[10.5px] text-muted">
          <span className="rounded-md bg-white px-2 py-0.5 shadow-sm">
            <span className="font-semibold text-red-600">Penuh</span> · Pindah Penumpang · Gerbong{" "}
            {redistribution.fromCarId} <span className="font-bold text-secondary">→</span> Gerbong{" "}
            {redistribution.toCarId} · <span className="font-semibold text-green-700">Tujuan</span> · selisih{" "}
            {percent(redistribution.occupancyDiff)}
          </span>
        </div>
      )}
    </div>
  );
}
