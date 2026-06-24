import {
  computeElectrodePotentials,
  computeLeadVoltages,
  computeSourceContribution,
  computeWilsonCentralTerminal,
  leadDefinitions,
  resolveTerminalPotential
} from "./leads";
import type {
  CardiacPhase,
  CardiacScenario,
  LeadExplanation,
  LeadName,
  RegionalCardiacSource,
  SimulationState,
  TraceSample,
  Vec3
} from "./types";
import { add, dot, scale } from "./vector";

const zeroVector: Vec3 = { x: 0, y: 0, z: 0 };

export function normalizeCycleTime(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return ((value % 1) + 1) % 1;
}

function smoothStep(edge0: number, edge1: number, value: number): number {
  if (edge0 === edge1) {
    return value >= edge1 ? 1 : 0;
  }

  const x = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return x * x * (3 - 2 * x);
}

function windowProgress(start: number, end: number, value: number): number {
  if (value <= start || value >= end) {
    return 0;
  }

  return smoothStep(start, (start + end) / 2, value) * (1 - smoothStep((start + end) / 2, end, value));
}

function gaussian(center: number, width: number, value: number): number {
  const distance = (value - center) / width;
  return Math.exp(-0.5 * distance * distance);
}

function phaseAtMs(scenario: CardiacScenario, timeMs: number): CardiacPhase {
  const timing = scenario.timing;

  if (timeMs >= timing.pStartMs && timeMs <= timing.pEndMs) return "p-wave";
  if (timeMs > timing.pEndMs && timeMs < timing.qrsStartMs) return "pr-segment";
  if (timeMs >= timing.qrsStartMs && timeMs <= timing.qrsEndMs) return "qrs";
  if (timeMs > timing.qrsEndMs && timeMs < timing.tStartMs) return "st-segment";
  if (timeMs >= timing.tStartMs && timeMs <= timing.tEndMs) return "t-wave";

  return "baseline";
}

function phaseLabel(phase: CardiacPhase): string {
  switch (phase) {
    case "p-wave":
      return "P wave: atrial depolarization";
    case "pr-segment":
      return "PR segment: AV nodal delay";
    case "qrs":
      return "QRS complex: ventricular depolarization";
    case "st-segment":
      return "ST segment: ventricles broadly depolarized";
    case "t-wave":
      return "T wave: ventricular repolarization";
    default:
      return "Baseline: little net electrical change";
  }
}

function activeSource(
  id: RegionalCardiacSource["id"],
  label: string,
  region: string,
  sourceType: RegionalCardiacSource["sourceType"],
  position: Vec3,
  moment: Vec3,
  strength: number
): RegionalCardiacSource {
  return {
    id,
    label,
    region,
    sourceType,
    position,
    moment,
    strength
  };
}

