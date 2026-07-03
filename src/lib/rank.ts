import { TIER_ORDER } from "./constants";
import { getCalibration } from "./calibration";
import type { Tier, TrainingSession, RankResult, FormState } from "./types";

export function tierIndex(tier: Tier): number {
  return TIER_ORDER.indexOf(tier);
}

export function nextTier(tier: Tier): Tier {
  const i = tierIndex(tier);
  return TIER_ORDER[Math.min(i + 1, TIER_ORDER.length - 1)];
}

function speedTierFor(difficulty: string, score: number): Tier {
  const table = getCalibration().speed[difficulty];
  if (!table) return "iron";
  let best: Tier = "iron";
  for (const tier of TIER_ORDER) {
    const thr = table[tier];
    if (thr !== undefined && score >= thr) best = tier;
  }
  return best;
}

function elimTierFor(count: number, seconds: number): Tier {
  const table = getCalibration().eliminate[String(count)];
  if (!table) return "iron";
  let best: Tier = "iron";
  for (const tier of TIER_ORDER) {
    const thr = table[tier];
    if (thr !== undefined && seconds <= thr) best = tier;
  }
  return best;
}

// 单条记录 → 段位（practice 不计段位）
export function tierForSession(s: TrainingSession): Tier | null {
  if (s.testType === "speed") return speedTierFor(s.difficulty, s.score);
  if (s.testType === "eliminate") return elimTierFor(s.targetCount, s.completionSeconds);
  return null;
}

interface DailyRep {
  dateKey: string;
  index: number;
}

// 按(天 + 项目配置)分组，组内取均值再评级 —— 一天一个项目只算一次，失败组会拉低均值
function dailyRepresentatives(sessions: TrainingSession[]): DailyRep[] {
  type G = {
    testType: "speed" | "eliminate";
    difficulty?: string;
    count?: number;
    dateKey: string;
    values: number[];
  };
  const groups = new Map<string, G>();
  for (const s of sessions) {
    if (s.testType === "practice") continue;
    const dateKey = s.createdAt.slice(0, 10);
    if (s.testType === "speed") {
      const key = `${dateKey}|speed|${s.difficulty}`;
      const g = groups.get(key) ?? { testType: "speed", difficulty: s.difficulty, dateKey, values: [] };
      g.values.push(s.score);
      groups.set(key, g);
    } else {
      const key = `${dateKey}|elim|${s.targetCount}`;
      const g = groups.get(key) ?? { testType: "eliminate", count: s.targetCount, dateKey, values: [] };
      g.values.push(s.completionSeconds);
      groups.set(key, g);
    }
  }
  const reps: DailyRep[] = [];
  for (const g of groups.values()) {
    const avg = g.values.reduce((a, b) => a + b, 0) / g.values.length;
    const tier =
      g.testType === "speed" ? speedTierFor(g.difficulty!, avg) : elimTierFor(g.count!, avg);
    reps.push({ dateKey: g.dateKey, index: tierIndex(tier) });
  }
  reps.sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  return reps;
}

// 综合段位：近期(天,项目)代表值的均值；不足 3 个则用游戏段位冷启动
export function computeRank(sessions: TrainingSession[], gameRank?: Tier): RankResult {
  const reps = dailyRepresentatives(sessions).slice(-12);
  if (reps.length >= 3) {
    const avg = reps.reduce((a, r) => a + r.index, 0) / reps.length;
    const idx = Math.round(avg);
    return { tier: TIER_ORDER[idx], index: idx, sampleCount: reps.length, source: "records" };
  }
  if (gameRank) {
    return { tier: gameRank, index: tierIndex(gameRank), sampleCount: reps.length, source: "gamerank" };
  }
  return { tier: "iron", index: 0, sampleCount: 0, source: "none" };
}

// 近期手感：近 3 个代表值 vs 更早
export function computeForm(sessions: TrainingSession[]): FormState {
  const reps = dailyRepresentatives(sessions).map((r) => r.index);
  if (reps.length < 4) return { label: "数据积累中", tone: "none" };
  const recent = reps.slice(-3);
  const prior = reps.slice(0, -3);
  const avg = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;
  const delta = avg(recent) - avg(prior);
  if (delta >= 0.5) return { label: "状态火热 · 上升中", tone: "up" };
  if (delta <= -0.5) return { label: "手感下滑", tone: "down" };
  return { label: "状态稳定", tone: "flat" };
}

// 段位历史：按天聚合出每日综合段位序号（0–8）
export function rankHistory(sessions: TrainingSession[]): { date: string; index: number }[] {
  const reps = dailyRepresentatives(sessions);
  const byDate = new Map<string, number[]>();
  for (const r of reps) {
    const arr = byDate.get(r.dateKey) ?? [];
    arr.push(r.index);
    byDate.set(r.dateKey, arr);
  }
  return [...byDate.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, arr]) => ({
      date: date.slice(5),
      index: Math.round(arr.reduce((x, y) => x + y, 0) / arr.length),
    }));
}
