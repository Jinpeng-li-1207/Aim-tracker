import { configBreakdown, type ConfigRow } from "@/lib/stats";
import type { TrainingSession } from "@/lib/types";

// 迷你趋势线：speed 原值，eliminate 反转（耗时越低画得越高），统一"上=更好"
function Sparkline({ row }: { row: ConfigRow }) {
  const vals = row.values.slice(-20);
  if (vals.length < 2) {
    return <div className="text-[10px] text-dim">数据不足</div>;
  }
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const span = max - min || 1;
  const w = 96;
  const h = 28;
  const pts = vals.map((v, i) => {
    const norm = row.testType === "speed" ? (v - min) / span : (max - v) / span;
    const x = (i / (vals.length - 1)) * w;
    const y = h - norm * (h - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const color = row.testType === "speed" ? "#ff4655" : "#14d8c4";
  return (
    <svg width={w} height={h} className="shrink-0">
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

export function ConfigBreakdown({ sessions }: { sessions: TrainingSession[] }) {
  const rows = configBreakdown(sessions);

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-surface p-6 text-center text-xs text-dim">
        还没有训练记录，去训练页打卡后这里会按项目展示
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {rows.map((r) => (
        <div key={r.key} className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3">
          <div className="min-w-0 flex-1">
            <div className="text-[13px] text-ink">
              {r.zh} <span className="text-dim">{r.en}</span>
            </div>
            <div className="mt-0.5 text-[11px] text-muted">
              {r.count} 次 · 最佳 <span className="text-ink">{r.best}</span>
              {r.testType === "speed" ? "/30" : "s"}
            </div>
          </div>
          <Sparkline row={r} />
        </div>
      ))}
    </div>
  );
}
