import { useState } from "react";
import { nanoid } from "nanoid";
import { CheckCircle2, Circle, X, Trophy } from "lucide-react";
import { db } from "@/lib/db";
import { drillLabel } from "@/lib/adaptiveTemplate";
import type { TodayDrill, TrainingSession } from "@/lib/types";

interface Props {
  today: TodayDrill;
  templateId?: string;
  sensitivity?: number;
}

export function DrillCard({ today, templateId, sensitivity }: Props) {
  const { drill, targetValue, attempts, recentBest, allTimeBest, metCount, met } = today;
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [pb, setPb] = useState(false);

  const label = drillLabel(drill);
  const isSpeed = drill.testType === "speed";
  const unit = isSpeed ? "/30 命中" : "秒";
  const targetText = isSpeed ? `≥ ${targetValue}/30` : `≤ ${targetValue}s`;
  const meets = (v: number) => (isSpeed ? v >= targetValue : v <= targetValue);

  const gapText = (() => {
    if (met || recentBest === null) return null;
    const g = isSpeed ? targetValue - recentBest : recentBest - targetValue;
    if (g <= 0) return null;
    return isSpeed ? `距目标还差 +${g}` : `再快 ${g}s 达标`;
  })();

  const submit = async () => {
    const n = Number(value);
    if (!value || Number.isNaN(n)) return;
    const isPb = allTimeBest === null || (isSpeed ? n > allTimeBest : n < allTimeBest);
    const base = {
      id: nanoid(),
      createdAt: new Date().toISOString(),
      weapon: drill.weapon,
      botArmor: drill.botArmor,
      infiniteAmmo: true,
      strafe: drill.strafe,
      ...(sensitivity !== undefined ? { sensitivity } : {}),
      ...(templateId ? { templateId, templateTaskId: drill.key } : {}),
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
    if (isPb) {
      setPb(true);
      setTimeout(() => setPb(false), 2600);
    }
  };

  return (
    <div className={`mx-4 rounded-xl border bg-surface p-3 ${met ? "border-teal/40" : "border-line"}`}>
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
              {drill.strafe && " · 移动靶"}
              {attempts.length > 0 && (
                <span className="text-ink">
                  {" "}· 达标 <span className={metCount > 0 ? "text-teal" : "text-brand"}>{metCount}</span>/{attempts.length} 次
                </span>
              )}
              {gapText && <span className="text-brand"> · {gapText}</span>}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {pb && (
            <span className="inline-flex items-center gap-1 rounded-md bg-teal/15 px-1.5 py-1 text-[10px] text-teal">
              <Trophy size={12} /> 新纪录
            </span>
          )}
          {!open ? (
            <button
              onClick={() => setOpen(true)}
              className="rounded-lg bg-brand px-3 py-1.5 text-[11px] font-medium text-white active:scale-95"
            >
              {attempts.length > 0 ? "再记一次" : "填成绩"}
            </button>
          ) : (
            <button onClick={() => setOpen(false)} className="p-1 text-dim">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {attempts.length > 0 && (
        <div className="mt-3 flex gap-1.5">
          {attempts.map((v, i) => {
            const ok = meets(v);
            return (
              <div
                key={i}
                className="flex-1 rounded-lg border bg-bg2 py-1.5 text-center"
                style={{ borderColor: ok ? "rgba(20,216,196,0.35)" : "rgba(255,255,255,0.08)" }}
              >
                <div className={`text-sm ${ok ? "text-teal" : "text-muted"}`}>{v}</div>
                <div className="text-[9px] text-dim">
                  第{i + 1}组{ok ? " ✓" : ""}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {open && (
        <div className="mt-3 flex items-center gap-2">
          <input
            autoFocus
            type="number"
            inputMode="numeric"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={isSpeed ? "命中数" : "耗时秒"}
            className="flex-1 rounded-lg px-3 py-2 text-sm text-ink"
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
