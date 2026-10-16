import { motion } from "framer-motion";
import { SCENARIO_ORDER, SCENARIOS } from "@/engine/scenarios";
import { useThemisStore } from "@/store/useThemisStore";
import { cn } from "@/lib/cn";
import type { ScenarioName } from "@/types";

export function ScenarioSwitcher() {
  const current = useThemisStore((s) => s.scenario);
  const setScenario = useThemisStore((s) => s.setScenario);
  const def = SCENARIOS[current];

  return (
    <div>
      <p className="mb-2.5 text-[11px] leading-relaxed text-muted">{def.description}</p>
      <div className="grid grid-cols-2 gap-1.5">
        {SCENARIO_ORDER.map((name: ScenarioName) => {
          const s = SCENARIOS[name];
          const active = name === current;
          return (
            <button
              key={name}
              onClick={() => setScenario(name)}
              className={cn(
                "relative overflow-hidden rounded-xl border px-3 py-2 text-left transition",
                active
                  ? "border-primary/40 bg-primary/5"
                  : "border-line bg-white hover:border-primary/25 hover:bg-slate-50",
              )}
            >
              {active && (
                <motion.span
                  layoutId="scenario-glow"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: `linear-gradient(135deg, ${s.accent}18, transparent 70%)` }}
                />
              )}
              <span className="relative block text-[12px] font-semibold text-ink">{s.label}</span>
              <span className="relative block text-[10px] text-faint">{s.tagline}</span>
              <span
                className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full"
                style={{ background: s.accent, opacity: active ? 1 : 0.4 }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
