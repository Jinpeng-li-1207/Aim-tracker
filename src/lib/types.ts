export type TestType = "speed" | "eliminate" | "practice";
export type Difficulty = "easy" | "medium" | "hard";
export type Side = "front" | "left" | "right";

export interface BaseSession {
  id: string;
  createdAt: string; // ISO 8601
  testType: TestType;
  weapon: string;
  botArmor: boolean;
  infiniteAmmo: boolean;
  strafe: boolean;
  sensitivity?: number; // 记录时的游戏内灵敏度
  mood?: 1 | 2 | 3 | 4 | 5;
  templateId?: string;
  templateTaskId?: string;
  notes?: string;
}

export interface SpeedSession extends BaseSession {
  testType: "speed";
  difficulty: Difficulty;
  score: number; // 0–30 命中数
}

export interface EliminateSession extends BaseSession {
  testType: "eliminate";
  targetCount: 50 | 100;
  side: Side;
  completionSeconds: number;
}

export interface PracticeSession extends BaseSession {
  testType: "practice";
  durationMinutes: number;
}

export type TrainingSession = SpeedSession | EliminateSession | PracticeSession;

// 瞄准段位（镜像 Valorant 九段）
export type Tier =
  | "iron"
  | "bronze"
  | "silver"
  | "gold"
  | "platinum"
  | "diamond"
  | "ascendant"
  | "immortal"
  | "radiant";

// 用户档案（自填的实际对战段位，可与瞄准段位不同）
export interface Profile {
  id: string; // 固定 "me"
  gameRank?: Tier; // 游戏内对战段位（自填）
  sensitivity?: number; // 当前游戏内灵敏度
  dpi?: number; // 鼠标 DPI（可选，用于 eDPI）
  requiredPasses?: number; // 每个 drill 达标几次算"通过"（默认 1）
  consecutivePass?: boolean; // 是否需要连续达标
  updatedAt: string;
}

// 段位评估结果
export interface RankResult {
  tier: Tier;
  index: number; // 0–8
  sampleCount: number; // 参与计算的记录数
  source: "records" | "gamerank" | "none";
}

// 近期手感/状态
export interface FormState {
  label: string;
  tone: "up" | "down" | "flat" | "none";
}

// 组成"今日训练"的核心 drill（配置固定，目标随段位变化）
export interface CoreDrill {
  key: string;
  testType: "speed" | "eliminate";
  weapon: string;
  strafe: boolean;
  botArmor: boolean;
  difficulty?: Difficulty; // speed
  targetCount?: 50 | 100; // eliminate
  side?: Side; // eliminate
}

// 通过条件
export interface PassRule {
  requiredPasses: number; // 达标几次算通过
  consecutive: boolean; // 是否需连续
}

// 今日某个 drill 的实时状态（支持多次尝试，健身"组"式）
export interface TodayDrill {
  drill: CoreDrill;
  targetValue: number; // 目标（speed=命中数 / eliminate=秒）
  attempts: { id: string; value: number }[]; // 今日全部尝试（含记录 id，用于删除）
  todayBest: number | null;
  recentBest: number | null; // 近期最佳（用于算距目标差距）
  allTimeBest: number | null; // 历史最佳（用于 PB 判定）
  metCount: number; // 今日达标次数
  requiredPasses: number; // 通过所需达标次数
  consecutive: boolean; // 是否需连续
  passProgress: number; // 通过进度（累计或连续达标数）
  passed: boolean; // 是否已通过
  done: boolean;
  met: boolean; // 今日最佳是否达标（单次）
}

// 练枪模板
export interface TemplateTask {
  id: string;
  order: number;
  testType: TestType;
  weapon: string;
  difficulty?: Difficulty;
  targetCount?: 50 | 100;
  side?: Side;
  strafe?: boolean;
  botArmor?: boolean;
  targetScore?: number;
  targetSeconds?: number;
  durationMinutes?: number;
  requiredPasses?: number; // 达标几次算通过（默认取全局）
  consecutive?: boolean; // 是否需连续
  instructions: string;
}

export interface TrainingTemplate {
  id: string;
  name: string;
  author: string;
  description: string;
  tasks: TemplateTask[];
  createdAt: string;
  isBuiltIn: boolean;
}
