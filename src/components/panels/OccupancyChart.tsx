import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useThemisStore } from "@/store/useThemisStore";
import { percent } from "@/lib/format";

export function OccupancyChart() {
  const history = useThemisStore((s) => s.history);

  const data = history.map((h) => ({
    t: h.t,
    avg: Math.round(h.avg * 1000) / 10,
    red: h.red,
  }));

  return (
    <div className="h-[132px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 6, right: 8, bottom: 0, left: -22 }}>
          <defs>
            <linearGradient id="avgFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2D2A70" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#2D2A70" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis dataKey="t" tick={{ fill: "#94A3B8", fontSize: 9 }} axisLine={false} tickLine={false} minTickGap={24} />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "#94A3B8", fontSize: 9 }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip
            contentStyle={{
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: 10,
              fontSize: 11,
              color: "#1F2937",
              boxShadow: "0 2px 8px rgba(15,23,42,.08)",
            }}
            formatter={(v) => [`${Number(v ?? 0).toFixed(1)}%`, "Okupansi"]}
            labelFormatter={(l) => `Tick ${l}`}
          />
          <Area type="monotone" dataKey="avg" stroke="#4F4695" strokeWidth={2} fill="url(#avgFill)" isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
      <div className="px-2 pt-1 text-[10px] text-faint">
        rata-rata {percent(history[history.length - 1]?.avg ?? 0, 1)} · {history.length} titik data
      </div>
    </div>
  );
}
