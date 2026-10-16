import { X, DoorOpen, DoorClosed, HeartPulse, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useThemisStore, useSelectedCar } from "@/store/useThemisStore";
import { DENSITY_COLOR, DENSITY_LABEL, percent } from "@/lib/format";
import { riskLabel } from "@/engine/risk";
import { ACTION_LABEL } from "@/engine/cales";
import { MiniBar, StatusPill } from "@/components/ui/KpiCard";

export function CarDetailPanel() {
  const car = useSelectedCar();
  const doorStates = useThemisStore((s) => s.doorStates);
  const cales = useThemisStore((s) => s.cales);
  const selectCar = useThemisStore((s) => s.selectCar);

  if (!car) return null;

  const color = DENSITY_COLOR[car.densityIndicator];
  const door = doorStates[car.carId];
  const c = cales[car.carId];
  const doorOpen = door?.doorAction === "OPEN_MIDDLE";

  return (
    <motion.div
      key={car.carId}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="glass rounded-2xl"
      style={{ borderColor: `${color}44` }}
    >
      <header className="flex items-center justify-between border-b border-line/80 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: color }} />
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
            Detail Gerbong {String(car.carId).padStart(2, "0")}
          </span>
        </div>
        <button
          onClick={() => selectCar(null)}
          className="rounded-lg p-1 text-faint transition hover:bg-slate-100 hover:text-ink"
        >
          <X size={14} />
        </button>
      </header>

      <div className="space-y-3 px-4 py-3">
        <div className="flex items-end justify-between">
          <div>
            <div className="font-display text-3xl font-bold leading-none" style={{ color }}>
              {percent(car.occupancyRatio)}
            </div>
            <div className="mt-1 text-[11px] text-muted">
              {car.passengers} / {car.capacity} penumpang · {percent(car.freeSpaceRatio)} ruang lega
            </div>
          </div>
          <StatusPill label={DENSITY_LABEL[car.densityIndicator]} color={color} pulse={car.densityIndicator === "RED"} />
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <Stat label="Skor okupansi spasial" value={percent(car.spatialOccupancyScore)} />
          <Stat
            label="Risiko"
            value={`${riskLabel(car.riskScore)} (${car.riskScore.toFixed(1)})`}
            color={car.riskScore > 0.6 ? "#ED242B" : car.riskScore > 0.3 ? "#F59E0B" : "#16A34A"}
          />
          <Stat
            label="Prediksi 15 menit"
            value={`${percent(car.prediction.predictedOccupancyRatio)} · ${car.prediction.confidence}`}
            icon={
              car.prediction.trend === "increasing" ? (
                <TrendingUp size={11} />
              ) : car.prediction.trend === "decreasing" ? (
                <TrendingDown size={11} />
              ) : (
                <Minus size={11} />
              )
            }
          />
          <Stat label="Kamera" value={`${car.cameraId} · active`} color="#16A34A" />
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-wider text-faint">
            <span>Okupansi</span>
            <span>{car.floorAreaM2} m² lantai</span>
          </div>
          <MiniBar value={car.occupancyRatio} color={color} />
        </div>

        {door && (
          <div className="flex items-center justify-between rounded-xl border border-line bg-slate-50 px-3 py-2">
            <span className="flex items-center gap-2 text-[11.5px] text-muted">
              {doorOpen ? <DoorOpen size={13} className="text-primary" /> : <DoorClosed size={13} />}
              {doorOpen ? "Pintu tengah TERBUKA" : "Pintu tertutup"}
            </span>
            <span className="text-[10px] text-faint">{door.reason}</span>
          </div>
        )}

        {c && (
          <div className="rounded-xl border border-line bg-slate-50 px-3 py-2">
            <div className="mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-faint">
                <HeartPulse size={12} /> CALES · kesehatan bogie
              </span>
              <StatusPill
                label={c.status}
                color={
                  c.status === "GREEN" ? "#16A34A" : c.status === "YELLOW" ? "#F59E0B" : c.status === "ORANGE" ? "#EC6C25" : "#ED242B"
                }
              />
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px] text-muted">
              <Stat label="Health index" value={c.healthIndex.toFixed(1)} />
              <Stat label="Skor" value={c.calesScore.toFixed(2)} />
              <Stat label="Prioritas" value={`#${c.inspectionPriority}`} />
            </div>
            <p className="mt-1.5 text-[10.5px] text-faint">
              {ACTION_LABEL[c.recommendedAction] ?? c.recommendedAction} · RUL wheel flange{" "}
              {c.rul.wheelFlangeRul} bulan
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function Stat({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: string;
  color?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-lg bg-slate-50 px-2.5 py-2">
      <div className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-faint">
        {icon}
        {label}
      </div>
      <div className="mt-0.5 font-mono text-[12px] font-semibold" style={{ color: color ?? "#1F2937" }}>
        {value}
      </div>
    </div>
  );
}
