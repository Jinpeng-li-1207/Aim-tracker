import { useMemo, type ReactNode } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { computeRank } from "@/lib/rank";
import { computeStreak } from "@/lib/stats";
import { ProgressChart } from "@/components/charts/ProgressChart";
import { RankBadge } from "@/components/rank/RankBadge";
import type { TrainingSession } from "@/lib/types";

function personalBests(sessions: TrainingSession[]) {
  const speed = sessions.filter((s) => s.testType === "speed") as Extract<TrainingSession, { testType: "speed" }>[];
  const elim = sessions.filter((s) => s.testType === "eliminate") as Extract<TrainingSession, { testType: "eliminate" }>[];
  const bestSpeed = speed.length ? Math.max(...speed.map((s) => s.score)) : null;
  const bestElim = elim.length ? Math.min(...elim.map((s) => s.completionSeconds)) : null;
  return { bestSpeed, bestElim, count: sessions.length };
}

function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-3 text-center">
      <div className="mb-1 text-[11px] text-muted">{label}</div>
      {children}
    </div>
  );
}

export function Progress() {
  const sessions = useLiveQuery(() => db.sessions.toArray(), []) ?? [];
  const profile = useLiveQuery(() => db.profile.get("me"), []);
  const rank = useMemo(() => computeRank(sessions, profile?.gameRank), [sessions, profile]);
  const pb = useMemo(() => personalBests(sessions), [sessions]);
  const streak = useMemo(() => computeStreak(sessions), [sessions]);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="grid grid-cols-2 gap-2">
        <Stat label="当前段位">
          <RankBadge tier={rank.tier} size="sm" />
        </Stat>
        <Stat label="连续打卡">
          <div className="text-lg text-ink">
            {streak.current}
            <span className="text-xs text-dim"> 天</span>
          </div>
        </Stat>
        <Stat label="最佳命中">
          <div className="text-lg text-ink">
            {pb.bestSpeed ?? "—"}
            <span className="text-xs text-dim">/30</span>
          </div>
        </Stat>
        <Stat label="最快消灭">
          <div className="text-lg text-ink">
            {pb.bestElim ?? "—"}
            <span className="text-xs text-dim">s</span>
          </div>
        </Stat>
      </div>

      <ProgressChart sessions={sessions} />

      <div className="text-center text-[11px] text-dim">共 {pb.count} 条训练记录</div>
    </div>
  );
}
