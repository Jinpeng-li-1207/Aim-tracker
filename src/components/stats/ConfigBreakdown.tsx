import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { allConfigRows, type ConfigRow } from "@/lib/stats";
import { getCalibration } from "@/lib/calibration";
import { nextTier } from "@/lib/rank";
import { TIER_META } from "@/lib/constants";
import type { TrainingSession, Tier } from "@/lib/types";

function targetFor(row: ConfigRow, currentTier: Tier): number | undefined {
  const goal = nextTier(currentTier);
  const c = getCalibration();
  if (row.testType === "speed" && row.difficulty) return c.speed[row.difficulty]?.[goal];
  if (row.testType === "eliminate" && row.targetCount) return c.eliminate[String(row.targetCount)]?.[goal];
  return undefined;
}

// 迷你趋势线：统一"上=更好"
function Sparkline({ row }: { row: ConfigRow }) {
  const vals = row.points.slice(-20).map((p) => p.v);
  if (vals.length < 2) return <div className="w-24 text-right text-[10px] text-dim">—</div>;
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const span = max - min || 1;
  const w = 96;
  const h = 26;
  const pts = vals.map((v, i) => {
    const norm = row.testType === "speed" ? (v - min) / span : (max - v) / span;
    return `${((i / (vals.length - 1)) * w).toFixed(1)},${(h - norm * (h - 4) - 2).toFixed(1)}`;
  });
  const color = row.testType === "speed" ? "#ff4655" : "#14d8c4";
  return (
    <svg width={w} height={h} className="shrink-0">
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

function DetailChart({ row, target }: { row: ConfigRow; target?: number }) {
  const pts = row.points;
  const color = row.testType === "speed" ? "#ff4655" : "#14d8c4";
  const vals = pts.map((p) => p.v);
  const candidates = target !== undefined ? [...vals, target] : vals;
  const lo = Math.min(...candidates);
  const hi = Math.max(...candidates);
  const span = hi - lo || 1;
  const W = 320;
  const H = 120;
  const pad = 8;
  const x = (i: number) => (pts.length <= 1 ? W / 2 : pad + (i / (pts.length - 1)) * (W - 2 * pad));
  const y = (v: number) => H - pad - ((v - lo) / span) * (H - 2 * pad);

  const avg = vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : 0;
  const recent = vals[vals.length - 1];
  const unit = row.testType === "speed" ? "/30" : "s";

  return (
    <div className="mt-2 border-t border-line pt-3">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none">
        {target !== undefined && (
          <line x1={pad} x2={W - pad} y1={y(target)} y2={y(target)} stroke="#8A9199" strokeWidth="1" strokeDasharray="4 3" />
        )}
        {pts.length > 1 && (
          <polyline points={pts.map((p, i) => `${x(i)},${y(p.v)}`).join(" ")} fill="none" stroke={color} strokeWidth="2" />
        )}
        {pts.map((p, i) => (
          <circle key={i} cx={x(i)} cy={y(p.v)} r="2.5" fill={color} />
        ))}
      </svg>
      <div className="mt-2 flex justify-between text-[10px] text-dim">
        <span>{pts[0]?.d}</span>
        <span>{pts[pts.length - 1]?.d}</span>
      </div>
      <div className="mt-2 grid grid-cols-4 gap-2 text-center">
        {[
          { l: "次数", v: `${row.count}` },
          { l: "最佳", v: `${row.best}${unit}` },
          { l: "平均", v: `${avg}${unit}` },
          { l: "最近", v: `${recent}${unit}` },
        ].map((s) => (
          <div key={s.l} className="rounded-lg bg-bg2 py-1.5">
            <div className="text-[10px] text-dim">{s.l}</div>
            <div className="text-[13px] text-ink">{s.v}</div>
          </div>
        ))}
      </div>
      {target !== undefined && (
        <div className="mt-2 text-[10px] text-dim">
          虚线为下一段位目标 {target}
          {unit}
        </div>
      )}
    </div>
  );
}

export function ConfigBreakdown({ sessions, currentTier }: { sessions: TrainingSession[]; currentTier: Tier }) {
  const rows = allConfigRows(sessions);
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-2.5">
      {rows.map((r) => {
        const empty = r.count === 0;
        const expanded = open === r.key;
        return (
          <div key={r.key} className="rounded-xl border border-line bg-surface">
            <button
              onClick={() => !empty && setOpen(expanded ? null : r.key)}
              className="flex w-full items-center gap-3 p-3 text-left"
            >
              <div className="min-w-0 flex-1">
                <div className={`text-[13px] ${empty ? "text-dim" : "text-ink"}`}>
                  {r.zh} <span className="text-dim">{r.en}</span>
                </div>
                <div className="mt-0.5 text-[11px] text-muted">
                  {empty ? (
                    "未训练"
                  ) : (
                    <>
                      {r.count} 次 · 最佳 <span className="text-ink">{r.best}</span>
                      {r.testType === "speed" ? "/30" : "s"}
                    </>
                  )}
                </div>
              </div>
              {!empty && <Sparkline row={r} />}
              {!empty && (
                <ChevronDown
                  size={16}
                  className={`shrink-0 text-dim transition-transform ${expanded ? "rotate-180" : ""}`}
                />
              )}
            </button>
            {expanded && (
              <div className="px-3 pb-3">
                <DetailChart row={r} target={targetFor(r, currentTier)} />
              </div>
            )}
          </div>
        );
      })}
      <div className="mt-1 flex items-center gap-3 text-[10px] text-dim">
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: TIER_META[nextTier(currentTier)].color }} />
          目标段位 {TIER_META[nextTier(currentTier)].zh}
        </span>
      </div>
    </div>
  );
}
