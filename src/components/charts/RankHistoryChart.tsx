import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { rankHistory } from "@/lib/rank";
import { TIER_ORDER, TIER_META } from "@/lib/constants";
import type { TrainingSession } from "@/lib/types";

const axis = { fontSize: 11, fill: "#768079" };

export function RankHistoryChart({ sessions }: { sessions: TrainingSession[] }) {
  const data = rankHistory(sessions);
  const tierZh = (i: number) => TIER_META[TIER_ORDER[i]]?.zh ?? "";

  return (
    <section className="rounded-xl border border-line bg-surface p-3">
      <h3 className="mb-2 text-[13px] text-ink">瞄准段位历史</h3>
      {data.length < 2 ? (
        <p className="py-8 text-center text-xs text-dim">积累多天记录后展示段位变化</p>
      ) : (
        <div className="h-52">
          <ResponsiveContainer>
            <LineChart data={data} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" tick={axis} stroke="rgba(255,255,255,0.1)" />
              <YAxis
                domain={[0, 8]}
                ticks={[0, 2, 4, 6, 8]}
                tickFormatter={(v: number) => tierZh(v)}
                tick={axis}
                width={40}
                stroke="rgba(255,255,255,0.1)"
              />
              <Tooltip
                contentStyle={{
                  background: "#16202a",
                  border: "1px solid rgba(255,255,255,0.14)",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "#ece8e1",
                }}
                formatter={(v) => [tierZh(Number(v)), "段位"]}
              />
              <Line type="stepAfter" dataKey="index" stroke="#ff4655" strokeWidth={2} dot={{ r: 3, fill: "#ff4655" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
