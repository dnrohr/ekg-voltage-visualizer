import { describe, expect, it } from "vitest";
import {
  evaluateScenario,
  leadOrder,
  normalSinusRhythmScenario,
  normalizeCycleTime
} from "../src";

describe("cardio-engine simulation", () => {
  it("wraps normalized cycle time deterministically", () => {
    expect(normalizeCycleTime(1.25)).toBeCloseTo(0.25);
    expect(normalizeCycleTime(-0.25)).toBeCloseTo(0.75);
  });

  it("returns identical state for identical scenario time inputs", () => {
    const first = evaluateScenario(normalSinusRhythmScenario, 0.425);
    const second = evaluateScenario(normalSinusRhythmScenario, 0.425);

    expect(second).toEqual(first);
  });

  it("produces all 12 lead voltages", () => {
    const state = evaluateScenario(normalSinusRhythmScenario, 0.425);

    expect(Object.keys(state.leadVoltages).sort()).toEqual([...leadOrder].sort());
  });

  it("keeps normal teaching polarity expectations for the QRS peak", () => {
    const state = evaluateScenario(normalSinusRhythmScenario, 340 / 800);

    expect(state.phase).toBe("qrs");
    expect(state.leadVoltages.II).toBeGreaterThan(0.5);
    expect(state.leadVoltages.aVR).toBeLessThan(-0.3);
    expect(state.leadVoltages.V5).toBeGreaterThan(0.3);
  });

  it("returns near baseline during the ST segment", () => {
    const state = evaluateScenario(normalSinusRhythmScenario, 450 / 800);

    expect(state.phase).toBe("st-segment");
    expect(Math.abs(state.leadVoltages.II)).toBeLessThan(0.08);
  });
});
