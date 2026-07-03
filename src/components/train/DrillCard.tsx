import { useState } from "react";
import { nanoid } from "nanoid";
import { CheckCircle2, Circle, X } from "lucide-react";
import { db } from "@/lib/db";
import { drillLabel } from "@/lib/adaptiveTemplate";
import type { TodayDrill, TrainingSession } from "@/lib/types";

export function DrillCard({ today }: { today: TodayDrill }) {
  const { drill, targetValue, attempts, metCount, met } = today;
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  const label = drillLabel(drill);
  const isSpeed = drill.testType === "speed";
  const unit = isSpeed ? "/30 命中" : "秒";
  const targetText = isSpeed ? `≥ ${targetValue}/30` : `≤ ${targetValue}s`;
  const meets = (v: number) => (isSpeed ? v >= targetValue : v <= targetValue);

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
              {drill.botArmor && " · 护甲"}
              {attempts.length > 0 && (
                <span className="text-ink">
                  {" "}· 达标 <span className={metCount > 0 ? "text-teal" : "text-brand"}>{metCount}</span>/{attempts.length} 次
                </span>
              )}
            </div>
          </div>
        </div>
        {!open ? (
          <button
            onClick={() => setOpen(true)}
            className="shrink-0 rounded-lg bg-brand px-3 py-1.5 text-[11px] font-medium text-white active:scale-95"
          >
            {attempts.length > 0 ? "再记一次" : "填成绩"}
          </button>
        ) : (
          <button onClick={() => setOpen(false)} className="shrink-0 p-1 text-dim">
            <X size={16} />
          </button>
        )}
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
