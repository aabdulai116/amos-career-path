import { describe, expect, it } from "vitest";
import {
  DEFAULT_RECRUITING_DATE,
  initialState,
  parseProgressState,
} from "@/store/progress";

describe("parseProgressState", () => {
  it("accepts a state this app exported", () => {
    const result = parseProgressState(JSON.parse(JSON.stringify(initialState)));
    expect(result.ok).toBe(true);
  });

  it("round-trips skills, notes and day logs", () => {
    const exported = {
      version: 1,
      skills: {
        probability: {
          status: "done",
          notes: "Finished Stat 110 through chapter 7.",
          proofUrl: "https://github.com/example/notes",
          hoursLogged: 12.5,
          completedAt: "2026-11-01T00:00:00.000Z",
          resourcesWatched: ["probability::https://example.com"],
        },
      },
      customResources: [],
      dayLogs: { "2026-11-01": { date: "2026-11-01", hours: 2, resources: 1 } },
      settings: { recruitingDate: "2027-08-01", selectedPathId: "quant-trader" },
    };
    const result = parseProgressState(exported);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.skills.probability.hoursLogged).toBe(12.5);
    expect(result.state.settings.selectedPathId).toBe("quant-trader");
    expect(result.state.dayLogs["2026-11-01"].hours).toBe(2);
  });

  it("fills in missing optional sections rather than failing", () => {
    const result = parseProgressState({ version: 1, skills: {} });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.customResources).toEqual([]);
    expect(result.state.dayLogs).toEqual({});
    expect(result.state.settings.recruitingDate).toBe(DEFAULT_RECRUITING_DATE);
    expect(result.state.settings.selectedPathId).toBeNull();
  });

  it("rejects a non-object", () => {
    expect(parseProgressState("nope").ok).toBe(false);
    expect(parseProgressState(null).ok).toBe(false);
    expect(parseProgressState(42).ok).toBe(false);
  });

  it("rejects an unknown version", () => {
    const result = parseProgressState({ version: 99, skills: {} });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toContain("99");
  });

  it("rejects a file with no skills object", () => {
    expect(parseProgressState({ version: 1 }).ok).toBe(false);
  });
});
