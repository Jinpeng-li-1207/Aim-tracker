import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { RankBadge } from "@/components/rank/RankBadge";
import { nextTier, tierIndex } from "@/lib/rank";
import type { FormState, RankResult, TodayDrill, Tier } from "@/lib/types";

interface Props {
  rank: RankResult;
  form: FormState;
  gameRank?: Tier;
  drills: TodayDrill[];
}

function diffNote(gameRank: Tier, aim: Tier): string {
  const d = tierIndex(gameRank) - tierIndex(aim);
  if (d >= 2) return "意识强于枪法 — 练枪能拉高你的下限";
  if (d <= -2) return "枪法强于段位 — 多打排位更容易上分";
  return "枪法与段位大体匹配，稳步精进";
}

function FormChip({ form }: { form: FormState }) {
  const map = {
    up: { c: "#14d8c4", Icon: TrendingUp },
    down: { c: "#ff4655", Icon: TrendingDown },
    flat: { c: "#768079", Icon: Minus },
    none: { c: "#4a555e", Icon: Minus },
  } as const;
  const { c, Icon } = map[form.tone];
  return (
    <span className="inline-flex items-center gap-1 text-[11px]" style={{ color: c }}>
      <Icon size={13} />
      {form.label}
    </span>
  );
}

export function TargetHeader({ rank, form, gameRank, drills }: Props) {
  const goal = nextTier(rank.tier);
  const metCount = drills.filter((d) => d.met).length;
  const total = drills.length;
  const pct = total ? Math.round((metCount / total) * 100) : 0;
  const hasAim = rank.source === "records";

  return (
    <div className="mx-4 mt-2 rounded-2xl border border-line bg-surface p-4">
      {/* 双段位：游戏 vs 瞄准 */}
      <div className="flex items-stretch">
        <div className="flex-1">
          <div className="mb-1 text-[10px] text-muted">游戏段位（对战）</div>
          {gameRank ? (
            <RankBadge tier={gameRank} />
          ) : (
            <span className="text-sm text-dim">未填 · 去「我的」</span>
          )}
        </div>
        <div className="mx-3 w-px bg-line" />
        <div className="flex-1">
          <div className="mb-1 text-[10px] text-muted">瞄准段位（实测）</div>
          {hasAim ? (
            <RankBadge tier={rank.tier} />
          ) : (
            <span className="text-sm text-dim">
              {rank.source === "gamerank" ? "待实测" : "未定级"}
            </span>
          )}
        </div>
      </div>

      {gameRank && hasAim && (
        <div className="mt-2.5 rounded-lg bg-teal/10 px-2.5 py-1.5 text-[11px] text-teal">
          {diffNote(gameRank, rank.tier)}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[11px] text-muted">近期手感</span>
        <FormChip form={form} />
      </div>

      {/* 今日目标进度 */}
      <div className="mt-3 border-t border-line pt-3">
        <div className="mb-1.5 flex items-center justify-between text-[11px]">
          <span className="inline-flex items-center gap-1 text-muted">
            冲 <RankBadge tier={goal} size="sm" /> 今日达标 {metCount}/{total}
          </span>
          <span className="text-brand">{pct}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-bg2">
          <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}
