import { useEffect, useState } from "react";
import { useProgress } from "@react-three/drei";

export function LoadingOverlay() {
  const { progress } = useProgress();
  const [timedOut, setTimedOut] = useState(false);

  // Failsafe: jangan pernah memblokir demo jika loader manager tidak event.
  useEffect(() => {
    const id = setTimeout(() => setTimedOut(true), 12_000);
    return () => clearTimeout(id);
  }, []);

  const ready = progress >= 100 || timedOut;

  if (ready) return null;

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center rounded-3xl bg-[#e9edf7]/95 backdrop-blur">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-lg">
        <img src="/themis-icon.svg" alt="" className="h-9 w-9" />
      </div>
      <h2 className="font-display text-lg font-bold tracking-tight text-ink">
        <span className="gradient-text">PROJECT THEMIS</span>
      </h2>
      <p className="mt-1 text-[11px] uppercase tracking-[0.3em] text-faint">Memuat Model 3D</p>

      <div className="mt-7 w-64">
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-300/60">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
            style={{ width: `${Math.max(4, progress)}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between font-mono text-[10px] text-faint">
          <span>train-low / medium / high.glb</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
}
