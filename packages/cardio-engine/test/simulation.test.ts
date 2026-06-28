import { describe, expect, it } from "vitest";
import {
  computeLeadVoltage,
  computeWilsonCentralTerminal,
  advanceClock,
  buildHeartMeshField,
  createClockState,
  cycleMsToNormalized,
  educationalHeartSurface,
  evaluateScenario,
  evaluateHeartSurface,
  explainLeadProbe,
  explainSurfaceRegion,
  frameStepMs,
  generateIsochroneMap,
  getSurfaceRegionById,
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

  it("delays local mechanical contraction after regional activation", () => {
    const earlySeptum = evaluateScenario(normalSinusRhythmScenario, 320 / 800);
    const contractedSeptum = evaluateScenario(normalSinusRhythmScenario, 395 / 800);
    const earlyMechanical = earlySeptum.mechanical.regionMechanics.find((region) => region.regionId === "septal-right-facing");
    const contractedMechanical = contractedSeptum.mechanical.regionMechanics.find((region) => region.regionId === "septal-right-facing");

    expect(earlyMechanical?.activationTimeMs).toBeLessThan(earlySeptum.timeMs);
    expect(earlyMechanical?.contractionOnsetMs).toBeGreaterThan(earlySeptum.timeMs);
    expect(earlyMechanical?.contractionProgress).toBe(0);
    expect(contractedMechanical?.contractionProgress ?? 0).toBeGreaterThan(0.2);
  });

  it("keeps ventricular volume high at QRS onset before ejection timing", () => {
    const qrsOnset = evaluateScenario(normalSinusRhythmScenario, 300 / 800);
    const ejection = evaluateScenario(normalSinusRhythmScenario, 450 / 800);

    expect(qrsOnset.mechanical.chamberVolumes.LV).toBeGreaterThan(0.88);
    expect(qrsOnset.mechanical.chamberVolumes.RV).toBeGreaterThan(0.88);
    expect(ejection.mechanical.chamberVolumes.LV).toBeLessThan(qrsOnset.mechanical.chamberVolumes.LV);
    expect(ejection.mechanical.regionMechanics.some((region) => region.wallDeformation > 0.12)).toBe(true);
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

  it("defines an educational heart surface across all four chambers", () => {
    const chambers = new Set(educationalHeartSurface.regions.map((region) => region.chamber));

    expect(chambers).toEqual(new Set(["RA", "LA", "RV", "LV"]));
    expect(educationalHeartSurface.regions.length).toBeGreaterThanOrEqual(10);

    for (const region of educationalHeartSurface.regions) {
      expect(region.vertices.length).toBeGreaterThanOrEqual(4);
      expect(region.bestSeenLeads.length).toBeGreaterThan(0);
      expect(region.oppositeLeads.length).toBeGreaterThan(0);
      expect(region.baseActivationTimeMs).toBeLessThan(region.baseRepolarizationTimeMs);
    }
  });

  it("keeps surface activation in the expected teaching order", () => {
    const regions = Object.fromEntries(educationalHeartSurface.regions.map((region) => [region.id, region]));

    expect(regions["ra-high-lateral"].baseActivationTimeMs).toBeLessThan(regions["la-lateral"].baseActivationTimeMs);
    expect(regions["septal-right-facing"].baseActivationTimeMs).toBeLessThan(regions["apical-ventricles"].baseActivationTimeMs);
    expect(regions["apical-ventricles"].baseActivationTimeMs).toBeLessThan(regions["lv-lateral"].baseActivationTimeMs);
    expect(regions["lv-lateral"].baseActivationTimeMs).toBeLessThan(regions["basal-lv-rv"].baseActivationTimeMs);
  });

  it("evaluates surface region state at arbitrary cardiac time", () => {
    const earlyQrs = evaluateHeartSurface(normalSinusRhythmScenario, 310);
    const lateQrs = evaluateHeartSurface(normalSinusRhythmScenario, 370);
    const tWave = evaluateHeartSurface(normalSinusRhythmScenario, 620);
    const septum = earlyQrs.find((region) => region.id === "septal-right-facing");
    const basal = lateQrs.find((region) => region.id === "basal-lv-rv");
    const lateralTWave = tWave.find((region) => region.id === "lv-lateral");

    expect(septum?.state).toBe("depolarizing");
    expect(basal?.state).toBe("depolarizing");
    expect(lateralTWave?.state).toBe("repolarizing");
    expect(getSurfaceRegionById("lv-lateral")?.bestSeenLeads).toContain("V6");
  });

  it("includes synchronized surface regions in evaluated scenario state", () => {
    const state = evaluateScenario(normalSinusRhythmScenario, 310 / 800);
    const septalRegion = state.surfaceRegions.find((region) => region.id === "septal-right-facing");

    expect(state.surfaceRegions.length).toBe(educationalHeartSurface.regions.length);
    expect(state.isochroneMap.scope).toBe("ventricles");
    expect(state.isochroneMaps["whole-heart"].bands.length).toBe(educationalHeartSurface.regions.length);
    expect(state.isochroneMaps.atria.bands.every((band) => band.chamber === "RA" || band.chamber === "LA")).toBe(true);
    expect(state.isochroneMap.bands.length).toBeGreaterThan(0);
    expect(septalRegion?.state).toBe("depolarizing");
    expect(septalRegion?.activationTimeMs).toBeCloseTo(306);
  });

  it("generates scoped isochrone maps with current contour highlights", () => {
    const surfaceRegions = evaluateHeartSurface(normalSinusRhythmScenario, 322);
    const ventricularMap = generateIsochroneMap(normalSinusRhythmScenario, 322, "ventricles", 20, surfaceRegions);
    const atrialMap = generateIsochroneMap(normalSinusRhythmScenario, 126, "atria", 20, surfaceRegions);

    expect(ventricularMap.anchorTimeMs).toBe(normalSinusRhythmScenario.timing.qrsStartMs);
    expect(ventricularMap.bands.every((band) => band.chamber === "RV" || band.chamber === "LV")).toBe(true);
    expect(ventricularMap.contours.some((contour) => contour.isCurrent)).toBe(true);
    expect(ventricularMap.contours.map((contour) => contour.label)).toContain("20 ms");
    expect(atrialMap.anchorTimeMs).toBe(normalSinusRhythmScenario.timing.pStartMs);
    expect(atrialMap.bands.every((band) => band.chamber === "RA" || band.chamber === "LA")).toBe(true);
  });

  it("builds a deterministic mesh field from the educational surface", () => {
    const field = buildHeartMeshField(normalSinusRhythmScenario, 322);
    const expectedVertices = educationalHeartSurface.regions.reduce((total, region) => total + region.vertices.length + 1, 0);
    const expectedFaces = educationalHeartSurface.regions.reduce((total, region) => total + region.vertices.length, 0);
    const chambers = new Set(field.segments.map((segment) => segment.chamber));

    expect(field.sourceSurfaceId).toBe(educationalHeartSurface.id);
    expect(field.vertices.length).toBe(expectedVertices);
    expect(field.faces.length).toBe(expectedFaces);
    expect(field.segments.length).toBe(educationalHeartSurface.regions.length);
    expect(chambers).toEqual(new Set(["RA", "LA", "RV", "LV"]));
    expect(field.faces.every((face) => face.vertexIds.length === 3)).toBe(true);
  });

  it("exposes per-vertex level-set values around the current wavefront", () => {
    const field = buildHeartMeshField(normalSinusRhythmScenario, 322);
    const septum = field.vertices.find((vertex) => vertex.id === "septal-right-facing:center");
    const apex = field.vertices.find((vertex) => vertex.id === "apical-ventricles:center");
    const basal = field.vertices.find((vertex) => vertex.id === "basal-lv-rv:center");

    expect(septum?.phiActivationMs ?? 0).toBeGreaterThan(0);
    expect(apex?.phiActivationMs).toBeCloseTo(0);
    expect(basal?.phiActivationMs ?? 0).toBeLessThan(0);
    expect(apex?.state).toBe("depolarizing");
    expect(apex?.phiRepolarizationMs ?? 0).toBeLessThan(0);
  });

  it("explains lead probe polarity and regional alignment at the QRS peak", () => {
    const state = evaluateScenario(normalSinusRhythmScenario, 340 / 800);
    const leadII = explainLeadProbe(state, "II");
    const avr = explainLeadProbe(state, "aVR");
    const v5 = explainLeadProbe(state, "V5");
    const v1 = explainLeadProbe(state, "V1");

    expect(leadII.alignment).toBe("toward");
    expect(leadII.markerVoltage).toBeGreaterThan(0);
    expect(leadII.projection).toBeGreaterThan(0);
    expect(leadII.regions.length).toBeGreaterThan(0);

    expect(avr.alignment).toBe("away");
    expect(avr.markerVoltage).toBeLessThan(0);
    expect(avr.projection).toBeLessThan(0);

    expect(v5.alignment).toBe("toward");
    expect(v5.markerVoltage).toBeGreaterThan(0);
    expect(v5.projection).toBeGreaterThan(0);

    expect(v1.markerVoltage).toBeLessThan(0);
    expect(v1.regions.length).toBeGreaterThan(0);
    expect(["away", "mixed", "sideways"]).toContain(v1.alignment);

    for (const probe of [leadII, avr, v5]) {
      expect(Math.sign(probe.projection)).toBe(Math.sign(probe.markerVoltage));
      expect(probe.summary).toContain(`${probe.lead}`);
      expect(probe.alignmentLabel.length).toBeGreaterThan(8);
    }
  });

  it("explains selected surface regions with deterministic lead signatures", () => {
    const state = evaluateScenario(normalSinusRhythmScenario, 340 / 800);
    const lv = explainSurfaceRegion(state, "lv-lateral");
    const rv = explainSurfaceRegion(state, "rv-free-wall");
    const septum = explainSurfaceRegion(state, "septal-right-facing");
    const atrium = explainSurfaceRegion(state, "ra-high-lateral");

    expect(lv?.bestSeenLeads).toEqual(["I", "aVL", "V5", "V6"]);
    expect(lv?.oppositeLeads).toEqual(["aVR", "V1"]);
    expect(lv?.leadIndicators.map((item) => item.lead)).toContain("V6");
    expect(lv?.contractionOnsetMs).toBeGreaterThan(lv?.activationTimeMs ?? 0);

    expect(rv?.bestSeenLeads).toContain("V1");
    expect(septum?.bestSeenLeads).toEqual(["V1", "V2"]);
    expect(atrium?.chamber).toBe("RA");
    expect(atrium?.contractionOnsetMs).toBeGreaterThan(atrium?.activationTimeMs ?? 0);

    for (const inspection of [lv, rv, septum, atrium]) {
      expect(inspection).toBeDefined();
      expect(inspection?.leadIndicators.length).toBeGreaterThan(1);
      expect(inspection?.summary).toContain(inspection?.label);
    }
  });

  it("uses scenario-specific activation timing for surface evaluation", () => {
    const rbbb = scenarioLibrary.find((scenario) => scenario.id === "right-bundle-branch-block");
    expect(rbbb).toBeDefined();

    const normalBasal = evaluateHeartSurface(normalSinusRhythmScenario, 430).find((region) => region.id === "basal-lv-rv");
    const delayedBasal = evaluateHeartSurface(rbbb!, 430).find((region) => region.id === "basal-lv-rv");

    expect(normalBasal?.state).toBe("active");
    expect(delayedBasal?.activationTimeMs).toBeGreaterThan(normalBasal?.activationTimeMs ?? 0);
    expect(delayedBasal?.state).toBe("resting");
  });

  it("derives V2 abnormal teaching scenarios from heart or electrode changes first", () => {
    const normal = evaluateScenario(normalSinusRhythmScenario, normalSinusRhythmScenario.timing.qrsPeakMs / normalSinusRhythmScenario.timing.cycleMs);
    const conductionDelay = scenarioLibrary.find((scenario) => scenario.id === "prolonged-av-conduction");
    const ectopic = scenarioLibrary.find((scenario) => scenario.id === "ventricular-ectopic-focus");
    const reversed = scenarioLibrary.find((scenario) => scenario.id === "reversed-arm-leads");

    expect(conductionDelay?.timing.qrsStartMs).toBeGreaterThan(normalSinusRhythmScenario.timing.qrsStartMs);
    expect(conductionDelay?.activationModel.nodes.find((node) => node.id === "his-bundle")?.activationTimeMs).toBeGreaterThan(360);

    expect(ectopic).toBeDefined();
    const ectopicSurface = evaluateHeartSurface(ectopic!, ectopic!.timing.qrsStartMs + 8);
    const ectopicRv = ectopicSurface.find((region) => region.id === "rv-free-wall");
    const ectopicSeptum = ectopicSurface.find((region) => region.id === "septal-right-facing");
    expect(ectopicRv?.state).toBe("depolarizing");
    expect((ectopicRv?.activationTimeMs ?? 0)).toBeLessThan(ectopicSeptum?.activationTimeMs ?? 0);

    expect(reversed?.electrodeOverrides?.RA).toEqual(expect.objectContaining(normalSinusRhythmScenario.electrodeOverrides?.LA ?? { x: 0.75 }));
    const reversedState = evaluateScenario(reversed!, reversed!.timing.qrsPeakMs / reversed!.timing.cycleMs);
    expect(Math.sign(reversedState.leadVoltages.I)).toBe(-Math.sign(normal.leadVoltages.I));
  });
});
