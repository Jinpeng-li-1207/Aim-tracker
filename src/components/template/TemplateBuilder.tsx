import { useState } from "react";
import { nanoid } from "nanoid";
import { Plus, X } from "lucide-react";
import { db } from "@/lib/db";
import { WEAPONS, DIFFICULTIES, SIDES, TEST_TYPE_META } from "@/lib/constants";
import type { Difficulty, Side, TemplateTask } from "@/lib/types";

type BuilderType = "speed" | "eliminate";

const pill = (active: boolean) =>
  `rounded-lg py-1.5 text-xs transition-colors ${active ? "bg-brand text-white" : "bg-bg2 text-muted"}`;

export function TemplateBuilder({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState("");
  const [tasks, setTasks] = useState<TemplateTask[]>([]);

  // 当前正在拼装的动作
  const [type, setType] = useState<BuilderType>("speed");
  const [weapon, setWeapon] = useState("Vandal");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [targetCount, setTargetCount] = useState<50 | 100>(100);
  const [side, setSide] = useState<Side>("front");
  const [target, setTarget] = useState("");
  const [requiredPasses, setRequiredPasses] = useState(1);
  const [consecutive, setConsecutive] = useState(false);

  const addTask = () => {
    const t = Number(target);
    if (!target || Number.isNaN(t)) return;
    const task: TemplateTask =
      type === "speed"
        ? {
            id: nanoid(),
            order: tasks.length + 1,
            testType: "speed",
            weapon,
            difficulty,
            targetScore: t,
            requiredPasses,
            consecutive,
            instructions: "",
          }
        : {
            id: nanoid(),
            order: tasks.length + 1,
            testType: "eliminate",
            weapon,
            targetCount,
            side,
            targetSeconds: t,
            requiredPasses,
            consecutive,
            instructions: "",
          };
    setTasks((prev) => [...prev, task]);
    setTarget("");
  };

  const removeTask = (id: string) => setTasks((prev) => prev.filter((t) => t.id !== id));

  const save = async () => {
    if (!name.trim() || tasks.length === 0) return;
    await db.templates.put({
      id: nanoid(),
      name: name.trim(),
      author: "我的",
      description: `${tasks.length} 个动作`,
      tasks,
      createdAt: new Date().toISOString(),
      isBuiltIn: false,
    });
    setName("");
    setTasks([]);
    onDone();
  };

  const taskSummary = (t: TemplateTask) => {
    const pass = (t.requiredPasses ?? 1) > 1 ? ` · ${t.consecutive ? "连续" : ""}达标${t.requiredPasses}次` : "";
    if (t.testType === "speed") {
      const d = DIFFICULTIES.find((x) => x.id === t.difficulty);
      return `${d?.zh}靶 · 目标 ${t.targetScore}/30${pass}`;
    }
    const sd = SIDES.find((x) => x.id === t.side);
    return `${sd?.zh} ${t.targetCount}靶 · 目标 ${t.targetSeconds}s${pass}`;
  };

  return (
    <div className="flex flex-col gap-3.5 rounded-xl border border-line bg-surface p-4">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="模板名称，如「我的日常」"
        className="rounded-lg px-3 py-2 text-sm text-ink"
      />

      {tasks.length > 0 && (
        <ol className="flex flex-col gap-1.5">
          {tasks.map((t, i) => (
            <li key={t.id} className="flex items-center gap-2 rounded-lg bg-bg2 px-3 py-2 text-[12px]">
              <span className="text-brand">{i + 1}</span>
              <span className="flex-1 text-ink">{taskSummary(t)}</span>
              <button onClick={() => removeTask(t.id)} className="text-dim">
                <X size={14} />
              </button>
            </li>
          ))}
        </ol>
      )}

      <div className="flex flex-col gap-2.5 rounded-lg border border-line p-3">
        <div className="text-[11px] text-muted">添加动作</div>
        <div className="grid grid-cols-2 gap-2">
          {(["speed", "eliminate"] as BuilderType[]).map((t) => (
            <button key={t} onClick={() => setType(t)} className={pill(type === t)}>
              {TEST_TYPE_META[t].zh}
            </button>
          ))}
        </div>

        {type === "speed" && (
          <div className="grid grid-cols-3 gap-2">
            {DIFFICULTIES.map((d) => (
              <button key={d.id} onClick={() => setDifficulty(d.id)} className={pill(difficulty === d.id)}>
                {d.zh}
              </button>
            ))}
          </div>
        )}

        {type === "eliminate" && (
          <>
            <div className="grid grid-cols-2 gap-2">
              {[50, 100].map((n) => (
                <button key={n} onClick={() => setTargetCount(n as 50 | 100)} className={pill(targetCount === n)}>
                  消灭 {n}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {SIDES.map((s) => (
                <button key={s.id} onClick={() => setSide(s.id)} className={pill(side === s.id)}>
                  {s.zh}
                </button>
              ))}
            </div>
          </>
        )}

        <div className="flex gap-2">
          <input
            type="number"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder={type === "speed" ? "目标命中 /30" : "目标耗时 秒"}
            className="flex-1 rounded-lg px-3 py-2 text-sm text-ink"
          />
          <select value={weapon} onChange={(e) => setWeapon(e.target.value)} className="rounded-lg px-2 py-2 text-sm text-ink">
            {WEAPONS.map((w) => (
              <option key={w}>{w}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-[11px] text-muted">
            达标次数
            <input
              type="number"
              min={1}
              max={10}
              value={requiredPasses}
              onChange={(e) => setRequiredPasses(Math.max(1, Number(e.target.value)))}
              className="w-14 rounded-lg px-2 py-1.5 text-sm text-ink"
            />
          </label>
          <label className="flex items-center gap-1.5 text-[11px] text-muted">
            <input type="checkbox" checked={consecutive} onChange={(e) => setConsecutive(e.target.checked)} />
            需连续
          </label>
        </div>

        <button
          onClick={addTask}
          className="flex items-center justify-center gap-1 rounded-lg border border-line bg-bg2 py-2 text-sm text-muted active:scale-[0.99]"
        >
          <Plus size={15} /> 添加动作
        </button>
      </div>

      <button
        onClick={save}
        disabled={!name.trim() || tasks.length === 0}
        className="rounded-xl bg-brand py-2.5 font-medium text-white active:scale-[0.98] disabled:opacity-40"
      >
        保存模板
      </button>
    </div>
  );
}
