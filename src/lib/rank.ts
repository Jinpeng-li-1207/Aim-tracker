import calib from "../data/rankCalibration.json";
import { TIER_ORDER } from "./constants";
import type { Tier, TrainingSession, RankResult } from "./types";

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

// 综合段位：近期可评级记录的段位均值；不足 3 条则回退到基线，再无则未定级
export function computeRank(
  sessions: TrainingSession[],
  baseline?: Tier,
): RankResult {
  const rankable = [...sessions]
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .filter((s) => s.testType !== "practice")
    .slice(-12);

  const indices = rankable
    .map((s) => tierForSession(s))
    .filter((t): t is Tier => t !== null)
    .map((t) => tierIndex(t));

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
  if (baseline) {
    return {
      tier: baseline,
      index: tierIndex(baseline),
      sampleCount: indices.length,
      source: "baseline",
    };
  }
  return { tier: "iron", index: 0, sampleCount: 0, source: "none" };
}
