import { describe, expect, it } from "vitest";
import {
  computeLeadVoltage,
  computeWilsonCentralTerminal,
  advanceClock,
  createClockState,
  cycleMsToNormalized,
  evaluateScenario,
  frameStepMs,
  generateSyntheticReferenceTrace,
  millisecondStepMs,
  normalizedToCycleMs,
  playbackSpeeds,
  scenarioLibrary,
  stepClock,
  type ElectrodePotentials,
  leadOrder,
  normalSinusRhythmScenario,
  normalizeCycleTime,
  validateScenario,
  validateScenarioSchema
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

  it("converts continuous millisecond clock time to normalized cycle time", () => {
    const cycleMs = normalSinusRhythmScenario.timing.cycleMs;

    expect(cycleMsToNormalized(340, cycleMs)).toBeCloseTo(0.425);
    expect(cycleMsToNormalized(1140, cycleMs)).toBeCloseTo(0.425);
    expect(normalizedToCycleMs(1.425, cycleMs)).toBeCloseTo(340);
  });

  it("advances the cardiac clock by playback speed and wraps by cycle", () => {
    expect(playbackSpeeds).toContain(0.05);

    const advanced = advanceClock(normalSinusRhythmScenario, 790, 400, 0.05);
    expect(advanced.timeMs).toBeCloseTo(10);
    expect(advanced.normalizedTime).toBeCloseTo(10 / 800);

    const realTime = advanceClock(normalSinusRhythmScenario, 300, 40, 1);
    expect(realTime.timeMs).toBeCloseTo(340);
  });

  it("steps the cardiac clock by millisecond and frame increments", () => {
    const msStep = stepClock(normalSinusRhythmScenario, 340, millisecondStepMs);
    const frameStep = stepClock(normalSinusRhythmScenario, 340, frameStepMs);
    const backward = stepClock(normalSinusRhythmScenario, 0, -millisecondStepMs);

    expect(createClockState(normalSinusRhythmScenario, 340).normalizedTime).toBeCloseTo(0.425);
    expect(msStep.timeMs).toBeCloseTo(341);
    expect(frameStep.timeMs).toBeCloseTo(356);
    expect(backward.timeMs).toBeCloseTo(799);
  });

  it("orders normal activation from atria through septum, apex, and base", () => {
    const nodes = normalSinusRhythmScenario.activationModel.nodes;
    const byId = Object.fromEntries(nodes.map((node) => [node.id, node]));

    expect(byId["sa-node"].activationTimeMs).toBeLessThan(byId["right-atrium"].activationTimeMs);
    expect(byId["right-atrium"].activationTimeMs).toBeLessThan(byId["left-atrium"].activationTimeMs);
    expect(byId["av-node"].activationTimeMs).toBeLessThan(byId["his-bundle"].activationTimeMs);
    expect(byId["his-bundle"].activationTimeMs).toBeLessThan(byId["septum-left-to-right"].activationTimeMs);
    expect(byId["septum-left-to-right"].activationTimeMs).toBeLessThan(byId.apex.activationTimeMs);
    expect(byId.apex.activationTimeMs).toBeLessThan(byId["basal-ventricles"].activationTimeMs);
  });

  it("models repolarization as regional recovery rather than reversed depolarization", () => {
    const nodes = normalSinusRhythmScenario.activationModel.nodes;
    const byId = Object.fromEntries(nodes.map((node) => [node.id, node]));

    expect(byId.apex.activationTimeMs).toBeLessThan(byId["left-ventricle"].activationTimeMs);
    expect(byId.apex.repolarizationTimeMs).toBeLessThan(byId["left-ventricle"].repolarizationTimeMs);

    const tWaveState = evaluateScenario(normalSinusRhythmScenario, 580 / 800);
    expect(tWaveState.tissueNodes.some((node) => node.state === "repolarizing")).toBe(true);
    expect(tWaveState.phaseExplanation).toContain("not run backward");
  });

  it("aligns valve phases and heart sounds with the electrical timeline", () => {
    const systoleStart = evaluateScenario(normalSinusRhythmScenario, 350 / 800);
    const ejection = evaluateScenario(normalSinusRhythmScenario, 435 / 800);
    const s2 = evaluateScenario(normalSinusRhythmScenario, 498 / 800);

    expect(systoleStart.mechanical.phase).toBe("isovolumetric-contraction");
    expect(systoleStart.mechanical.activeSound?.id).toBe("S1");
    expect(systoleStart.mechanical.valves.mitral.openFraction).toBeLessThan(0.25);
    expect(ejection.mechanical.phase).toBe("ventricular-ejection");
    expect(ejection.mechanical.valves.aortic.openFraction).toBeGreaterThan(0.2);
    expect(ejection.mechanical.flow.intensity).toBeGreaterThan(0);
    expect(s2.mechanical.activeSound?.id).toBe("S2");
  });

  it("shows electromechanical delay and changing chamber volumes", () => {
    const beforeQrs = evaluateScenario(normalSinusRhythmScenario, 300 / 800);
    const peakEjection = evaluateScenario(normalSinusRhythmScenario, 460 / 800);

    expect(beforeQrs.phase).toBe("qrs");
    expect(beforeQrs.mechanical.chamber.ventricularContraction).toBeLessThan(0.2);
    expect(peakEjection.mechanical.chamber.ventricularContraction).toBeGreaterThan(0.45);
    expect(peakEjection.mechanical.chamber.ventricularVolumeFraction).toBeLessThan(beforeQrs.mechanical.chamber.ventricularVolumeFraction);
  });

  it("keeps major flow stopped during isovolumetric phases", () => {
    const isoContraction = evaluateScenario(normalSinusRhythmScenario, 360 / 800);
    const isoRelaxation = evaluateScenario(normalSinusRhythmScenario, 560 / 800);

    expect(isoContraction.mechanical.flow.region).toBe("no-flow");
    expect(isoContraction.mechanical.flow.intensity).toBe(0);
    expect(isoRelaxation.mechanical.flow.region).toBe("no-flow");
  });

  it("validates all curated scenario schemas", () => {
    for (const scenario of scenarioLibrary) {
      expect(validateScenarioSchema(scenario)).toEqual([]);
    }
  });

  it("creates validation reports and synthetic reference traces", () => {
    const report = validateScenario(normalSinusRhythmScenario);
    const reference = generateSyntheticReferenceTrace(normalSinusRhythmScenario, "II");

    expect(report.checks.length).toBeGreaterThan(3);
    expect(report.checks.some((check) => check.level === "reference-agreement")).toBe(true);
    expect(reference.provenance).toBe("synthetic-reference");
    expect(reference.samples.some((sample) => sample.annotation === "QRS")).toBe(true);
  });
});
