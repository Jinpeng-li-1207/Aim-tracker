import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { TrainingSession } from "@/lib/types";

interface Props {
  sessions: TrainingSession[];
}

const axis = { fontSize: 11, fill: "#768079" };
const tooltipStyle = {
  background: "#16202a",
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: 8,
  fontSize: 12,
  color: "#ece8e1",
};

function Empty({ text }: { text: string }) {
  return <p className="py-8 text-center text-xs text-dim">{text}</p>;
}

export function ProgressChart({ sessions }: Props) {
  const speed = sessions.filter(
    (s): s is Extract<TrainingSession, { testType: "speed" }> => s.testType === "speed",
  );
  const elim = sessions.filter(
    (s): s is Extract<TrainingSession, { testType: "eliminate" }> => s.testType === "eliminate",
  );

  const speedData = [...speed]
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((s) => ({ date: s.createdAt.slice(5, 10), 命中数: s.score }));
  const elimData = [...elim]
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((s) => ({ date: s.createdAt.slice(5, 10), 耗时秒: s.completionSeconds }));

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-xl border border-line bg-surface p-3">
        <h3 className="mb-2 text-[13px] text-ink">速度测试 · 命中数（越高越好）</h3>
        {speedData.length === 0 ? (
          <Empty text="暂无速度测试记录" />
        ) : (
          <div className="h-52">
            <ResponsiveContainer>
              <LineChart data={speedData} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="date" tick={axis} stroke="rgba(255,255,255,0.1)" />
                <YAxis domain={[0, 30]} tick={axis} stroke="rgba(255,255,255,0.1)" />
                <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "#ff4655", strokeWidth: 1 }} />
                <Line type="monotone" dataKey="命中数" stroke="#ff4655" strokeWidth={2} dot={{ r: 2, fill: "#ff4655" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-line bg-surface p-3">
        <h3 className="mb-2 text-[13px] text-ink">消灭测试 · 耗时秒（越低越好）</h3>
        {elimData.length === 0 ? (
          <Empty text="暂无消灭测试记录" />
        ) : (
          <div className="h-52">
            <ResponsiveContainer>
              <LineChart data={elimData} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="date" tick={axis} stroke="rgba(255,255,255,0.1)" />
                <YAxis tick={axis} stroke="rgba(255,255,255,0.1)" />
                <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "#14d8c4", strokeWidth: 1 }} />
                <Line type="monotone" dataKey="耗时秒" stroke="#14d8c4" strokeWidth={2} dot={{ r: 2, fill: "#14d8c4" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </div>
  );
}
