import { useState } from "react";
import { nanoid } from "nanoid";
import { CheckCircle2, Circle, X } from "lucide-react";
import { db } from "@/lib/db";
import { drillLabel } from "@/lib/adaptiveTemplate";
import type { TodayDrill, TrainingSession } from "@/lib/types";

export function DrillCard({ today }: { today: TodayDrill }) {
  const { drill, targetValue, todayBest, met } = today;
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  const label = drillLabel(drill);
  const isSpeed = drill.testType === "speed";
  const unit = isSpeed ? "/30 命中" : "秒";
  const targetText = isSpeed ? `≥ ${targetValue}/30` : `≤ ${targetValue}s`;

  const submit = async () => {
    const n = Number(value);
    if (!value || Number.isNaN(n)) return;
    const base = {
      id: nanoid(),
      createdAt: new Date().toISOString(),
      weapon: drill.weapon,
      botArmor: drill.botArmor,
      infiniteAmmo: true,
      strafe: drill.strafe,
    };
    let s: TrainingSession;
    if (drill.testType === "speed") {
      s = { ...base, testType: "speed", difficulty: drill.difficulty!, score: n };
    } else {
      s = {
        ...base,
        testType: "eliminate",
        targetCount: drill.targetCount!,
        side: drill.side ?? "front",
        completionSeconds: n,
      };
    }
    await db.sessions.add(s);
    setValue("");
    setOpen(false);
  };

  const borderClass = met ? "border-teal/40" : "border-line";

  return (
    <div className={`mx-4 rounded-xl border bg-surface p-3 ${borderClass}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {met ? (
            <CheckCircle2 size={20} className="text-teal" />
          ) : (
            <Circle size={20} className="text-dim" />
          )}
          <div>
            <div className="text-[13px] text-ink">
              {label.zh} <span className="text-dim">{label.en}</span>
            </div>
            <div className="mt-0.5 text-[11px] text-muted">
              目标 {targetText}
              {drill.strafe && " · 移动靶 Strafe"}
              {drill.botArmor && " · 护甲 Armor"}
              {todayBest !== null && (
                <span className={met ? "text-teal" : "text-brand"}>
                  {" "}· 今日 {todayBest}
                  {isSpeed ? "/30" : "s"}
                </span>
              )}
            </div>
          </div>
        </div>
        {!open && (
          <button
            onClick={() => setOpen(true)}
            className="rounded-lg bg-brand px-3 py-1.5 text-[11px] font-medium text-white active:scale-95"
          >
            填成绩
          </button>
        )}
        {open && (
          <button onClick={() => setOpen(false)} className="p-1 text-dim">
            <X size={16} />
          </button>
        )}
      </div>

      {open && (
        <div className="mt-3 flex items-center gap-2">
          <input
            autoFocus
            type="number"
            inputMode="numeric"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={isSpeed ? "命中数" : "耗时秒"}
            className="flex-1 rounded-lg px-3 py-2 text-sm"
          />
          <span className="text-[11px] text-muted">{unit}</span>
          <button
            onClick={submit}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white active:scale-95"
          >
            打卡
          </button>
        </div>
      )}
    </div>
  );
}
