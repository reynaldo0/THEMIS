import { TrainFront, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { useThemisStore } from "@/store/useThemisStore";
import { DENSITY_COLOR, DENSITY_LABEL, percent } from "@/lib/format";
import { WOMEN_CARS } from "@/lib/constants";
import { Female } from "@/components/icons/Female";
import { cn } from "@/lib/cn";

/** Tabel status per gerbong — mirror `TrainOverview` web utama. */
export function CarOverviewPanel() {
  const cars = useThemisStore((s) => s.cars);
  const selectedCarId = useThemisStore((s) => s.selectedCarId);
  const selectCar = useThemisStore((s) => s.selectCar);
  const redistribution = useThemisStore((s) => s.redistribution);

  return (
    <Panel
      title="Status Gerbong"
      icon={<TrainFront size={13} />}
      action={
        <span className="text-[10px] text-faint">
          {cars.length} gerbong · <span className="text-pink-500">1 &amp; 6 wanita</span>
        </span>
      }
      bodyClassName="px-2.5 py-2"
    >
      <ul className="space-y-1">
        {cars.map((car) => {
          const color = DENSITY_COLOR[car.densityIndicator];
          const isSelected = selectedCarId === car.carId;
          const isSource = redistribution?.fromCarId === car.carId;
          const isTarget = redistribution?.toCarId === car.carId;
          return (
            <li key={car.carId}>
              <button
                onClick={() => selectCar(isSelected ? null : car.carId)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg border px-2 py-1.5 text-left transition",
                  isSelected
                    ? "border-primary/30 bg-primary/5"
                    : "border-transparent hover:border-line hover:bg-slate-50",
                  isSource && "border-red-300 bg-red-50/50",
                  isTarget && "border-green-300 bg-green-50/50",
                )}
              >
                <span className="h-7 w-1 shrink-0 rounded-full" style={{ background: color }} />
                <span className="w-9 font-mono text-[11px] font-bold text-muted">
                  G{String(car.carId).padStart(2, "0")}
                </span>
                {WOMEN_CARS.has(car.carId) && <Female className="h-3 w-3 shrink-0 text-pink-500" />}
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between text-[10px]">
                    <span style={{ color }} className="font-semibold">
                      {DENSITY_LABEL[car.densityIndicator]}
                    </span>
                    <span className="font-mono text-ink">{percent(car.occupancyRatio)}</span>
                  </span>
                  <span className="mt-0.5 block h-1 overflow-hidden rounded-full bg-slate-200">
                    <span
                      className="block h-full rounded-full transition-all duration-500"
                      style={{ width: `${car.occupancyRatio * 100}%`, background: color }}
                    />
                  </span>
                </span>
                {car.prediction.trend === "increasing" ? (
                  <TrendingUp size={12} className="shrink-0 text-red-500" />
                ) : car.prediction.trend === "decreasing" ? (
                  <TrendingDown size={12} className="shrink-0 text-green-600" />
                ) : (
                  <Minus size={12} className="shrink-0 text-slate-400" />
                )}
                {isSource && (
                  <span className="animate-pulse-dot rounded bg-red-500 px-1 py-px text-[8px] font-bold uppercase text-white">
                    Penuh
                  </span>
                )}
                {isTarget && (
                  <span className="animate-pulse-dot rounded bg-green-600 px-1 py-px text-[8px] font-bold uppercase text-white">
                    Tujuan
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
