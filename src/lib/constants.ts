import type { CoreDrill, Difficulty, Side, Tier } from "./types";

export const WEAPONS = [
  "Vandal",
  "Phantom",
  "Sheriff",
  "Ghost",
  "Operator",
  "Spectre",
  "Guardian",
  "Classic",
];

export const DIFFICULTIES: { id: Difficulty; en: string; zh: string }[] = [
  { id: "easy", en: "Easy", zh: "简单" },
  { id: "medium", en: "Medium", zh: "中级" },
  { id: "hard", en: "Hard", zh: "困难" },
];

export const SIDES: { id: Side; en: string; zh: string }[] = [
  { id: "front", en: "Front", zh: "正面" },
  { id: "left", en: "Left", zh: "左侧" },
  { id: "right", en: "Right", zh: "右侧" },
];

// 段位从低到高
export const TIER_ORDER: Tier[] = [
  "iron",
  "bronze",
  "silver",
  "gold",
  "platinum",
  "diamond",
  "ascendant",
  "immortal",
  "radiant",
];

export const TIER_META: Record<Tier, { en: string; zh: string; color: string }> = {
  iron: { en: "Iron", zh: "黑铁", color: "#8A9199" },
  bronze: { en: "Bronze", zh: "青铜", color: "#B0744A" },
  silver: { en: "Silver", zh: "白银", color: "#C2CCD4" },
  gold: { en: "Gold", zh: "黄金", color: "#E6C260" },
  platinum: { en: "Platinum", zh: "铂金", color: "#3FB9C6" },
  diamond: { en: "Diamond", zh: "钻石", color: "#C39BE8" },
  ascendant: { en: "Ascendant", zh: "超凡", color: "#4ADE80" },
  immortal: { en: "Immortal", zh: "不朽", color: "#E0526A" },
  radiant: { en: "Radiant", zh: "辐能", color: "#FFF3B0" },
};

// 靶场设置的中英双语标签（对着游戏内英文设置）
export const TEST_TYPE_META: Record<
  "speed" | "eliminate" | "practice",
  { en: string; zh: string }
> = {
  speed: { en: "Speed", zh: "速度测试" },
  eliminate: { en: "Eliminate", zh: "消灭测试" },
  practice: { en: "Practice", zh: "自由练习" },
};

// 组成"今日训练"的固定核心 drill（目标值来自校准表的下一段位）
export const CORE_DRILLS: CoreDrill[] = [
  {
    key: "speed-medium",
    testType: "speed",
    difficulty: "medium",
    weapon: "Vandal",
    strafe: false,
    botArmor: false,
  },
  {
    key: "speed-hard",
    testType: "speed",
    difficulty: "hard",
    weapon: "Vandal",
    strafe: false,
    botArmor: false,
  },
  {
    key: "elim-100-left",
    testType: "eliminate",
    targetCount: 100,
    side: "left",
    weapon: "Vandal",
    strafe: false,
    botArmor: false,
  },
];
