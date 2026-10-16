import { useEffect, useRef } from "react";
import { useThemisStore } from "@/store/useThemisStore";

const CAR_NAMES_ID = [
  "satu", "dua", "tiga", "empat", "lima",
  "enam", "tujuh", "delapan", "sembilan", "sepuluh",
];

/**
 * Mirrors frontend `useVoiceRecommendation` — Indonesian TTS announcement
 * with a 20s cooldown, driven by the dummy recommendation engine.
 */
export function useVoiceRecommendation(enabled: boolean) {
  const recommendation = useThemisStore((s) => s.recommendation);
  const lastSpoken = useRef<string | null>(null);
  const lastSpokenAt = useRef(0);

  useEffect(() => {
    if (!enabled || !recommendation || recommendation.recommendations.length === 0) return;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const top = recommendation.recommendations[0];
    const key = `${top.fromCarId}-${top.toCarId}`;
    const now = Date.now();
    if (lastSpoken.current === key && now - lastSpokenAt.current < 20_000) return;

    const fromName = CAR_NAMES_ID[top.fromCarId - 1] ?? String(top.fromCarId);
    const toName = CAR_NAMES_ID[top.toCarId - 1] ?? String(top.toCarId);
    const women = top.isWomenPriority ? " khusus wanita" : "";
    const text = `Perhatian. Gerbong ${fromName} penuh. Kepada seluruh penumpang di gerbong ${fromName}, dimohon untuk berpindah ke gerbong ${toName}${women}. Terima kasih.`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "id-ID";
    utterance.rate = 1.0;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);

    lastSpoken.current = key;
    lastSpokenAt.current = now;
  }, [enabled, recommendation]);
}
