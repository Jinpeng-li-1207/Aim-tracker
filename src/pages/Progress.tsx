import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { computeRank } from "@/lib/rank";
import { ProgressChart } from "@/components/charts/ProgressChart";
import { RankHistoryChart } from "@/components/charts/RankHistoryChart";
import { RankBadge } from "@/components/rank/RankBadge";
import type { TrainingSession } from "@/lib/types";

function personalBests(sessions: TrainingSession[]) {
  const speed = sessions.filter((s) => s.testType === "speed") as Extract<TrainingSession, { testType: "speed" }>[];
  const elim = sessions.filter((s) => s.testType === "eliminate") as Extract<TrainingSession, { testType: "eliminate" }>[];
  const bestSpeed = speed.length ? Math.max(...speed.map((s) => s.score)) : null;
  const bestElim = elim.length ? Math.min(...elim.map((s) => s.completionSeconds)) : null;
  return { bestSpeed, bestElim, count: sessions.length };
}

export function Progress() {
  const sessions = useLiveQuery(() => db.sessions.toArray(), []) ?? [];
  const profile = useLiveQuery(() => db.profile.get("me"), []);
  const rank = useMemo(() => computeRank(sessions, profile?.gameRank), [sessions, profile]);
  const pb = useMemo(() => personalBests(sessions), [sessions]);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-line bg-surface p-3 text-center">
          <div className="mb-1 text-[11px] text-muted">当前段位</div>
          <RankBadge tier={rank.tier} size="sm" />
        </div>
        <div className="rounded-xl border border-line bg-surface p-3 text-center">
          <div className="mb-1 text-[11px] text-muted">最佳命中</div>
          <div className="text-lg text-ink">
            {pb.bestSpeed ?? "—"}
            <span className="text-xs text-dim">/30</span>
          </div>
        </div>
        <div className="rounded-xl border border-line bg-surface p-3 text-center">
          <div className="mb-1 text-[11px] text-muted">最快消灭</div>
          <div className="text-lg text-ink">
            {pb.bestElim ?? "—"}
            <span className="text-xs text-dim">s</span>
          </div>
        </div>
      </div>

      <RankHistoryChart sessions={sessions} />

      <ProgressChart sessions={sessions} />

      <div className="text-center text-[11px] text-dim">共 {pb.count} 条训练记录</div>
    </div>
  );
}
