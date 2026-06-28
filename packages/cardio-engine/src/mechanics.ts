import type {
  CardiacScenario,
  FlowState,
  HeartSurfaceRegionState,
  HeartSoundMarker,
  MechanicalPhase,
  MechanicalState,
  ValveName,
  ValveState
} from "./types";

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

function smoothStep(edge0: number, edge1: number, value: number): number {
  if (edge0 === edge1) {
    return value >= edge1 ? 1 : 0;
  }

  const x = clamp01((value - edge0) / (edge1 - edge0));
  return x * x * (3 - 2 * x);
}

function pulse(start: number, peak: number, end: number, value: number): number {
  if (value <= start || value >= end) return 0;
  if (value <= peak) return smoothStep(start, peak, value);
  return 1 - smoothStep(peak, end, value);
}

function soundMarkers(scenario: CardiacScenario): HeartSoundMarker[] {
  const { timing } = scenario;
  const s1 = timing.qrsStartMs + 42;
  const s2 = timing.tStartMs - 22;

  return [
    {
      id: "S1",
      label: "S1",
      timeMs: s1,
      normalizedTime: s1 / timing.cycleMs,
      description: "Mitral and tricuspid valve closure shortly after ventricular depolarization."
    },
    {
      id: "S2",
      label: "S2",
      timeMs: s2,
      normalizedTime: s2 / timing.cycleMs,
      description: "Aortic and pulmonary valve closure near the end of ventricular ejection."
    }
  ];
}

function phaseAtTime(scenario: CardiacScenario, timeMs: number): MechanicalPhase {
  const { timing } = scenario;
  const s1 = timing.qrsStartMs + 42;
  const semilunarOpen = timing.qrsEndMs + 24;
  const s2 = timing.tStartMs - 22;
  const avOpen = timing.tEndMs + 18;
  const rapidFillEnd = Math.min(timing.cycleMs - 60, avOpen + 112);

  if (timeMs >= timing.pPeakMs && timeMs < s1) return "atrial-systole";
  if (timeMs >= s1 && timeMs < semilunarOpen) return "isovolumetric-contraction";
  if (timeMs >= semilunarOpen && timeMs < s2) return "ventricular-ejection";
  if (timeMs >= s2 && timeMs < avOpen) return "isovolumetric-relaxation";
  if (timeMs >= avOpen && timeMs < rapidFillEnd) return "rapid-filling";
  return "diastasis";
}

function phaseLabel(phase: MechanicalPhase): string {
  switch (phase) {
    case "atrial-systole":
      return "Atrial systole";
    case "isovolumetric-contraction":
      return "Isovolumetric contraction";
    case "ventricular-ejection":
      return "Ventricular ejection";
    case "isovolumetric-relaxation":
      return "Isovolumetric relaxation";
    case "rapid-filling":
      return "Rapid filling";
    default:
      return "Diastasis";
  }
}

function phaseExplanation(phase: MechanicalPhase): string {
  switch (phase) {
    case "atrial-systole":
      return "Atrial contraction follows atrial depolarization and tops off ventricular filling before QRS.";
    case "isovolumetric-contraction":
      return "The AV valves have closed for S1, but semilunar valves have not opened yet, so ventricular volume is nearly fixed.";
    case "ventricular-ejection":
      return "Ventricular pressure exceeds arterial pressure, opening the aortic and pulmonary valves for outflow.";
    case "isovolumetric-relaxation":
      return "The semilunar valves close for S2 while ventricles relax before AV valves reopen.";
    case "rapid-filling":
      return "Ventricular pressure has fallen below atrial pressure, so AV valves open and blood flows into the ventricles.";
    default:
      return "Late diastolic filling is slow, with AV valves open and little active contraction.";
  }
}

function valve(
  name: ValveName,
  label: string,
  openFraction: number,
  flowDirection: string,
  pressureLabel: string
): ValveState {
  return {
    name,
    label,
    openFraction: clamp01(openFraction),
    flowDirection,
    pressureLabel
  };
}

function flowForPhase(phase: MechanicalPhase, timeMs: number, scenario: CardiacScenario): FlowState {
  const { timing } = scenario;

  if (phase === "atrial-systole") {
    return {
      region: "atrial-kick",
      label: "Atrial kick",
      intensity: pulse(timing.pPeakMs, timing.pEndMs + 35, timing.qrsStartMs + 42, timeMs),
      oxygenatedFraction: 0.55,
      direction: "Atria into ventricles through open AV valves"
    };
  }

  if (phase === "ventricular-ejection") {
    return {
      region: "aortic-ejection",
      label: "Aortic and pulmonary ejection",
      intensity: pulse(timing.qrsEndMs + 24, timing.qrsEndMs + 92, timing.tStartMs - 22, timeMs),
      oxygenatedFraction: 0.62,
      direction: "Ventricles into aorta and pulmonary artery"
    };
  }

  if (phase === "rapid-filling") {
    return {
      region: "av-inflow",
      label: "AV inflow",
      intensity: pulse(timing.tEndMs + 18, timing.tEndMs + 72, Math.min(timing.cycleMs - 60, timing.tEndMs + 130), timeMs),
      oxygenatedFraction: 0.5,
      direction: "Atria into ventricles through mitral and tricuspid valves"
    };
  }

  if (phase === "diastasis") {
    return {
      region: "venous-return",
      label: "Venous return",
      intensity: 0.32,
      oxygenatedFraction: 0.5,
      direction: "Great veins into atria with slow passive filling"
    };
  }

  return {
    region: "no-flow",
    label: "No forward valve flow",
    intensity: 0,
    oxygenatedFraction: 0.5,
    direction: "All major valves are closed in this simplified phase"
  };
}

