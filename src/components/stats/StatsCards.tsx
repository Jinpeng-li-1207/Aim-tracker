import { Flame } from "lucide-react";
import { computeStreak, heatmapData, weeklyRecap, sensitivityBreakdown } from "@/lib/stats";
import type { TrainingSession } from "@/lib/types";

function cellColor(count: number): string {
  if (count <= 0) return "#1b2733";
  if (count === 1) return "rgba(20,216,196,0.30)";
  if (count === 2) return "rgba(20,216,196,0.60)";
  return "#14d8c4";
}

export function StreakCard({ sessions }: { sessions: TrainingSession[] }) {
  const streak = computeStreak(sessions);
  const cells = heatmapData(sessions, 12);
  const wk = weeklyRecap(sessions);
  const wkSpeedBest = (() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 6);
    const scores = sessions
      .filter((s) => s.testType === "speed" && new Date(s.createdAt) >= cutoff)
      .map((s) => (s.testType === "speed" ? s.score : 0));
    return scores.length ? Math.max(...scores) : null;
  })();

  return (
    <section className="rounded-xl border border-line bg-surface p-3">
      <div className="mb-3 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-[13px] text-ink">
          <Flame size={15} className="text-brand" /> 连续打卡
        </span>
        <span className="text-[11px] text-muted">
          当前 <span className="text-brand">{streak.current}</span> 天 · 最长 {streak.longest} 天
        </span>
      </div>

      <div
        className="grid gap-[3px]"
        style={{ gridAutoFlow: "column", gridTemplateRows: "repeat(7, 1fr)" }}
      >
        {cells.map((c) => (
          <div
            key={c.date}
            title={`${c.date}：${c.count} 次`}
            className="aspect-square rounded-[2px]"
            style={{ backgroundColor: cellColor(c.count) }}
          />
        ))}
      </div>

      <div className="mt-3 border-t border-line pt-2.5 text-[11px] text-muted">
        本周 练 <span className="text-ink">{wk.count}</span> 次 · <span className="text-ink">{wk.days}</span> 天
        {wkSpeedBest !== null && (
          <> · 最佳命中 <span className="text-ink">{wkSpeedBest}/30</span></>
        )}
      </div>
    </section>
  );
}

export function SensitivityCard({ sessions }: { sessions: TrainingSession[] }) {
  const rows = sensitivityBreakdown(sessions);
  const maxAvg = rows.length ? Math.max(...rows.map((r) => r.avgScore)) : 0;
  const best = rows.length ? rows.reduce((a, b) => (b.avgScore > a.avgScore ? b : a)) : null;

  return (
    <section className="rounded-xl border border-line bg-surface p-3">
      <h3 className="mb-2 text-[13px] text-ink">灵敏度甜点</h3>
      {rows.length < 1 ? (
        <p className="py-6 text-center text-xs text-dim">
          在「我的」填入灵敏度后，这里会分析你在不同灵敏度下的表现
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {rows.map((r) => {
            const isBest = best?.sens === r.sens;
            const w = maxAvg ? Math.round((r.avgScore / maxAvg) * 100) : 0;
            return (
              <div key={r.sens} className="flex items-center gap-2 text-[11px]">
                <span className={`w-10 shrink-0 ${isBest ? "text-teal" : "text-muted"}`}>{r.sens}</span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-bg2">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${w}%`, backgroundColor: isBest ? "#14d8c4" : "#3a4650" }}
                  />
                </div>
                <span className="w-14 shrink-0 text-right text-muted">
                  {r.avgScore}/30<span className="text-dim"> ×{r.count}</span>
                </span>
              </div>
            );
          })}
          {best && rows.length >= 2 && (
            <p className="mt-1 text-[11px] text-teal">灵敏度 {best.sens} 时命中最高，考虑固定它</p>
          )}
        </div>
      )}
    </section>
  );
}
