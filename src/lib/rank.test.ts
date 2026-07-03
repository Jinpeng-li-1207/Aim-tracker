import { describe, it, expect } from "vitest";
import { tierForSession, computeRank, computeForm, nextTier } from "./rank";
import type { TrainingSession } from "./types";

const base = {
  weapon: "Vandal",
  botArmor: false,
  infiniteAmmo: true,
  strafe: false,
};

function speed(difficulty: "easy" | "medium" | "hard", score: number, i = 0): TrainingSession {
  return { ...base, id: `s${i}`, createdAt: `2026-06-2${i}T00:00:00Z`, testType: "speed", difficulty, score };
}
function elim(targetCount: 50 | 100, completionSeconds: number, i = 0): TrainingSession {
  return { ...base, id: `e${i}`, createdAt: `2026-06-2${i}T00:00:00Z`, testType: "eliminate", targetCount, side: "left", completionSeconds };
}

describe("tierForSession - speed (higher score = better)", () => {
  it("hard 25 → diamond (>=24, <27)", () => expect(tierForSession(speed("hard", 25))).toBe("diamond"));
  it("hard 30 → radiant", () => expect(tierForSession(speed("hard", 30))).toBe("radiant"));
  it("hard 3 → iron (below bronze 9)", () => expect(tierForSession(speed("hard", 3))).toBe("iron"));
});

describe("tierForSession - eliminate (lower seconds = better)", () => {
  it("100 in 55s → radiant (<=58)", () => expect(tierForSession(elim(100, 55))).toBe("radiant"));
  it("100 in 100s → platinum (<=110, >93)", () => expect(tierForSession(elim(100, 100))).toBe("platinum"));
  it("100 in 300s → iron (above bronze 190)", () => expect(tierForSession(elim(100, 300))).toBe("iron"));
});

describe("tierForSession - practice has no tier", () => {
  it("returns null", () =>
    expect(
      tierForSession({ ...base, id: "p", createdAt: "2026-06-20T00:00:00Z", testType: "practice", durationMinutes: 10 }),
    ).toBe(null));
});

describe("nextTier", () => {
  it("bronze → silver", () => expect(nextTier("bronze")).toBe("silver"));
  it("radiant caps at radiant", () => expect(nextTier("radiant")).toBe("radiant"));
});

describe("computeRank", () => {
  it("no records + no baseline → none/iron", () => {
    const r = computeRank([]);
    expect(r.source).toBe("none");
    expect(r.tier).toBe("iron");
  });
  it("<3 records falls back to game rank", () => {
    const r = computeRank([speed("hard", 30, 1)], "gold");
    expect(r.source).toBe("gamerank");
    expect(r.tier).toBe("gold");
  });
  it("averages tiers from >=3 records", () => {
    const r = computeRank([speed("hard", 30, 1), speed("hard", 30, 2), speed("hard", 30, 3)]);
    expect(r.source).toBe("records");
    expect(r.tier).toBe("radiant");
  });
});

describe("computeForm", () => {
  it("< 4 records → 数据积累中", () => {
    expect(computeForm([speed("hard", 20, 1)]).tone).toBe("none");
  });
  it("rising recent scores → up", () => {
    const r = computeForm([
      speed("hard", 5, 1),
      speed("hard", 5, 2),
      speed("hard", 30, 3),
      speed("hard", 30, 4),
      speed("hard", 30, 5),
    ]);
    expect(r.tone).toBe("up");
  });
  it("declining recent scores → down", () => {
    const r = computeForm([
      speed("hard", 30, 1),
      speed("hard", 30, 2),
      speed("hard", 5, 3),
      speed("hard", 5, 4),
      speed("hard", 5, 5),
    ]);
    expect(r.tone).toBe("down");
  });
});