function chamberVolume(chamber: HeartSurfaceRegionState["chamber"], atrialVolumeFraction: number, ventricularVolumeFraction: number): number {
  return chamber === "RA" || chamber === "LA" ? atrialVolumeFraction : ventricularVolumeFraction;
}

function regionContractionDelayMs(chamber: HeartSurfaceRegionState["chamber"]): number {
  return chamber === "RA" || chamber === "LA" ? 55 : 42;
}

function localContraction(region: HeartSurfaceRegionState, timeMs: number): number {
  const onset = region.activationTimeMs + regionContractionDelayMs(region.chamber);
  const peak = onset + (region.chamber === "RA" || region.chamber === "LA" ? 54 : 82);
  const end = Math.max(peak + 40, region.repolarizationTimeMs + 42);
  return pulse(onset, peak, end, timeMs);
}

export function evaluateMechanicalState(
  scenario: CardiacScenario,
  timeMs: number,
  surfaceRegions: HeartSurfaceRegionState[] = []
): MechanicalState {
  const { timing } = scenario;
  const s1 = timing.qrsStartMs + 42;
  const semilunarOpen = timing.qrsEndMs + 24;
  const s2 = timing.tStartMs - 22;
  const avOpen = timing.tEndMs + 18;
  const phase = phaseAtTime(scenario, timeMs);
  const sounds = soundMarkers(scenario);
  const activeSound = sounds.find((sound) => Math.abs(sound.timeMs - timeMs) <= 18) ?? null;

  const avOpenFraction =
    phase === "atrial-systole" || phase === "rapid-filling" || phase === "diastasis"
      ? 1
      : 1 - smoothStep(timing.qrsStartMs + 18, s1, timeMs);
  const semilunarOpenFraction =
    phase === "ventricular-ejection"
      ? smoothStep(semilunarOpen, semilunarOpen + 30, timeMs) * (1 - smoothStep(s2 - 36, s2, timeMs))
      : 0;
  const atrialContraction = pulse(timing.pPeakMs, timing.pEndMs + 26, s1, timeMs);
  const ventricularContraction = pulse(s1, timing.qrsEndMs + 110, s2 + 42, timeMs);
  const rapidFilling = phase === "rapid-filling" ? pulse(avOpen, avOpen + 45, avOpen + 112, timeMs) : 0;
  const atrialVolumeFraction = clamp01(0.9 - atrialContraction * 0.22 + rapidFilling * 0.12);
  const ventricularVolumeFraction = clamp01(0.92 - ventricularContraction * 0.34 + rapidFilling * 0.24);
  const chamberVolumes = {
    RA: atrialVolumeFraction,
    LA: atrialVolumeFraction,
    RV: ventricularVolumeFraction,
    LV: ventricularVolumeFraction
  };

  return {
    phase,
    phaseLabel: phaseLabel(phase),
    phaseExplanation: phaseExplanation(phase),
    valves: {
      mitral: valve("mitral", "Mitral", avOpenFraction, "left atrium to left ventricle", "LA pressure > LV pressure when open"),
      tricuspid: valve("tricuspid", "Tricuspid", avOpenFraction, "right atrium to right ventricle", "RA pressure > RV pressure when open"),
      aortic: valve("aortic", "Aortic", semilunarOpenFraction, "left ventricle to aorta", "LV pressure > aortic pressure when open"),
      pulmonary: valve("pulmonary", "Pulmonary", semilunarOpenFraction, "right ventricle to pulmonary artery", "RV pressure > pulmonary artery pressure when open")
    },
    sounds,
    activeSound,
    chamber: {
      atrialContraction,
      ventricularContraction,
      atrialVolumeFraction,
      ventricularVolumeFraction,
      wallThickening: ventricularContraction * 0.42,
      electromechanicalDelayMs: 42
    },
    chamberVolumes,
    regionMechanics: surfaceRegions.map((region) => {
      const contractionProgress = localContraction(region, timeMs);
      return {
        regionId: region.id,
        chamber: region.chamber,
        activationTimeMs: region.activationTimeMs,
        contractionOnsetMs: region.activationTimeMs + regionContractionDelayMs(region.chamber),
        contractionProgress,
        wallDeformation: contractionProgress * (region.chamber === "RA" || region.chamber === "LA" ? 0.18 : 0.32),
        chamberVolumeFraction: chamberVolume(region.chamber, atrialVolumeFraction, ventricularVolumeFraction)
      };
    }),
    flow: flowForPhase(phase, timeMs, scenario)
  };
}