export function evaluateScenario(scenario: CardiacScenario, normalizedTime: number): SimulationState {
  const normalized = normalizeCycleTime(normalizedTime);
  const timeMs = normalized * scenario.timing.cycleMs;
  const timing = scenario.timing;

  const p = windowProgress(timing.pStartMs, timing.pEndMs, timeMs);
  const septal = gaussian(timing.qrsStartMs + 12, 8, timeMs);
  const qrs = gaussian(timing.qrsPeakMs, 18, timeMs);
  const terminal = gaussian(timing.qrsEndMs - 12, 10, timeMs);
  const t = windowProgress(timing.tStartMs, timing.tEndMs, timeMs);

  const cardiacSources: RegionalCardiacSource[] = [
    activeSource(
      "atrialDepolarization",
      "Atrial depolarization",
      "right-to-left atria",
      "depolarization",
      { x: -0.05, y: 0.18, z: 0.32 },
      scenario.waveVectors.atrialDepolarization,
      0.34 * p
    ),
    activeSource(
      "septalDepolarization",
      "Septal depolarization",
      "interventricular septum",
      "depolarization",
      { x: -0.04, y: 0.22, z: 0.04 },
      scenario.waveVectors.septalDepolarization,
      0.45 * septal
    ),
    activeSource(
      "ventricularDepolarization",
      "Main ventricular depolarization",
      "left ventricular free wall",
      "depolarization",
      { x: 0.07, y: 0.18, z: -0.16 },
      scenario.waveVectors.ventricularDepolarization,
      1.45 * qrs
    ),
    activeSource(
      "terminalDepolarization",
      "Terminal ventricular depolarization",
      "basal ventricles",
      "depolarization",
      { x: 0.12, y: 0.1, z: 0.08 },
      scenario.waveVectors.terminalDepolarization,
      0.5 * terminal
    ),
    activeSource(
      "ventricularRepolarization",
      "Ventricular repolarization",
      "recovering ventricular muscle",
      "repolarization",
      { x: 0.1, y: 0.2, z: -0.12 },
      scenario.waveVectors.ventricularRepolarization,
      0.82 * t
    )
  ];

  const netVector = cardiacSources
    .map((source) => scale(source.moment, source.strength))
    .reduce(add, zeroVector);
  const electrodePotentials = computeElectrodePotentials(cardiacSources);
  const leadVoltages = computeLeadVoltages(electrodePotentials);

  const phase = phaseAtMs(scenario, timeMs);

  return {
    normalizedTime: normalized,
    timeMs,
    phase,
    phaseLabel: phaseLabel(phase),
    netVector,
    cardiacSources,
    electrodePotentials,
    wilsonCentralTerminal: computeWilsonCentralTerminal(electrodePotentials),
    leadVoltages,
    phaseProgress: {
      atrialDepolarization: p,
      ventricularDepolarization: Math.max(septal, qrs, terminal),
      ventricularRepolarization: t
    }
  };
}

export function generateLeadTrace(
  scenario: CardiacScenario,
  lead: LeadName,
  samples = 240
): TraceSample[] {
  return Array.from({ length: samples }, (_, index) => {
    const normalizedTime = index / (samples - 1);
    const state = evaluateScenario(scenario, normalizedTime);

    return {
      normalizedTime,
      timeMs: state.timeMs,
      voltage: state.leadVoltages[lead]
    };
  });
}

export function explainLead(
  state: SimulationState,
  lead: LeadName
): LeadExplanation {
  const definition = leadDefinitions[lead];
  const voltage = state.leadVoltages[lead];
  const alignment = dot(state.netVector, definition.axis);
  const positivePotential = resolveTerminalPotential(
    definition.positiveTerminal,
    state.electrodePotentials
  );
  const negativePotential = resolveTerminalPotential(
    definition.negativeTerminal,
    state.electrodePotentials
  );
  const contributions = state.cardiacSources
    .map((source) => computeSourceContribution(source, lead))
    .filter((contribution) => Math.abs(contribution.leadVoltage) > 0.001)
    .sort((a, b) => Math.abs(b.leadVoltage) - Math.abs(a.leadVoltage));
  const polarity =
    Math.abs(voltage) < 0.04 ? "near-flat" : voltage > 0 ? "positive" : "negative";
  const direction =
    polarity === "near-flat"
      ? "nearly perpendicular to this lead axis or too small to move the trace much"
      : alignment > 0
        ? "pointing toward this lead's positive side"
        : "pointing away from this lead's positive side";

  return {
    lead,
    formula: definition.formula,
    positiveLabel: definition.positiveLabel,
    negativeLabel: definition.negativeLabel,
    voltage,
    positivePotential,
    negativePotential,
    contributions,
    polarity,
    summary: `During ${state.phaseLabel.toLowerCase()}, regional sources create body-surface potentials. ${lead} subtracts ${definition.negativeTerminal.label} from ${definition.positiveTerminal.label}; the current difference is ${direction}, so the trace is ${polarity}.`
  };
}
