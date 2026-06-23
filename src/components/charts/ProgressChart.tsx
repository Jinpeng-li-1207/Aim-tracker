import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { TrainingSession } from "@/lib/types";

interface Props {
  sessions: TrainingSession[];
}

// 按测试类型分别聚合；speed 画 score(↑)，eliminate 画 completionSeconds(↓)
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
    <div className="flex flex-col gap-6">
      <section>
        <h3 className="mb-1 text-sm font-semibold">速度测试 · 命中数趋势（越高越好）</h3>
        {speedData.length === 0 ? (
          <p className="text-sm text-gray-400">暂无速度测试记录</p>
        ) : (
          <div className="h-56">
            <ResponsiveContainer>
              <LineChart data={speedData}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 30]} />
                <Tooltip />
                <Line type="monotone" dataKey="命中数" stroke="#ef4444" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
      <section>
        <h3 className="mb-1 text-sm font-semibold">消灭测试 · 耗时趋势（越低越好）</h3>
        {elimData.length === 0 ? (
          <p className="text-sm text-gray-400">暂无消灭测试记录</p>
        ) : (
          <div className="h-56">
            <ResponsiveContainer>
              <LineChart data={elimData}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="耗时秒" stroke="#f97316" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </div>
  );
}
