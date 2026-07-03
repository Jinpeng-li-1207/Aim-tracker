import { useState } from "react";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { WEAPONS, DIFFICULTIES, SIDES, TEST_TYPE_META } from "@/lib/constants";
import type { TestType, Difficulty, Side, TrainingSession } from "@/lib/types";

const TEST_TYPES: TestType[] = ["speed", "eliminate", "practice"];

export function SessionForm({ onSuccess }: { onSuccess: () => void }) {
  const [testType, setTestType] = useState<TestType>("speed");
  const [weapon, setWeapon] = useState("Vandal");
  const [botArmor, setBotArmor] = useState(false);
  const [infiniteAmmo, setInfiniteAmmo] = useState(true);
  const [strafe, setStrafe] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("hard");
  const [score, setScore] = useState(0);
  const [targetCount, setTargetCount] = useState<50 | 100>(100);
  const [side, setSide] = useState<Side>("front");
  const [completionSeconds, setCompletionSeconds] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [notes, setNotes] = useState("");

  const submit = async () => {
    const b = { id: nanoid(), createdAt: new Date().toISOString(), weapon, botArmor, infiniteAmmo, strafe, notes };
    let s: TrainingSession;
    if (testType === "speed") s = { ...b, testType, difficulty, score };
    else if (testType === "eliminate") s = { ...b, testType, targetCount, side, completionSeconds };
    else s = { ...b, testType, durationMinutes };
    await db.sessions.add(s);
    onSuccess();
  };

  const numField = (label: string, val: number, set: (n: number) => void, max = 9999) => (
    <label className="flex flex-col gap-1.5 text-xs text-muted">
      {label}
      <input
        type="number"
        min={0}
        max={max}
        value={val}
        onChange={(e) => set(Number(e.target.value))}
        className="rounded-lg px-3 py-2 text-sm text-ink"
      />
    </label>
  );

  const pill = (active: boolean) =>
    `rounded-lg py-2 text-xs transition-colors ${active ? "bg-brand text-white" : "bg-bg2 text-muted"}`;

  return (
    <div className="flex flex-col gap-3.5">
      <div className="grid grid-cols-3 gap-2">
        {TEST_TYPES.map((t) => (
          <button key={t} onClick={() => setTestType(t)} className={pill(testType === t)}>
            {TEST_TYPE_META[t].zh}
            <span className="mt-0.5 block text-[10px] opacity-70">{TEST_TYPE_META[t].en}</span>
          </button>
        ))}
      </div>

      <label className="flex flex-col gap-1.5 text-xs text-muted">
        武器 Weapon
        <select value={weapon} onChange={(e) => setWeapon(e.target.value)} className="rounded-lg px-3 py-2 text-sm text-ink">
          {WEAPONS.map((w) => (
            <option key={w}>{w}</option>
          ))}
        </select>
      </label>

      {testType === "speed" && (
        <>
          <div className="grid grid-cols-3 gap-2">
            {DIFFICULTIES.map((d) => (
              <button key={d.id} onClick={() => setDifficulty(d.id)} className={pill(difficulty === d.id)}>
                {d.zh}
                <span className="mt-0.5 block text-[10px] opacity-70">{d.en}</span>
              </button>
            ))}
          </div>
          {numField("命中数 Hits (/30)", score, setScore, 30)}
        </>
      )}

      {testType === "eliminate" && (
        <>
          <div className="grid grid-cols-2 gap-2">
            {[50, 100].map((n) => (
              <button key={n} onClick={() => setTargetCount(n as 50 | 100)} className={pill(targetCount === n)}>
                消灭 {n} · Eliminate {n}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {SIDES.map((sd) => (
              <button key={sd.id} onClick={() => setSide(sd.id)} className={pill(side === sd.id)}>
                {sd.zh}
                <span className="mt-0.5 block text-[10px] opacity-70">{sd.en}</span>
              </button>
            ))}
          </div>
          {numField("完成耗时 Time (秒)", completionSeconds, setCompletionSeconds, 600)}
        </>
      )}

      {testType === "practice" && numField("训练时长 Duration (分钟)", durationMinutes, setDurationMinutes, 120)}

      <div className="flex flex-wrap gap-4 text-xs text-muted">
        <label className="flex items-center gap-1.5">
          <input type="checkbox" checked={botArmor} onChange={(e) => setBotArmor(e.target.checked)} />
          护甲 Armor
        </label>
        <label className="flex items-center gap-1.5">
          <input type="checkbox" checked={infiniteAmmo} onChange={(e) => setInfiniteAmmo(e.target.checked)} />
          无限弹药 Ammo
        </label>
        <label className="flex items-center gap-1.5">
          <input type="checkbox" checked={strafe} onChange={(e) => setStrafe(e.target.checked)} />
          移动靶 Strafe
        </label>
      </div>

      <textarea
        placeholder="备注（可选） Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="rounded-lg px-3 py-2 text-sm text-ink"
        rows={2}
      />
      <button onClick={submit} className="rounded-xl bg-brand py-2.5 font-medium text-white active:scale-[0.98]">
        打卡记录
      </button>
    </div>
  );
}
