import ref from "../data/communityRankReference.json";
import { VOLTAIC_TIERS } from "./constants";
import type { Tier } from "./types";

// speed: key = difficulty ("easy"|"medium"|"hard"); eliminate: key = "50"|"100"
export function getCommunityTier(testType: "speed" | "eliminate", key: string, value: number): Tier {
  if (testType === "speed") {
    const table = (ref.speed as Record<string, { tier: Tier; minScore: number }[]>)[key] ?? [];
    for (const row of table) if (value >= row.minScore) return row.tier;
    return "iron";
  }
  const table = (ref.eliminate as Record<string, { tier: Tier; maxSeconds: number }[]>)[key] ?? [];
  for (const row of table) if (value <= row.maxSeconds) return row.tier;
  return "iron";
}

export function getVoltaicTier(energy: number): Tier {
  for (const t of VOLTAIC_TIERS) if (energy >= t.min) return t.tier as Tier;
  return "iron";
}
