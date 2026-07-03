import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { computeRank } from "@/lib/rank";
import { computeStreak } from "@/lib/stats";
import { ConfigBreakdown } from "@/components/stats/ConfigBreakdown";
import { RankBadge } from "@/components/rank/RankBadge";

export function Progress() {
  const sessions = useLiveQuery(() => db.sessions.toArray(), []) ?? [];
  const profile = useLiveQuery(() => db.profile.get("me"), []);
  const rank = useMemo(() => computeRank(sessions, profile?.gameRank), [sessions, profile]);
  const streak = useMemo(() => computeStreak(sessions), [sessions]);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-line bg-surface p-3 text-center">
          <div className="mb-1 text-[11px] text-muted">当前段位</div>
          <RankBadge tier={rank.tier} size="sm" />
        </div>
        <div className="rounded-xl border border-line bg-surface p-3 text-center">
          <div className="mb-1 text-[11px] text-muted">连续打卡</div>
          <div className="text-lg text-ink">
            {streak.current}
            <span className="text-xs text-dim"> 天</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-1">
        <span className="text-sm text-ink">各项训练</span>
        <span className="text-[11px] text-dim">练得越多越靠前</span>
      </div>

      <ConfigBreakdown sessions={sessions} currentTier={rank.tier} />

      <div className="text-center text-[11px] text-dim">共 {sessions.length} 条训练记录</div>
    </div>
  );
}
