import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface PanelProps {
  title?: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function Panel({ title, icon, action, children, className, bodyClassName }: PanelProps) {
  return (
    <section className={cn("glass rounded-2xl", className)}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-2 border-b border-line/80 px-4 py-3">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
            {icon}
            <span>{title}</span>
          </div>
          {action}
        </header>
      )}
      <div className={cn("px-4 py-3", bodyClassName)}>{children}</div>
    </section>
  );
}
