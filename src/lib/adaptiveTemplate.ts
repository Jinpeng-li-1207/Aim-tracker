import { CORE_DRILLS } from "./constants";
import { nextTier } from "./rank";
import { getCalibration } from "./calibration";
import type { CoreDrill, Tier, TodayDrill, TrainingSession, TrainingTemplate } from "./types";

function targetFor(drill: CoreDrill, tier: Tier): number {
  const c = getCalibration();
  if (drill.testType === "speed" && drill.difficulty) {
    return c.speed[drill.difficulty]?.[tier] ?? 30;
  }
  if (drill.testType === "eliminate" && drill.targetCount) {
    return c.eliminate[String(drill.targetCount)]?.[tier] ?? 60;
  }
  return 0;
}

function isToday(iso: string): boolean {
  return iso.slice(0, 10) === new Date().toISOString().slice(0, 10);
}

function matchesDrill(s: TrainingSession, d: CoreDrill): boolean {
  if (s.testType !== d.testType) return false;
  if (s.testType === "speed" && d.testType === "speed") return s.difficulty === d.difficulty;
  if (s.testType === "eliminate" && d.testType === "eliminate") return s.targetCount === d.targetCount;
  return false;
}

function valueOf(s: TrainingSession): number {
  if (s.testType === "speed") return s.score;
  if (s.testType === "eliminate") return s.completionSeconds;
  return 0;
}

// 计算某个 drill 今日的全部尝试与达标情况
export function computeTodayDrill(
  drill: CoreDrill,
  targetValue: number,
  sessions: TrainingSession[],
): TodayDrill {
  const isSpeed = drill.testType === "speed";
  const meets = (v: number) => (isSpeed ? v >= targetValue : v <= targetValue);

  const bestOf = (vals: number[]) =>
    vals.length === 0 ? null : isSpeed ? Math.max(...vals) : Math.min(...vals);

  const matching = sessions
    .filter((s) => matchesDrill(s, drill))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const matchingVals = matching.map(valueOf);

  const attempts = matching.filter((s) => isToday(s.createdAt)).map(valueOf);
  const todayBest = bestOf(attempts);
  const recentBest = bestOf(matchingVals.slice(-10));
  const allTimeBest = bestOf(matchingVals);
  const metCount = attempts.filter(meets).length;

  return {
    drill,
    targetValue,
    attempts,
    todayBest,
    recentBest,
    allTimeBest,
    metCount,
    done: attempts.length > 0,
    met: todayBest !== null && meets(todayBest),
  };
}

// 自适应今日训练：核心 drill，目标取"下一段位"要求
export function buildTodayDrills(currentTier: Tier, sessions: TrainingSession[]): TodayDrill[] {
  const goal = nextTier(currentTier);
  return CORE_DRILLS.map((d) => computeTodayDrill(d, targetFor(d, goal), sessions));
}

// 从练枪模板生成今日训练：目标取模板自带的 targetScore/targetSeconds
export function buildTemplateDrills(
  template: TrainingTemplate,
  sessions: TrainingSession[],
): TodayDrill[] {
  return template.tasks
    .filter((t) => t.testType !== "practice")
    .map((t) => {
      const drill: CoreDrill = {
        key: t.id,
        testType: t.testType as "speed" | "eliminate",
        weapon: t.weapon,
        strafe: !!t.strafe,
        botArmor: !!t.botArmor,
        difficulty: t.difficulty,
        targetCount: t.targetCount,
        side: t.side,
      };
      const targetValue =
        t.testType === "speed" ? (t.targetScore ?? 30) : (t.targetSeconds ?? 60);
      return computeTodayDrill(drill, targetValue, sessions);
    });
}

// drill 的中英双语一句话描述
export function drillLabel(drill: CoreDrill): { zh: string; en: string } {
  if (drill.testType === "speed") {
    const zhMap: Record<string, string> = { easy: "简单", medium: "中级", hard: "困难" };
    return {
      zh: `${zhMap[drill.difficulty ?? "medium"]}靶 · 速度`,
      en: `${(drill.difficulty ?? "").charAt(0).toUpperCase()}${(drill.difficulty ?? "").slice(1)} · Speed`,
    };
  }
  const sideZh = drill.side === "left" ? "左侧" : drill.side === "right" ? "右侧" : "正面";
  const sideEn = drill.side ? drill.side.charAt(0).toUpperCase() + drill.side.slice(1) : "Front";
  return {
    zh: `${sideZh} ${drill.targetCount} 靶`,
    en: `Eliminate ${drill.targetCount} · ${sideEn}`,
  };
}
