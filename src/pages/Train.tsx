import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Plus, ChevronDown } from "lucide-react";
import { db } from "@/lib/db";
import { computeRank, computeForm } from "@/lib/rank";
import { buildTodayDrills } from "@/lib/adaptiveTemplate";
import { TargetHeader } from "@/components/train/TargetHeader";
import { DrillCard } from "@/components/train/DrillCard";
import { SessionForm } from "@/components/training/SessionForm";

export function Train() {
  const sessions = useLiveQuery(() => db.sessions.toArray(), []) ?? [];
  const profile = useLiveQuery(() => db.profile.get("me"), []);
  const [customOpen, setCustomOpen] = useState(false);

  const rank = useMemo(
    () => computeRank(sessions, profile?.gameRank),
    [sessions, profile],
  );
  const form = useMemo(() => computeForm(sessions), [sessions]);
  const drills = useMemo(
    () => buildTodayDrills(rank.tier, sessions),
    [rank.tier, sessions],
  );

  return (
    <div className="flex flex-col gap-3 pb-6">
      <TargetHeader rank={rank} form={form} gameRank={profile?.gameRank} drills={drills} />

      <div className="mt-1 flex items-center justify-between px-4">
        <span className="text-sm text-ink">今日训练</span>
        <span className="text-[11px] text-dim">下一段位目标 · 自适应</span>
      </div>

      {drills.map((d) => (
        <DrillCard key={d.drill.key} today={d} />
      ))}

      <div className="mx-4 mt-2">
        <button
          onClick={() => setCustomOpen((v) => !v)}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-line bg-surface py-2.5 text-sm text-muted active:scale-[0.99]"
        >
          {customOpen ? <ChevronDown size={16} /> : <Plus size={16} />}
          自定义记一笔
        </button>
        {customOpen && (
          <div className="mt-3 rounded-xl border border-line bg-surface p-4">
            <SessionForm onSuccess={() => setCustomOpen(false)} />
          </div>
        )}
      </div>
    </div>
  );
}
