export type TestType = "speed" | "eliminate" | "practice";
export type Difficulty = "easy" | "medium" | "hard";
export type Side = "front" | "left" | "right";

export interface BaseSession {
  id: string;
  createdAt: string;          // ISO 8601
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
  score: number;              // 0–30 命中数
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

export type Tier =
  | "iron" | "bronze" | "silver" | "gold" | "platinum"
  | "diamond" | "ascendant" | "immortal" | "radiant"
  | "elysian" | "aurora" | "angelic";

export interface VoltaicEntry {
  id: string;
  recordedAt: string;
  energy: number;
  tier: Tier;
}

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
