import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { LeftPanel } from "@/components/layout/LeftPanel";
import { RightPanel } from "@/components/layout/RightPanel";
import { Scene } from "@/three/Scene";
import { TrainDiagram2D } from "@/components/view/TrainDiagram2D";
import { ViewToggle } from "@/components/view/ViewToggle";
import { CarStrip } from "@/components/panels/CarStrip";
import { AnnouncementBar } from "@/components/panels/AnnouncementBar";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { useThemisStore } from "@/store/useThemisStore";
import { SIMULATION_TICK_MS } from "@/lib/constants";
import { prefetchVariants } from "@/three/models";

const IS_SMALL = typeof window !== "undefined" && window.innerWidth < 1024;

export function Dashboard() {
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const step = useThemisStore((s) => s.step);
  const isLive = useThemisStore((s) => s.isLive);
  const viewMode = useThemisStore((s) => s.viewMode);
  const announcement = useThemisStore((s) => s.announcement);

  // Simulasi dummy tick.
  useEffect(() => {
    if (!isLive) return;
    const id = setInterval(() => step(), SIMULATION_TICK_MS);
    return () => clearInterval(id);
  }, [isLive, step]);

  // Prefetch varian GLB (medium/high) setelah load awal — jaga TTI tetap cepat.
  useEffect(() => {
    const id = setTimeout(() => prefetchVariants(), 2500);
    return () => clearTimeout(id);
  }, []);

  // Voice announcement (opsional, bahasa Indonesia).
  useEffect(() => {
    if (!voiceEnabled || !announcement) return;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;
    const u = new SpeechSynthesisUtterance(announcement.text);
    u.lang = "id-ID";
    u.rate = 1.0;
    synth.cancel();
    synth.speak(u);
  }, [voiceEnabled, announcement]);

  return (
    <div className="flex min-h-dvh flex-col gap-2.5 p-2.5 lg:h-dvh lg:overflow-hidden">
      <Header voiceEnabled={voiceEnabled} onToggleVoice={() => setVoiceEnabled((v) => !v)} />

      <div className="flex min-h-0 flex-1 flex-col gap-2.5 lg:flex-row">
        {/* Kolom utama: viewport 2D/3D + strip gerbong — tampil duluan di mobile */}
        <main className="order-1 flex min-h-0 min-w-0 flex-1 flex-col gap-2.5 lg:order-2">
          <div className="relative h-[44vh] min-h-[280px] overflow-hidden rounded-3xl border border-line bg-[#e9edf7] shadow-[0_1px_3px_rgba(15,23,42,0.06)] lg:h-auto lg:flex-1">
            {viewMode === "3d" ? (
              <>
                <Scene />
                <LoadingOverlay />
              </>
            ) : (
              <TrainDiagram2D />
            )}
            <ViewToggle />
            {viewMode === "3d" && !IS_SMALL && (
              <div className="pointer-events-none absolute right-3 top-3 hidden rounded-full bg-white/70 px-3 py-1.5 text-[10.5px] text-muted backdrop-blur sm:block">
                seret untuk memutar · scroll untuk zoom
              </div>
            )}
            {announcement && (
              <div className="absolute bottom-3 left-3 right-3 lg:right-auto lg:max-w-md">
                <AnnouncementBar />
              </div>
            )}
          </div>
          <CarStrip />
        </main>

        <LeftPanel className="order-2 lg:order-1" />
        <RightPanel className="order-3" />
      </div>
    </div>
  );
}
