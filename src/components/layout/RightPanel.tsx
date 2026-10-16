import { AnimatePresence } from "framer-motion";
import { CarDetailPanel } from "@/components/panels/CarDetailPanel";
import { RecommendationPanel } from "@/components/panels/RecommendationPanel";
import { AlertsPanel } from "@/components/panels/AlertsPanel";
import { TimelinePanel } from "@/components/panels/TimelinePanel";
import { SystemHealthPanel } from "@/components/panels/SystemHealthPanel";
import { CarOverviewPanel } from "@/components/panels/CarOverviewPanel";
import { cn } from "@/lib/cn";

export function RightPanel({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        "scrollbar-slim flex w-full shrink-0 flex-col gap-2.5 lg:w-[336px] lg:overflow-y-auto lg:pb-3 lg:pl-1",
        className,
      )}
    >
      <AnimatePresence mode="wait">
        <CarDetailPanel key="detail" />
      </AnimatePresence>
      <RecommendationPanel />
      <AlertsPanel />
      <CarOverviewPanel />
      <TimelinePanel />
      <SystemHealthPanel />
    </aside>
  );
}
