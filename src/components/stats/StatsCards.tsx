import { sensitivityBreakdown } from "@/lib/stats";
import type { TrainingSession } from "@/lib/types";

export function SensitivityCard({ sessions }: { sessions: TrainingSession[] }) {
  const rows = sensitivityBreakdown(sessions);
  const maxAvg = rows.length ? Math.max(...rows.map((r) => r.avgScore)) : 0;
  const best = rows.length ? rows.reduce((a, b) => (b.avgScore > a.avgScore ? b : a)) : null;

  if (rows.length < 1) {
    return (
      <p className="mt-3 text-[11px] text-dim">
        每次记录会带上当前灵敏度；用过 2 个以上灵敏度后，这里会对比各自的平均命中，帮你找甜点。
      </p>
    );
  }

  return (
    <div className="mt-3 flex flex-col gap-2">
      <div className="text-[11px] text-muted">各灵敏度平均命中</div>
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
        <p className="text-[11px] text-teal">灵敏度 {best.sens} 命中最高，考虑固定它</p>
      )}
    </div>
  );
}
