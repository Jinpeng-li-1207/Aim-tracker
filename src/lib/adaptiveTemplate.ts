import calib from "../data/rankCalibration.json";
import { CORE_DRILLS } from "./constants";
import { nextTier } from "./rank";
import type { CoreDrill, Tier, TodayDrill, TrainingSession } from "./types";

type CalibTable = Record<string, Record<string, number>>;
const speedCalib = calib.speed as CalibTable;
const elimCalib = calib.eliminate as CalibTable;

function targetFor(drill: CoreDrill, tier: Tier): number {
  if (drill.testType === "speed" && drill.difficulty) {
    return speedCalib[drill.difficulty]?.[tier] ?? 30;
  }
  if (drill.testType === "eliminate" && drill.targetCount) {
    return elimCalib[String(drill.targetCount)]?.[tier] ?? 60;
  }
  return 0;
}

function isToday(iso: string): boolean {
  return iso.slice(0, 10) === new Date().toISOString().slice(0, 10);
}

function matchesDrill(s: TrainingSession, d: CoreDrill): boolean {
  if (s.testType !== d.testType) return false;
  if (s.testType === "speed" && d.testType === "speed") {
    return s.difficulty === d.difficulty;
  }
  if (s.testType === "eliminate" && d.testType === "eliminate") {
    return s.targetCount === d.targetCount;
  }
  return false;
}

function valueOf(s: TrainingSession): number {
  if (s.testType === "speed") return s.score;
  if (s.testType === "eliminate") return s.completionSeconds;
  return 0;
}

// 根据当前段位构建"下一段位目标"的今日训练（含当日全部尝试）
export function buildTodayDrills(
  currentTier: Tier,
  sessions: TrainingSession[],
): TodayDrill[] {
  const goal = nextTier(currentTier);
  return CORE_DRILLS.map((drill) => {
    const targetValue = targetFor(drill, goal);
    const isSpeed = drill.testType === "speed";
    const meets = (v: number) => (isSpeed ? v >= targetValue : v <= targetValue);

    const attempts = sessions
      .filter((s) => isToday(s.createdAt) && matchesDrill(s, drill))
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map(valueOf);

    const todayBest =
      attempts.length === 0 ? null : isSpeed ? Math.max(...attempts) : Math.min(...attempts);
    const metCount = attempts.filter(meets).length;

    return {
      drill,
      targetValue,
      attempts,
      todayBest,
      metCount,
      done: attempts.length > 0,
      met: todayBest !== null && meets(todayBest),
    };
  });
}

// drill 的中英双语一句话描述
export function drillLabel(drill: CoreDrill): { zh: string; en: string } {
  if (drill.testType === "speed") {
    return {
      zh: `${drill.difficulty === "medium" ? "中级" : drill.difficulty === "hard" ? "困难" : "简单"}靶 · 速度`,
      en: `${drill.difficulty?.[0].toUpperCase()}${drill.difficulty?.slice(1)} · Speed`,
    };
  }
  const sideZh = drill.side === "left" ? "左侧" : drill.side === "right" ? "右侧" : "正面";
  const sideEn = drill.side ? drill.side[0].toUpperCase() + drill.side.slice(1) : "Front";
  return {
    zh: `${sideZh} ${drill.targetCount} 靶`,
    en: `Eliminate ${drill.targetCount} · ${sideEn}`,
  };
}
