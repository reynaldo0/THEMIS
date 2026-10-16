import { ArrowRight, Sparkles, UserRound } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { useThemisStore } from "@/store/useThemisStore";
import { percent } from "@/lib/format";

export function RecommendationPanel() {
  const recommendation = useThemisStore((s) => s.recommendation);
  const announcement = useThemisStore((s) => s.announcement);
  const redistribution = useThemisStore((s) => s.redistribution);
  const selectCar = useThemisStore((s) => s.selectCar);

  return (
    <Panel
      title="Rekomendasi Cerdas"
      icon={<Sparkles size={13} />}
      action={
        recommendation ? (
          <span className="font-mono text-[10px] text-faint">
            conf {Math.round(recommendation.recommendations[0]?.confidence * 100)}%
          </span>
        ) : null
      }
      bodyClassName="px-3 py-3"
    >
      {!recommendation || recommendation.recommendations.length === 0 ? (
        <div className="rounded-xl border border-line bg-slate-50 px-3 py-3">
          <p className="text-[12px] leading-relaxed text-muted">
            Distribusi penumpang sudah seimbang. Tidak ada aksi redistribusi yang diperlukan saat ini.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {announcement && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2">
              <div className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">Pengumuman</div>
              <p className="text-[11.5px] leading-snug text-ink/90">{announcement.text}</p>
            </div>
          )}
          {recommendation.recommendations.slice(0, 3).map((r) => (
            <button
              key={`${r.fromCarId}-${r.toCarId}`}
              onClick={() => selectCar(r.toCarId)}
              className="block w-full rounded-xl border border-line bg-white px-3 py-2.5 text-left transition hover:border-primary/30 hover:bg-primary/[0.03]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">{r.label}</span>
                {r.isWomenPriority && (
                  <span className="flex items-center gap-1 rounded-full bg-pink-50 px-2 py-0.5 text-[9px] font-semibold text-pink-600">
                    <UserRound size={9} /> Wanita
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-center gap-2 font-display text-[13px] font-semibold text-ink">
                <span>Gerbong {r.fromCarId}</span>
                <ArrowRight size={13} className="text-secondary" />
                <span>Gerbong {r.toCarId}</span>
              </div>
              <div className="mt-1 text-[11px] text-muted">{r.reason}</div>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                    style={{ width: `${r.confidence * 100}%` }}
                  />
                </div>
                <span className="font-mono text-[10px] text-faint">{percent(r.confidence)}</span>
              </div>
            </button>
          ))}
          {redistribution && (
            <p className="pt-0.5 text-[10px] text-faint">
              Selisih okupansi {percent(redistribution.occupancyDiff)} · confidence{" "}
              {percent(redistribution.confidence)}
            </p>
          )}
        </div>
      )}
    </Panel>
  );
}
