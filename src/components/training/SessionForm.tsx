import { useState } from "react";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { WEAPONS, DIFFICULTIES, SIDES } from "@/lib/constants";
import { TestTypeSelector } from "./TestTypeSelector";
import type { TestType, Difficulty, Side, TrainingSession } from "@/lib/types";

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
    const base = { id: nanoid(), createdAt: new Date().toISOString(), weapon, botArmor, infiniteAmmo, strafe, notes };
    let s: TrainingSession;
    if (testType === "speed") s = { ...base, testType, difficulty, score };
    else if (testType === "eliminate") s = { ...base, testType, targetCount, side, completionSeconds };
    else s = { ...base, testType, durationMinutes };
    await db.sessions.add(s);
    onSuccess();
  };

  const numField = (label: string, val: number, set: (n: number) => void, max = 9999) => (
    <label className="flex flex-col gap-1 text-sm">
      {label}
      <input
        type="number"
        min={0}
        max={max}
        value={val}
        onChange={(e) => set(Number(e.target.value))}
        className="rounded border px-2 py-1"
      />
    </label>
  );

  return (
    <div className="flex flex-col gap-4 p-4">
      <TestTypeSelector value={testType} onChange={setTestType} />
      <select value={weapon} onChange={(e) => setWeapon(e.target.value)} className="rounded border px-2 py-2">
        {WEAPONS.map((w) => (
          <option key={w}>{w}</option>
        ))}
      </select>

      {testType === "speed" && (
        <>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            className="rounded border px-2 py-2"
          >
            {DIFFICULTIES.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </select>
          {numField("命中数 (/30)", score, setScore, 30)}
        </>
      )}
      {testType === "eliminate" && (
        <>
          <div className="flex gap-2">
            {[50, 100].map((n) => (
              <button
                key={n}
                onClick={() => setTargetCount(n as 50 | 100)}
                className={`flex-1 rounded py-2 ${targetCount === n ? "bg-red-500 text-white" : "bg-gray-100"}`}
              >
                消灭 {n}
              </button>
            ))}
          </div>
          <select value={side} onChange={(e) => setSide(e.target.value as Side)} className="rounded border px-2 py-2">
            {SIDES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          {numField("完成耗时 (秒)", completionSeconds, setCompletionSeconds, 600)}
        </>
      )}
      {testType === "practice" && numField("训练时长 (分钟)", durationMinutes, setDurationMinutes, 120)}

      <div className="flex flex-wrap gap-3 text-sm">
        <label className="flex items-center gap-1">
          <input type="checkbox" checked={botArmor} onChange={(e) => setBotArmor(e.target.checked)} />
          护甲
        </label>
        <label className="flex items-center gap-1">
          <input type="checkbox" checked={infiniteAmmo} onChange={(e) => setInfiniteAmmo(e.target.checked)} />
          无限弹药
        </label>
        <label className="flex items-center gap-1">
          <input type="checkbox" checked={strafe} onChange={(e) => setStrafe(e.target.checked)} />
          假人移动
        </label>
      </div>

      <textarea
        placeholder="备注（可选）"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="rounded border px-2 py-1 text-sm"
        rows={2}
      />
      <button onClick={submit} className="rounded bg-red-500 py-2 font-semibold text-white hover:bg-red-600">
        打卡记录
      </button>
    </div>
  );
}
