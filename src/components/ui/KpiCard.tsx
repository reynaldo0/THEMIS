import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  icon?: ReactNode;
  accent?: string;
}

export function KpiCard({ label, value, sub, icon, accent = "#2D2A70" }: KpiCardProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-line/70 bg-white px-3.5 py-3">
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}66, transparent)` }}
      />
      <div className="flex items-start justify-between gap-2">
        <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-faint">{label}</span>
        {icon && (
          <span style={{ color: accent }} className="opacity-70">
            {icon}
          </span>
        )}
      </div>
      <div className="mt-1.5 font-display text-2xl font-bold leading-none text-ink">{value}</div>
      {sub && <div className="mt-1 text-[11px] text-muted">{sub}</div>}
    </div>
  );
}

export function MiniBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200/80">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.max(2, Math.min(100, value * 100))}%`, background: color }}
      />
    </div>
  );
}

export function StatusPill({
  label,
  color,
  pulse,
  className,
}: {
  label: string;
  color: string;
  pulse?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider",
        className,
      )}
      style={{ borderColor: `${color}55`, color, background: `${color}14` }}
    >
      <span
        className={cn("inline-block h-1.5 w-1.5 rounded-full", pulse && "animate-pulse-dot")}
        style={{ background: color }}
      />
      {label}
    </span>
  );
}
