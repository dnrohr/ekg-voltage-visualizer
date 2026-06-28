import { normalSinusRhythmScenario } from "./scenario";
import { electrodeDefinitions } from "./leads";
import type { ActivationModel, CardiacScenario, ScenarioTiming, WaveVectorConfig } from "./types";

type ScenarioOverrides = Omit<Partial<CardiacScenario>, "timing" | "waveVectors" | "activationModel"> & {
  timing?: Partial<ScenarioTiming>;
  waveVectors?: Partial<WaveVectorConfig>;
  activationModel?: ActivationModel;
};

function cloneScenario(overrides: ScenarioOverrides): CardiacScenario {
  const baseActivationModel = {
    ...normalSinusRhythmScenario.activationModel,
    nodes: normalSinusRhythmScenario.activationModel.nodes.map((node) => ({ ...node })),
    edges: normalSinusRhythmScenario.activationModel.edges.map((edge) => ({ ...edge }))
  };

  return {
    ...normalSinusRhythmScenario,
    ...overrides,
    timing: { ...normalSinusRhythmScenario.timing, ...overrides.timing },
    waveVectors: { ...normalSinusRhythmScenario.waveVectors, ...overrides.waveVectors },
    activationModel: overrides.activationModel ?? baseActivationModel
  };
}

function shiftedActivation(multiplier: number, terminalDelay = 0) {
  return {
    ...normalSinusRhythmScenario.activationModel,
    nodes: normalSinusRhythmScenario.activationModel.nodes.map((node) => {
      const isVentricle = ["his-purkinje", "septum", "ventricle", "base"].includes(node.role);
      const extra = node.id === "basal-ventricles" ? terminalDelay : 0;
      return {
        ...node,
        activationTimeMs: isVentricle
          ? normalSinusRhythmScenario.timing.qrsStartMs + (node.activationTimeMs - normalSinusRhythmScenario.timing.qrsStartMs) * multiplier + extra
          : node.activationTimeMs,
        repolarizationTimeMs: isVentricle ? node.repolarizationTimeMs + extra * 0.8 : node.repolarizationTimeMs
      };
    }),
    depolarizationDurationMs: normalSinusRhythmScenario.activationModel.depolarizationDurationMs * multiplier
  };
}

function activationWithNodeUpdates(updates: Record<string, Partial<ActivationModel["nodes"][number]>>): ActivationModel {
  return {
    ...normalSinusRhythmScenario.activationModel,
    nodes: normalSinusRhythmScenario.activationModel.nodes.map((node) => ({
      ...node,
      ...(updates[node.id] ?? {})
    })),
    edges: normalSinusRhythmScenario.activationModel.edges.map((edge) => ({ ...edge }))
  };
}

