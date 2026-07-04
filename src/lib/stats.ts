import type { TrainingSession } from "./types";
import { dayKey, todayKey, shiftDay, shortDay } from "./date";

// 连续打卡：当前连续天数 + 历史最长 + 总打卡天数
export function computeStreak(sessions: TrainingSession[]): {
  current: number;
  longest: number;
  days: number;
} {
  const dayset = new Set(sessions.map((s) => dayKey(s.createdAt)));
  const days = dayset.size;

  // 当前连击：从今天（或昨天，若今天还没练）往回连续计数
  let cursor = dayset.has(todayKey()) ? todayKey() : shiftDay(todayKey(), -1);
  let current = 0;
  while (dayset.has(cursor)) {
    current++;
    cursor = shiftDay(cursor, -1);
  }

  // 历史最长连击
  const sorted = [...dayset].sort();
  let longest = 0;
  let run = 0;
  let prev: string | null = null;
  for (const k of sorted) {
    run = prev && shiftDay(prev, 1) === k ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = k;
  }

  return { current, longest, days };
}

export interface ConfigRow {
  key: string;
  zh: string;
  en: string;
  testType: "speed" | "eliminate";
  difficulty?: "easy" | "medium" | "hard";
  targetCount?: 50 | 100;
  count: number;
  best: number | null;
  points: { d: string; v: number }[]; // 按时间先后
}

// 五个规范训练项（始终展示）
export const CONFIG_DEFS: Omit<ConfigRow, "count" | "best" | "points">[] = [
  { key: "speed-easy", zh: "简单靶", en: "Easy", testType: "speed", difficulty: "easy" },
  { key: "speed-medium", zh: "中级靶", en: "Medium", testType: "speed", difficulty: "medium" },
  { key: "speed-hard", zh: "困难靶", en: "Hard", testType: "speed", difficulty: "hard" },
  { key: "elim-50", zh: "消灭 50", en: "Eliminate 50", testType: "eliminate", targetCount: 50 },
  { key: "elim-100", zh: "消灭 100", en: "Eliminate 100", testType: "eliminate", targetCount: 100 },
];

// 全部 5 项：有数据的按次数降序在前，未训练的按固定顺序在后
export function allConfigRows(sessions: TrainingSession[]): ConfigRow[] {
  const data = new Map<string, { count: number; best: number; points: { d: string; v: number }[] }>();
  const sorted = [...sessions].sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  for (const s of sorted) {
    let key: string;
    let value: number;
    const isSpeed = s.testType === "speed";
    if (s.testType === "speed") {
      key = `speed-${s.difficulty}`;
      value = s.score;
    } else if (s.testType === "eliminate") {
      key = `elim-${s.targetCount}`;
      value = s.completionSeconds;
    } else {
      continue;
    }
    const r = data.get(key) ?? { count: 0, best: isSpeed ? -Infinity : Infinity, points: [] };
    r.count += 1;
    r.points.push({ d: shortDay(s.createdAt), v: value });
    r.best = isSpeed ? Math.max(r.best, value) : Math.min(r.best, value);
    data.set(key, r);
  }

  const rows: ConfigRow[] = CONFIG_DEFS.map((def) => {
    const d = data.get(def.key);
    return { ...def, count: d?.count ?? 0, best: d ? d.best : null, points: d?.points ?? [] };
  });

  const idx = (k: string) => CONFIG_DEFS.findIndex((d) => d.key === k);
  return rows.sort((a, b) => b.count - a.count || idx(a.key) - idx(b.key));
}

// 灵敏度分组：每个灵敏度下速度测试的平均命中
export function sensitivityBreakdown(
  sessions: TrainingSession[],
): { sens: number; avgScore: number; count: number }[] {
  const groups = new Map<number, number[]>();
  for (const s of sessions) {
    if (s.testType !== "speed" || s.sensitivity === undefined) continue;
    const arr = groups.get(s.sensitivity) ?? [];
    arr.push(s.score);
    groups.set(s.sensitivity, arr);
  }
  return [...groups.entries()]
    .map(([sens, arr]) => ({
      sens,
      avgScore: Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10,
      count: arr.length,
    }))
    .sort((a, b) => a.sens - b.sens);
}
