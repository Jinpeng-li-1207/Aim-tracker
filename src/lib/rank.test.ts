import { describe, it, expect } from "vitest";
import { getCommunityTier, getVoltaicTier } from "./rank";

describe("getCommunityTier - speed", () => {
  it("hard 25 → diamond (>=22)", () => {
    expect(getCommunityTier("speed", "hard", 25)).toBe("diamond");
  });
  it("hard 30 → radiant", () => {
    expect(getCommunityTier("speed", "hard", 30)).toBe("radiant");
  });
  it("hard 5 → iron", () => {
    expect(getCommunityTier("speed", "hard", 5)).toBe("iron");
  });
});

describe("getCommunityTier - eliminate (lower time better)", () => {
  it("100 in 60s → radiant (<=65)", () => {
    expect(getCommunityTier("eliminate", "100", 60)).toBe("radiant");
  });
  it("100 in 200s → iron", () => {
    expect(getCommunityTier("eliminate", "100", 200)).toBe("iron");
  });
});

describe("getVoltaicTier", () => {
  it("550 → platinum", () => expect(getVoltaicTier(550)).toBe("platinum"));
  it("900 → radiant", () => expect(getVoltaicTier(900)).toBe("radiant"));
  it("50 → iron (floor)", () => expect(getVoltaicTier(50)).toBe("iron"));
});
