import { Camera, Signal } from "lucide-react";
import { useThemisStore } from "@/store/useThemisStore";
import { DENSITY_COLOR, DENSITY_LABEL, percent } from "@/lib/format";

/**
 * Umpan kamera fisheye di dalam kabin — kamera 01 (gerbong 1).
 *
 * Meniru tampilan kamera plafon: satu lensa fisheye menghadap ke bawah ke
 * area lantai gerbong. Nilai okupansi mengikuti data gerbong 1 secara live.
 */
export function CabinCameraPanel({ className }: { className?: string }) {
  const car = useThemisStore((s) => s.cars[0]);
  if (!car) return null;

  const color = DENSITY_COLOR[car.densityIndicator];

  return (
    <div
      className={`pointer-events-auto w-36 overflow-hidden rounded-2xl border border-white/10 bg-[#0a0d1a]/95 shadow-[0_12px_30px_-12px_rgba(10,13,26,0.8)] backdrop-blur sm:w-44 ${className ?? ""}`}
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src="/fisheye-cam1.jpg"
          alt="Umpan kamera fisheye di dalam kabin gerbong 1"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ transform: "scale(1.06)" }}
        />
        {/* Vignette lensa fisheye */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ boxShadow: "inset 0 0 46px 16px rgba(0,0,0,0.9), inset 0 0 8px 2px rgba(0,0,0,0.6)" }}
        />
        {/* Scanline halus */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(255,255,255,0.4) 0px, rgba(255,255,255,0.4) 1px, transparent 1px, transparent 3px)",
          }}
        />
        {/* Crosshair tengah */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-px w-4 -translate-x-1/2 -translate-y-1/2 bg-white/45" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-4 w-px -translate-x-1/2 -translate-y-1/2 bg-white/45" />

        <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/60 px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wider text-white/90">
          <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-[#ED242B]" />
          Live
        </span>
        <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/60 px-1.5 py-0.5 font-mono text-[8px] text-white/80">
          <Signal size={9} /> 100%
        </span>
      </div>

      <div className="flex items-center justify-between gap-1 px-2 py-1.5">
        <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-slate-300">
          <Camera size={10} /> CAM 01 · G01
        </span>
        <span className="flex items-center gap-1 font-mono text-[9px] font-bold" style={{ color }}>
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
          {percent(car.occupancyRatio)} {DENSITY_LABEL[car.densityIndicator]}
        </span>
      </div>
    </div>
  );
}
