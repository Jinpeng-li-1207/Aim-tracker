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
