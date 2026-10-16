import { Box, Layers } from "lucide-react";
import { useThemisStore } from "@/store/useThemisStore";
import { cn } from "@/lib/cn";

export function ViewToggle() {
  const viewMode = useThemisStore((s) => s.viewMode);
  const setViewMode = useThemisStore((s) => s.setViewMode);

  return (
    <div className="pointer-events-auto absolute left-3 top-3 z-20 flex items-center gap-0.5 rounded-full border border-line bg-white/90 p-1 shadow-sm backdrop-blur">
      {(
        [
          { id: "2d", label: "2D", icon: Layers },
          { id: "3d", label: "3D", icon: Box },
        ] as const
      ).map(({ id, label, icon: Icon }) => {
        const active = viewMode === id;
        return (
          <button
            key={id}
            onClick={() => setViewMode(id)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition",
              active ? "bg-primary text-white shadow-sm" : "text-muted hover:bg-slate-100 hover:text-ink",
            )}
            aria-pressed={active}
          >
            <Icon size={12} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
