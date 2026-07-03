import calib from "../data/rankCalibration.json";
import { TIER_ORDER } from "./constants";
import type { Tier, TrainingSession, RankResult, FormState } from "./types";

type CalibTable = Record<string, Record<string, number>>;
const speedCalib = calib.speed as CalibTable;
const elimCalib = calib.eliminate as CalibTable;

export function tierIndex(tier: Tier): number {
  return TIER_ORDER.indexOf(tier);
}

export function nextTier(tier: Tier): Tier {
  const i = tierIndex(tier);
  return TIER_ORDER[Math.min(i + 1, TIER_ORDER.length - 1)];
}

// 单条记录 → 段位（practice 不计段位，返回 null）
export function tierForSession(s: TrainingSession): Tier | null {
  if (s.testType === "speed") {
    const table = speedCalib[s.difficulty];
    if (!table) return "iron";
    let best: Tier = "iron";
    for (const tier of TIER_ORDER) {
      const thr = table[tier];
      if (thr !== undefined && s.score >= thr) best = tier;
    }
    return best;
  }
  if (s.testType === "eliminate") {
    const table = elimCalib[String(s.targetCount)];
    if (!table) return "iron";
    let best: Tier = "iron";
    for (const tier of TIER_ORDER) {
      const thr = table[tier];
      if (thr !== undefined && s.completionSeconds <= thr) best = tier;
    }
    return best;
  }
  return null;
}

// 可评级记录的段位序号（按时间先后）
function rankableIndices(sessions: TrainingSession[]): number[] {
  return [...sessions]
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .filter((s) => s.testType !== "practice")
    .map((s) => tierForSession(s))
    .filter((t): t is Tier => t !== null)
    .map((t) => tierIndex(t));
}

// 综合段位：近期可评级记录的段位均值；不足 3 条则用游戏段位冷启动，再无则未定级
export function computeRank(
  sessions: TrainingSession[],
  gameRank?: Tier,
): RankResult {
  const indices = rankableIndices(sessions).slice(-12);

  if (indices.length >= 3) {
    const avg = indices.reduce((a, b) => a + b, 0) / indices.length;
    const idx = Math.round(avg);
    return {
      tier: TIER_ORDER[idx],
      index: idx,
      sampleCount: indices.length,
      source: "records",
    };
  }
  if (gameRank) {
    return {
      tier: gameRank,
      index: tierIndex(gameRank),
      sampleCount: indices.length,
      source: "gamerank",
    };
  }
  return { tier: "iron", index: 0, sampleCount: 0, source: "none" };
}

// 近期手感：近 3 次可评级记录的段位均值 vs 更早记录
export function computeForm(sessions: TrainingSession[]): FormState {
  const idx = rankableIndices(sessions);
  if (idx.length < 4) return { label: "数据积累中", tone: "none" };
  const recent = idx.slice(-3);
  const prior = idx.slice(0, -3);
  const avg = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;
  const delta = avg(recent) - avg(prior);
  if (delta >= 0.5) return { label: "状态火热 · 上升中", tone: "up" };
  if (delta <= -0.5) return { label: "手感下滑", tone: "down" };
  return { label: "状态稳定", tone: "flat" };
}
