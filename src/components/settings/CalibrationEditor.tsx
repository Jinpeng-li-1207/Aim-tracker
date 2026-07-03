import { useState } from "react";
import { db } from "@/lib/db";
import {
  getCalibration,
  cloneCalibration,
  DEFAULT_CALIBRATION,
  type Calibration,
} from "@/lib/calibration";
import { TIER_ORDER, TIER_META } from "@/lib/constants";

const EDIT_TIERS = TIER_ORDER.filter((t) => t !== "iron");
const SPEED_KEYS = [
  { key: "easy", label: "简单 Easy" },
  { key: "medium", label: "中级 Medium" },
  { key: "hard", label: "困难 Hard" },
];
const ELIM_KEYS = [
  { key: "50", label: "消灭 50 Eliminate" },
  { key: "100", label: "消灭 100 Eliminate" },
];

export function CalibrationEditor() {
  const [cal, setCal] = useState<Calibration>(() => cloneCalibration(getCalibration()));
  const [saved, setSaved] = useState(false);

  const setCell = (group: "speed" | "eliminate", key: string, tier: string, v: number) => {
    setCal((prev) => {
      const next = cloneCalibration(prev);
      next[group][key][tier] = v;
      return next;
    });
    setSaved(false);
  };

  const save = async () => {
    await db.settings.put({ id: "calibration", value: cal });
    setSaved(true);
    setTimeout(() => window.location.reload(), 400);
  };

  const reset = () => {
    setCal(cloneCalibration(DEFAULT_CALIBRATION));
    setSaved(false);
  };

  const grid = (group: "speed" | "eliminate", key: string) => (
    <div className="grid grid-cols-2 gap-2">
      {EDIT_TIERS.map((t) => (
        <label key={t} className="flex items-center justify-between gap-2 text-[11px]">
          <span style={{ color: TIER_META[t].color }}>{TIER_META[t].zh}</span>
          <input
            type="number"
            value={cal[group][key]?.[t] ?? 0}
            onChange={(e) => setCell(group, key, t, Number(e.target.value))}
            className="w-16 rounded px-2 py-1 text-xs text-ink"
          />
        </label>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[11px] text-muted">
        速度 = 命中数（≥ 即该段），消灭 = 完成秒数（≤ 即该段）。填入你从主播/社区收集的标准，保存后重新计算段位。
      </p>
      {SPEED_KEYS.map((s) => (
        <div key={s.key}>
          <div className="mb-1.5 text-xs text-ink">速度 · {s.label}</div>
          {grid("speed", s.key)}
        </div>
      ))}
      {ELIM_KEYS.map((s) => (
        <div key={s.key}>
          <div className="mb-1.5 text-xs text-ink">{s.label}（秒）</div>
          {grid("eliminate", s.key)}
        </div>
      ))}
      <div className="flex gap-2">
        <button
          onClick={reset}
          className="flex-1 rounded-lg border border-line bg-bg2 py-2 text-sm text-muted active:scale-[0.99]"
        >
          恢复默认
        </button>
        <button
          onClick={save}
          className="flex-1 rounded-lg bg-brand py-2 text-sm font-medium text-white active:scale-[0.98]"
        >
          {saved ? "已保存 ✓" : "保存并生效"}
        </button>
      </div>
    </div>
  );
}
