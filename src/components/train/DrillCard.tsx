import { useState } from "react";
import { nanoid } from "nanoid";
import { CheckCircle2, Circle, Trophy, X } from "lucide-react";
import { db } from "@/lib/db";
import { drillLabel } from "@/lib/adaptiveTemplate";
import type { TodayDrill, TrainingSession } from "@/lib/types";

interface Props {
  today: TodayDrill;
  templateId?: string;
  sensitivity?: number;
  onHide?: () => void;
}

export function DrillCard({ today, templateId, sensitivity, onHide }: Props) {
  const { drill, targetValue, attempts, recentBest, allTimeBest, requiredPasses, consecutive, passProgress, passed } = today;
  const [value, setValue] = useState("");
  const [pb, setPb] = useState(false);

  const label = drillLabel(drill);
  const isSpeed = drill.testType === "speed";
  const targetText = isSpeed ? `≥ ${targetValue}/30` : `≤ ${targetValue}s`;
  const meets = (v: number) => (isSpeed ? v >= targetValue : v <= targetValue);

  const passText =
    requiredPasses > 1 || consecutive
      ? `${consecutive ? "连续" : ""}通过 ${Math.min(passProgress, requiredPasses)}/${requiredPasses}`
      : passProgress > 0
        ? "已达标"
        : null;

  const gapText = (() => {
    if (passed || recentBest === null) return null;
    const g = isSpeed ? targetValue - recentBest : recentBest - targetValue;
    if (g <= 0) return null;
    return isSpeed ? `距目标 +${g}` : `再快 ${g}s`;
  })();

  const submit = async () => {
    const n = Number(value);
    if (value === "" || Number.isNaN(n)) return;
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
    if (isPb) {
      setPb(true);
      setTimeout(() => setPb(false), 2600);
    }
  };

  return (
    <div className={`mx-4 rounded-xl border bg-surface p-3 ${passed ? "border-teal/40" : "border-line"}`}>
      {/* 项目信息 + 移除 */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          {passed ? (
            <CheckCircle2 size={20} className="shrink-0 text-teal" />
          ) : (
            <Circle size={20} className="shrink-0 text-dim" />
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[13px] text-ink">
              <span className="truncate">
                {label.zh} <span className="text-dim">{label.en}</span>
              </span>
              {pb && (
                <span className="inline-flex shrink-0 items-center gap-0.5 rounded bg-teal/15 px-1 py-0.5 text-[9px] text-teal">
                  <Trophy size={10} /> 新纪录
                </span>
              )}
            </div>
            <div className="mt-0.5 text-[11px] text-muted">
              目标 {targetText}
              {drill.strafe && " · 移动"}
              {passText && <span className={passed ? "text-teal" : "text-ink"}> · {passText}</span>}
              {gapText && <span className="text-brand"> · {gapText}</span>}
            </div>
          </div>
        </div>
        {onHide && (
          <button
            onClick={onHide}
            aria-label="从今日训练移除该项"
            className="-mr-1 -mt-1 shrink-0 rounded p-1 text-dim active:text-brand"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* 成绩录入 */}
      <div className="mt-2.5 flex items-center gap-2">
        <input
          type="number"
          inputMode="numeric"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder={isSpeed ? "本轮命中数" : "本轮耗时(秒)"}
          className="min-w-0 flex-1 rounded-lg px-3 py-2 text-sm text-ink"
        />
        <button
          onClick={submit}
          className="shrink-0 rounded-lg bg-brand px-5 py-2 text-sm font-medium text-white active:scale-95"
        >
          打卡
        </button>
      </div>

      {/* 今日各组 */}
      {attempts.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {attempts.map((a, i) => {
            const ok = meets(a.value);
            return (
              <div
                key={a.id}
                className="relative min-w-[48px] flex-1 rounded-lg border bg-bg2 py-1.5 text-center"
                style={{ borderColor: ok ? "rgba(20,216,196,0.35)" : "rgba(255,255,255,0.08)" }}
              >
                <button
                  onClick={() => db.sessions.delete(a.id)}
                  aria-label="删除这组"
                  className="absolute right-0.5 top-0.5 text-dim active:text-brand"
                >
                  <X size={11} />
                </button>
                <div className={`text-sm ${ok ? "text-teal" : "text-muted"}`}>{a.value}</div>
                <div className="text-[9px] text-dim">
                  第{i + 1}组{ok ? " ✓" : ""}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
