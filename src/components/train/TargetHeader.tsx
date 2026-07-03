import { ChevronRight } from "lucide-react";
import { RankBadge } from "@/components/rank/RankBadge";
import { nextTier } from "@/lib/rank";
import type { RankResult, TodayDrill } from "@/lib/types";

interface Props {
  rank: RankResult;
  drills: TodayDrill[];
}

export function TargetHeader({ rank, drills }: Props) {
  const goal = nextTier(rank.tier);
  const metCount = drills.filter((d) => d.met).length;
  const total = drills.length;
  const pct = total ? Math.round((metCount / total) * 100) : 0;

  const sourceLabel =
    rank.source === "records"
      ? `基于近 ${rank.sampleCount} 次记录`
      : rank.source === "baseline"
        ? "基于自评（记录满 3 次后自动接管）"
        : "尚未定级 · 先去打卡";

  return (
    <div className="mx-4 mt-2 rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="mb-1 text-[11px] text-muted">当前瞄准段位</div>
          <RankBadge tier={rank.tier} size="lg" />
        </div>
        <ChevronRight size={20} className="text-dim" />
        <div className="text-right">
          <div className="mb-1 text-[11px] text-muted">下一目标</div>
          <RankBadge tier={goal} size="lg" />
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-1.5 flex justify-between text-[11px]">
          <span className="text-muted">今日达标 {metCount} / {total} 项</span>
          <span className="text-brand">{pct}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-bg2">
          <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="mt-2 text-[11px] text-dim">{sourceLabel}</div>
    </div>
  );
}
