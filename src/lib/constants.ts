export const WEAPONS = ["Vandal", "Phantom", "Sheriff", "Ghost", "Operator", "Spectre", "Guardian", "其他"];
export const DIFFICULTIES = [
  { id: "easy", label: "简单" }, { id: "medium", label: "中等" }, { id: "hard", label: "困难" },
] as const;
export const SIDES = [
  { id: "front", label: "正面" }, { id: "left", label: "左侧" }, { id: "right", label: "右侧" },
] as const;
export const VOLTAIC_TIERS = [
  { tier: "angelic", min: 1200, label: "Angelic" }, { tier: "aurora", min: 1100, label: "Aurora" },
  { tier: "elysian", min: 1000, label: "Elysian" }, { tier: "radiant", min: 900, label: "Radiant" },
  { tier: "immortal", min: 800, label: "Immortal" }, { tier: "ascendant", min: 700, label: "Ascendant" },
  { tier: "diamond", min: 600, label: "Diamond" }, { tier: "platinum", min: 500, label: "Platinum" },
  { tier: "gold", min: 400, label: "Gold" }, { tier: "silver", min: 300, label: "Silver" },
  { tier: "bronze", min: 200, label: "Bronze" }, { tier: "iron", min: 100, label: "Iron" },
] as const;
