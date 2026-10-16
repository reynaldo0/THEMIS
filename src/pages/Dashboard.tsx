import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { LeftPanel } from "@/components/layout/LeftPanel";
import { RightPanel } from "@/components/layout/RightPanel";
import { Scene } from "@/three/Scene";
import { TrainDiagram2D } from "@/components/view/TrainDiagram2D";
import { ViewToggle } from "@/components/view/ViewToggle";
import { CarStrip } from "@/components/panels/CarStrip";
import { AnnouncementBar } from "@/components/panels/AnnouncementBar";
import { CabinCameraPanel } from "@/components/panels/CabinCameraPanel";
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
  // Signature stabil: pengumuman hanya diulang saat rekomendasi benar-benar
  // berubah — supaya suara tidak terpotong/ngulang tiap tick.
  const announcementKey = useThemisStore((s) =>
    s.announcement ? `${s.announcement.fromCarId}>${s.announcement.toCarId}:${s.announcement.textId}` : null,
  );

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

  // Voice announcement: chime kereta, lalu Indonesia, kemudian Inggris.
  // Bergantung pada signature (bukan objek yang berubah tiap tick) agar
  // pembacaan tidak di-cancel di tengah kalimat.
  useEffect(() => {
    if (!voiceEnabled || !announcementKey) return;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const current = useThemisStore.getState().announcement;
    if (!current) return;

    const synth = window.speechSynthesis;
    synth.cancel();

    const pickVoice = (prefix: string) =>
      synth.getVoices().find((v) => v.lang?.toLowerCase().startsWith(prefix)) ?? null;

    const idU = new SpeechSynthesisUtterance(current.textId ?? current.text);
    idU.lang = "id-ID";
    idU.rate = 1;
    const idVoice = pickVoice("id");
    if (idVoice) idU.voice = idVoice;

    const enU = new SpeechSynthesisUtterance(current.textEn ?? current.text);
    enU.lang = "en-US";
    enU.rate = 0.98;
    const enVoice = pickVoice("en");
    if (enVoice) enU.voice = enVoice;

    // Ucapkan versi Inggris setelah versi Indonesia selesai.
    idU.onend = () => synth.speak(enU);

    playTrainChime();
    const timer = setTimeout(() => synth.speak(idU), 900);
    return () => {
      clearTimeout(timer);
      synth.cancel();
    };
  }, [voiceEnabled, announcementKey]);

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
            {viewMode === "3d" && (
              <div className="absolute right-3 top-3 z-20">
                <CabinCameraPanel />
              </div>
            )}
            {viewMode === "3d" && !IS_SMALL && (
              <div className="pointer-events-none absolute left-3 top-14 z-10 hidden rounded-full bg-white/70 px-3 py-1.5 text-[10.5px] text-muted backdrop-blur sm:block">
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

/** Chime dua nada menjelang pengumuman — meniru pengeras suara KRL. */
function playTrainChime() {
  if (typeof window === "undefined") return;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  try {
    const ctx = new AC();
    const now = ctx.currentTime;
    [587.33, 440].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const start = now + i * 0.42;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.16, start + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.5);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.55);
    });
    setTimeout(() => ctx.close(), 1600);
  } catch {
    /* AudioContext diblokir — abaikan. */
  }
}
