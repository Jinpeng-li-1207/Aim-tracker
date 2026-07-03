import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Plus, ChevronDown, X } from "lucide-react";
import { db } from "@/lib/db";
import { computeRank, computeForm } from "@/lib/rank";
import { buildTodayDrills, buildTemplateDrills } from "@/lib/adaptiveTemplate";
import { TargetHeader } from "@/components/train/TargetHeader";
import { DrillCard } from "@/components/train/DrillCard";
import { SessionForm } from "@/components/training/SessionForm";
import type { TrainingTemplate } from "@/lib/types";

interface Props {
  activeTemplate: TrainingTemplate | null;
  onExitTemplate: () => void;
}

export function Train({ activeTemplate, onExitTemplate }: Props) {
  const sessions = useLiveQuery(() => db.sessions.toArray(), []) ?? [];
  const profile = useLiveQuery(() => db.profile.get("me"), []);
  const [customOpen, setCustomOpen] = useState(false);

  const rank = useMemo(() => computeRank(sessions, profile?.gameRank), [sessions, profile]);
  const form = useMemo(() => computeForm(sessions), [sessions]);
  const drills = useMemo(
    () =>
      activeTemplate
        ? buildTemplateDrills(activeTemplate, sessions)
        : buildTodayDrills(rank.tier, sessions),
    [activeTemplate, rank.tier, sessions],
  );

  return (
    <div className="flex flex-col gap-3 pb-6">
      <TargetHeader rank={rank} form={form} gameRank={profile?.gameRank} drills={drills} />

      <div className="mt-1 flex items-center justify-between px-4">
        <span className="text-sm text-ink">今日训练</span>
        {activeTemplate ? (
          <button
            onClick={onExitTemplate}
            className="inline-flex items-center gap-1 text-[11px] text-brand"
          >
            <X size={12} /> 退出模板
          </button>
        ) : (
          <span className="text-[11px] text-dim">下一段位目标 · 自适应</span>
        )}
      </div>

      {activeTemplate && (
        <div className="mx-4 -mt-1 rounded-lg border border-brand/30 bg-brand/10 px-3 py-2 text-[11px] text-brand">
          正在按模板训练：{activeTemplate.name}
        </div>
      )}

      {drills.map((d) => (
        <DrillCard key={d.drill.key} today={d} templateId={activeTemplate?.id} />
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
