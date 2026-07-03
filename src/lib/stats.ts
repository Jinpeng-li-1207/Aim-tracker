import type { TrainingSession } from "./types";

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function shift(dateKey: string, deltaDays: number): string {
  const d = new Date(dateKey + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + deltaDays);
  return d.toISOString().slice(0, 10);
}

// 连续打卡：当前连续天数 + 历史最长 + 总打卡天数
export function computeStreak(sessions: TrainingSession[]): {
  current: number;
  longest: number;
  days: number;
} {
  const dayset = new Set(sessions.map((s) => dayKey(s.createdAt)));
  const days = dayset.size;

  // 当前连击：从今天（或昨天，若今天还没练）往回连续计数
  let cursor = dayset.has(todayKey()) ? todayKey() : shift(todayKey(), -1);
  let current = 0;
  while (dayset.has(cursor)) {
    current++;
    cursor = shift(cursor, -1);
  }

  // 历史最长连击
  const sorted = [...dayset].sort();
  let longest = 0;
  let run = 0;
  let prev: string | null = null;
  for (const k of sorted) {
    run = prev && shift(prev, 1) === k ? run + 1 : 1;
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
  count: number;
  best: number;
  values: number[]; // 按时间先后
}

// 按训练项配置聚合（速度按难度、消灭按靶数），练得多的排前
export function configBreakdown(sessions: TrainingSession[]): ConfigRow[] {
  const map = new Map<string, ConfigRow>();
  const sorted = [...sessions].sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  for (const s of sorted) {
    let key: string;
    let zh: string;
    let en: string;
    let testType: "speed" | "eliminate";
    let value: number;
    if (s.testType === "speed") {
      testType = "speed";
      key = `speed-${s.difficulty}`;
      zh = s.difficulty === "easy" ? "简单靶" : s.difficulty === "medium" ? "中级靶" : "困难靶";
      en = s.difficulty.charAt(0).toUpperCase() + s.difficulty.slice(1);
      value = s.score;
    } else if (s.testType === "eliminate") {
      testType = "eliminate";
      key = `elim-${s.targetCount}`;
      zh = `消灭 ${s.targetCount}`;
      en = `Eliminate ${s.targetCount}`;
      value = s.completionSeconds;
    } else {
      continue;
    }
    const r =
      map.get(key) ??
      { key, zh, en, testType, count: 0, best: testType === "speed" ? -Infinity : Infinity, values: [] };
    r.count += 1;
    r.values.push(value);
    r.best = testType === "speed" ? Math.max(r.best, value) : Math.min(r.best, value);
    map.set(key, r);
  }

  return [...map.values()].sort((a, b) => b.count - a.count);
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