export const scenarioLibrary: CardiacScenario[] = [
  {
    ...normalSinusRhythmScenario,
    category: "baseline",
    whatChanged: [
      "Normal axis and a 75 bpm cycle anchor the comparison view.",
      "Ventricular activation moves rapidly from septum and apex toward the left ventricular free wall.",
      "Reference overlay uses a synthetic teaching trace, not patient data."
    ],
    reference: {
      label: "Synthetic normal lead II reference",
      source: "Project-authored waveform envelope",
      license: "Project documentation",
      notes: "Used for timing and polarity sanity checks only."
    }
  },
  cloneScenario({
    id: "sinus-bradycardia",
    name: "Sinus bradycardia",
    category: "rate",
    description: "A slower 1200 ms teaching beat with the same activation direction and longer baseline intervals.",
    timing: {
      bpm: 50,
      cycleMs: 1200,
      pStartMs: 140,
      pPeakMs: 205,
      pEndMs: 270,
      qrsStartMs: 470,
      qrsPeakMs: 512,
      qrsEndMs: 565,
      tStartMs: 760,
      tPeakMs: 900,
      tEndMs: 1060
    },
    whatChanged: [
      "The cycle length is longer, so quiet baseline time increases.",
      "P, QRS, and T ordering is preserved.",
      "Lead polarity should remain close to the normal baseline."
    ]
  }),
  cloneScenario({
    id: "sinus-tachycardia",
    name: "Sinus tachycardia",
    category: "rate",
    description: "A faster 545 ms teaching beat with compressed intervals and preserved activation direction.",
    timing: {
      bpm: 110,
      cycleMs: 545,
      pStartMs: 42,
      pPeakMs: 76,
      pEndMs: 112,
      qrsStartMs: 188,
      qrsPeakMs: 224,
      qrsEndMs: 270,
      tStartMs: 348,
      tPeakMs: 420,
      tEndMs: 505
    },
    whatChanged: [
      "The cycle length is shorter, compressing PR, ST, and TP intervals.",
      "The teaching morphology remains similar because the activation vector is unchanged.",
      "Mechanical phases also compress around the faster electrical clock."
    ]
  }),
  cloneScenario({
    id: "left-axis-deviation",
    name: "Left axis deviation",
    category: "axis",
    description: "A leftward-superior main ventricular vector to demonstrate limb-lead polarity changes.",
    waveVectors: {
      ventricularDepolarization: { x: 0.78, y: -0.08, z: -0.38 },
      terminalDepolarization: { x: 0.2, y: -0.05, z: 0.12 }
    },
    whatChanged: [
      "The main QRS vector points more leftward and superior.",
      "Lead I becomes more positive while inferior leads lose positivity.",
      "This is a conceptual axis demonstration, not a diagnostic classifier."
    ]
  }),
  cloneScenario({
    id: "right-axis-deviation",
    name: "Right axis deviation",
    category: "axis",
    description: "A rightward-inferior main ventricular vector to demonstrate alternate limb-lead polarity.",
    waveVectors: {
      ventricularDepolarization: { x: -0.34, y: 0.22, z: -0.82 },
      terminalDepolarization: { x: -0.24, y: 0.02, z: 0.2 }
    },
    whatChanged: [
      "The main QRS vector points more rightward and inferior.",
      "Lead I becomes less positive while inferior/rightward projections grow.",
      "Chest-lead details remain simplified."
    ]
  }),
  cloneScenario({
    id: "right-bundle-branch-block",
    name: "Right bundle branch block",
    category: "conduction",
    description: "Delayed right ventricular terminal activation with a wider QRS teaching pattern.",
    activationModel: shiftedActivation(1.45, 42),
    timing: {
      qrsEndMs: 440,
      tStartMs: 555,
      tPeakMs: 632,
      tEndMs: 735
    },
    waveVectors: {
      terminalDepolarization: { x: -0.48, y: 0.03, z: 0.34 }
    },
    whatChanged: [
      "Terminal ventricular activation is delayed and directed rightward from the altered activation model.",
      "The generated QRS widens relative to the normal baseline.",
      "The pattern is intentionally stylized for learning timing and direction."
    ]
  }),
  cloneScenario({
    id: "left-bundle-branch-block",
    name: "Left bundle branch block",
    category: "conduction",
    description: "Delayed left ventricular activation with broader leftward terminal forces.",
    activationModel: shiftedActivation(1.62, 58),
    timing: {
      qrsEndMs: 460,
      tStartMs: 575,
      tPeakMs: 650,
      tEndMs: 750
    },
    waveVectors: {
      septalDepolarization: { x: 0.14, y: 0.06, z: -0.02 },
      ventricularDepolarization: { x: 0.72, y: 0.12, z: -0.54 },
      terminalDepolarization: { x: 0.54, y: 0.02, z: -0.2 }
    },
    whatChanged: [
      "Septal and left-ventricular activation timing are altered before the ECG is generated.",
      "Left ventricular activation is delayed, widening the QRS.",
      "This supports comparison of direction and timing, not clinical diagnosis."
    ]
  }),
  cloneScenario({
    id: "prolonged-av-conduction",
    name: "Adjustable conduction delay",
    category: "conduction",
    description: "A teaching scenario with delayed AV-to-His timing and a longer PR interval before an otherwise familiar ventricular route.",
    timing: {
      qrsStartMs: 390,
      qrsPeakMs: 432,
      qrsEndMs: 486,
      tStartMs: 584,
      tPeakMs: 662,
      tEndMs: 744
    },
    activationModel: activationWithNodeUpdates({
      "av-node": { activationTimeMs: 240, repolarizationTimeMs: 355 },
      "his-bundle": { activationTimeMs: 386, repolarizationTimeMs: 520 },
      "septum-left-to-right": { activationTimeMs: 398, repolarizationTimeMs: 620 },
      apex: { activationTimeMs: 414, repolarizationTimeMs: 560 },
      "right-ventricle": { activationTimeMs: 428, repolarizationTimeMs: 580 },
      "left-ventricle": { activationTimeMs: 436, repolarizationTimeMs: 628 },
      "basal-ventricles": { activationTimeMs: 458, repolarizationTimeMs: 662 }
    }),
    whatChanged: [
      "The AV-to-His delay is prolonged before ventricular activation begins.",
      "The ventricular route is otherwise similar, so the main lesson is timing rather than morphology.",
      "This is a controllable conduction-delay teaching case, not a diagnosis."
    ]
  }),
  cloneScenario({
    id: "ventricular-ectopic-focus",
    name: "Ventricular ectopic focus",
    category: "ectopic",
    description: "A broad ventricular beat beginning from the right ventricular free wall instead of the normal His-Purkinje sequence.",
    timing: {
      qrsStartMs: 260,
      qrsPeakMs: 330,
      qrsEndMs: 430,
      tStartMs: 548,
      tPeakMs: 640,
      tEndMs: 735
    },
    activationModel: activationWithNodeUpdates({
      "his-bundle": { activationTimeMs: 380, repolarizationTimeMs: 540 },
      "septum-left-to-right": { activationTimeMs: 340, repolarizationTimeMs: 620 },
      "right-ventricle": { activationTimeMs: 262, repolarizationTimeMs: 570 },
      apex: { activationTimeMs: 306, repolarizationTimeMs: 590 },
      "left-ventricle": { activationTimeMs: 364, repolarizationTimeMs: 650 },
      "basal-ventricles": { activationTimeMs: 402, repolarizationTimeMs: 690 }
    }),
    waveVectors: {
      septalDepolarization: { x: -0.16, y: 0.08, z: 0.18 },
      ventricularDepolarization: { x: 0.42, y: -0.18, z: 0.72 },
      terminalDepolarization: { x: 0.62, y: 0.04, z: -0.16 }
    },
    whatChanged: [
      "The earliest ventricular surface activation starts in the right ventricular free wall.",
      "Activation then spreads cell-to-cell across the ventricles, widening the generated QRS.",
      "The P wave remains synthetic context; the ventricular beat is the teaching focus."
    ]
  }),
  cloneScenario({
    id: "reversed-arm-leads",
    name: "Reversed arm leads",
    category: "electrode-placement",
    description: "A teaching case where the RA and LA electrode positions are swapped before lead voltages are derived.",
    electrodeOverrides: {
      RA: electrodeDefinitions.LA.position,
      LA: electrodeDefinitions.RA.position
    },
    whatChanged: [
      "The physical right-arm and left-arm electrode positions are swapped in the electrode model.",
      "Lead voltages are recomputed from the altered electrode potentials instead of manually flipped.",
      "This demonstrates electrode configuration effects, not a heart activation abnormality."
    ]
  })
];

