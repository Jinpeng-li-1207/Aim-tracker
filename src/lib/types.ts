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

// 用户档案（自评基线段位）
export interface Profile {
  id: string; // 固定 "me"
  baselineTier: Tier;
  updatedAt: string;
}

// 段位评估结果
export interface RankResult {
  tier: Tier;
  index: number; // 0–8
  sampleCount: number; // 参与计算的记录数
  source: "records" | "baseline" | "none";
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

// 今日某个 drill 的实时状态
export interface TodayDrill {
  drill: CoreDrill;
  targetValue: number; // 目标（speed=命中数 / eliminate=秒）
  todayBest: number | null;
  done: boolean;
  met: boolean;
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
