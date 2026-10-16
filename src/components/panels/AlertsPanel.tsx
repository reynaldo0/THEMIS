import { AlertTriangle, ShieldAlert, ShieldCheck } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Panel } from "@/components/ui/Panel";
import { useThemisStore } from "@/store/useThemisStore";
import { formatClock } from "@/lib/format";

const SEVERITY_COLOR: Record<string, string> = {
  CRITICAL: "#ED242B",
  WARNING: "#F59E0B",
  INFO: "#2D2A70",
};

export function AlertsPanel() {
  const warnings = useThemisStore((s) => s.warnings);
  const selectCar = useThemisStore((s) => s.selectCar);

  const sorted = [...warnings].sort((a, b) => {
    const rank = { CRITICAL: 0, WARNING: 1, INFO: 2 } as const;
    return rank[a.severity] - rank[b.severity] || a.carId - b.carId;
  });

  return (
    <Panel
      title={`Peringatan (${warnings.length})`}
      icon={<ShieldAlert size={13} />}
      action={
        warnings.length === 0 ? (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-green">
            <ShieldCheck size={12} /> Aman
          </span>
        ) : null
      }
      bodyClassName="px-2.5 py-2.5"
    >
      {sorted.length === 0 ? (
        <p className="px-1.5 py-2 text-[12px] text-muted">
          Tidak ada peringatan aktif. Seluruh gerbong berada di zona lega.
        </p>
      ) : (
        <ul className="scrollbar-slim max-h-[168px] space-y-1.5 overflow-y-auto pr-1">
          <AnimatePresence initial={false}>
            {sorted.map((w) => {
              const color = SEVERITY_COLOR[w.severity];
              return (
                <motion.li
                  key={w.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  onClick={() => selectCar(w.carId)}
                  className="cursor-pointer rounded-xl border px-3 py-2 transition hover:bg-slate-50"
                  style={{ borderColor: `${color}33`, background: `${color}0a` }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold" style={{ color }}>
                      <AlertTriangle size={11} />
                      {w.warningType.replace("_", " ")}
                    </span>
                    <span className="font-mono text-[10px] text-faint">G{String(w.carId).padStart(2, "0")}</span>
                  </div>
                  <p className="mt-0.5 text-[11px] leading-snug text-muted">
                    Gerbong {w.carId} {w.warningType === "RED_DENSITY" ? "padat (Penuh)" : "sedang"} · okupansi{" "}
                    {w.message.split("occupancy:")[1]?.trim() ?? "-"}
                  </p>
                  <span className="font-mono text-[9px] text-faint">{formatClock(w.timestamp)}</span>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
    </Panel>
  );
}