export function getScenarioById(id: string): CardiacScenario {
  return scenarioLibrary.find((scenario) => scenario.id === id) ?? scenarioLibrary[0];
}

export function validateScenarioSchema(scenario: CardiacScenario): string[] {
  const errors: string[] = [];
  const timing = scenario.timing;

  if (!scenario.id || !scenario.name) errors.push("Scenario requires an id and name.");
  if (timing.cycleMs <= 0 || timing.bpm <= 0) errors.push("Timing requires positive cycleMs and bpm.");
  if (!(timing.pStartMs < timing.pPeakMs && timing.pPeakMs < timing.pEndMs)) errors.push("P wave timing must be ordered.");
  if (!(timing.qrsStartMs < timing.qrsPeakMs && timing.qrsPeakMs < timing.qrsEndMs)) errors.push("QRS timing must be ordered.");
  if (!(timing.tStartMs < timing.tPeakMs && timing.tPeakMs < timing.tEndMs)) errors.push("T wave timing must be ordered.");
  if (!(timing.pEndMs < timing.qrsStartMs && timing.qrsEndMs < timing.tStartMs)) errors.push("Electrical phases must occur in P-QRS-T order.");
  if (timing.tEndMs > timing.cycleMs) errors.push("T wave must end within the cycle.");
  if (scenario.activationModel.nodes.length < 4) errors.push("Activation model needs enough nodes for teaching sequence.");

  return errors;
}
