import { describe, expect, it } from "vitest";
import {
  computeLeadVoltage,
  computeWilsonCentralTerminal,
  evaluateScenario,
  type ElectrodePotentials,
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

  it("computes Wilson central terminal from RA, LA, and LL only", () => {
    const potentials: ElectrodePotentials = {
      RA: -0.3,
      LA: 0.6,
      RL: 99,
      LL: 0.9,
      V1: 2,
      V2: 3,
      V3: 4,
      V4: 5,
      V5: 6,
      V6: 7
    };

    expect(computeWilsonCentralTerminal(potentials)).toBeCloseTo(0.4);
  });

  it("derives limb and precordial leads from electrode potentials", () => {
    const potentials: ElectrodePotentials = {
      RA: -0.3,
      LA: 0.6,
      RL: 0,
      LL: 0.9,
      V1: 0.1,
      V2: 0.2,
      V3: 0.3,
      V4: 0.4,
      V5: 0.8,
      V6: 0.7
    };

    expect(computeLeadVoltage("I", potentials)).toBeCloseTo(0.9);
    expect(computeLeadVoltage("II", potentials)).toBeCloseTo(1.2);
    expect(computeLeadVoltage("III", potentials)).toBeCloseTo(0.3);
    expect(computeLeadVoltage("aVR", potentials)).toBeCloseTo(-1.05);
    expect(computeLeadVoltage("V5", potentials)).toBeCloseTo(0.4);
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
