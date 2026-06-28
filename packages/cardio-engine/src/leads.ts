import type {
  ElectrodeDefinition,
  ElectrodeName,
  ElectrodePotentials,
  LeadDefinition,
  LeadName,
  LeadTerminal,
  LeadVoltages,
  RegionalCardiacSource,
  SourceContribution,
  Vec3
} from "./types";
import { dot, magnitude, normalize, subtract } from "./vector";

const axis = (x: number, y: number, z: number): Vec3 => normalize({ x, y, z });
const terminal = (label: string, weights: Partial<Record<ElectrodeName, number>>): LeadTerminal => ({
  label,
  weights
});

export const electrodeOrder: ElectrodeName[] = [
  "RA",
  "LA",
  "RL",
  "LL",
  "V1",
  "V2",
  "V3",
  "V4",
  "V5",
  "V6"
];

export const electrodeDefinitions: Record<ElectrodeName, ElectrodeDefinition> = {
  RA: {
    name: "RA",
    label: "right arm electrode",
    position: { x: -0.75, y: 0.15, z: 0.75 },
    role: "limb"
  },
  LA: {
    name: "LA",
    label: "left arm electrode",
    position: { x: 0.75, y: 0.15, z: 0.75 },
    role: "limb"
  },
  RL: {
    name: "RL",
    label: "right leg ground electrode",
    position: { x: -0.55, y: 0.1, z: -0.85 },
    role: "ground"
  },
  LL: {
    name: "LL",
    label: "left leg electrode",
    position: { x: 0.55, y: 0.1, z: -0.85 },
    role: "limb"
  },
  V1: {
    name: "V1",
    label: "right sternal chest electrode",
    position: { x: -0.22, y: 1, z: 0.18 },
    role: "precordial"
  },
  V2: {
    name: "V2",
    label: "left sternal chest electrode",
    position: { x: 0.02, y: 1, z: 0.18 },
    role: "precordial"
  },
  V3: {
    name: "V3",
    label: "mid anterior chest electrode",
    position: { x: 0.28, y: 1, z: 0.1 },
    role: "precordial"
  },
  V4: {
    name: "V4",
    label: "left anterior chest electrode",
    position: { x: 0.52, y: 0.95, z: 0 },
    role: "precordial"
  },
  V5: {
    name: "V5",
    label: "left anterolateral chest electrode",
    position: { x: 0.78, y: 0.78, z: 0 },
    role: "precordial"
  },
  V6: {
    name: "V6",
    label: "left lateral chest electrode",
    position: { x: 0.95, y: 0.55, z: 0 },
    role: "precordial"
  }
};

export const leadOrder: LeadName[] = [
  "I",
  "II",
  "III",
  "aVR",
  "aVL",
  "aVF",
  "V1",
  "V2",
  "V3",
  "V4",
  "V5",
  "V6"
];

export const leadDefinitions: Record<LeadName, LeadDefinition> = {
  I: {
    name: "I",
    formula: "LA - RA",
    positiveLabel: "left arm electrode (LA)",
    negativeLabel: "right arm electrode (RA)",
    positiveTerminal: terminal("LA", { LA: 1 }),
    negativeTerminal: terminal("RA", { RA: 1 }),
    axis: axis(1, 0, 0)
  },
  II: {
    name: "II",
    formula: "LL - RA",
    positiveLabel: "left leg electrode (LL)",
    negativeLabel: "right arm electrode (RA)",
    positiveTerminal: terminal("LL", { LL: 1 }),
    negativeTerminal: terminal("RA", { RA: 1 }),
    axis: axis(0.55, -0.05, -0.85)
  },
  III: {
    name: "III",
    formula: "LL - LA",
    positiveLabel: "left leg electrode (LL)",
    negativeLabel: "left arm electrode (LA)",
    positiveTerminal: terminal("LL", { LL: 1 }),
    negativeTerminal: terminal("LA", { LA: 1 }),
    axis: axis(-0.2, -0.05, -1)
  },
  aVR: {
    name: "aVR",
    formula: "RA - average(LA, LL)",
    positiveLabel: "right arm electrode (RA)",
    negativeLabel: "average of LA and LL",
    positiveTerminal: terminal("RA", { RA: 1 }),
    negativeTerminal: terminal("average(LA, LL)", { LA: 0.5, LL: 0.5 }),
    axis: axis(-0.8, 0.03, 0.45)
  },
  aVL: {
    name: "aVL",
    formula: "LA - average(RA, LL)",
    positiveLabel: "left arm electrode (LA)",
    negativeLabel: "average of RA and LL",
    positiveTerminal: terminal("LA", { LA: 1 }),
    negativeTerminal: terminal("average(RA, LL)", { RA: 0.5, LL: 0.5 }),
    axis: axis(0.75, 0.03, 0.35)
  },
  aVF: {
    name: "aVF",
    formula: "LL - average(RA, LA)",
    positiveLabel: "left leg electrode (LL)",
    negativeLabel: "average of RA and LA",
    positiveTerminal: terminal("LL", { LL: 1 }),
    negativeTerminal: terminal("average(RA, LA)", { RA: 0.5, LA: 0.5 }),
    axis: axis(0, -0.05, -1)
  },
  V1: {
    name: "V1",
    formula: "V1 - Wilson central terminal",
    positiveLabel: "right sternal chest electrode (V1)",
    negativeLabel: "Wilson central terminal",
    positiveTerminal: terminal("V1", { V1: 1 }),
    negativeTerminal: terminal("Wilson central terminal", { RA: 1 / 3, LA: 1 / 3, LL: 1 / 3 }),
    axis: axis(-0.25, 0.9, 0.12)
  },
  V2: {
    name: "V2",
    formula: "V2 - Wilson central terminal",
    positiveLabel: "left sternal chest electrode (V2)",
    negativeLabel: "Wilson central terminal",
    positiveTerminal: terminal("V2", { V2: 1 }),
    negativeTerminal: terminal("Wilson central terminal", { RA: 1 / 3, LA: 1 / 3, LL: 1 / 3 }),
    axis: axis(0.02, 0.95, 0.1)
  },
  V3: {
    name: "V3",
    formula: "V3 - Wilson central terminal",
    positiveLabel: "mid anterior chest electrode (V3)",
    negativeLabel: "Wilson central terminal",
    positiveTerminal: terminal("V3", { V3: 1 }),
    negativeTerminal: terminal("Wilson central terminal", { RA: 1 / 3, LA: 1 / 3, LL: 1 / 3 }),
    axis: axis(0.32, 0.9, 0.02)
  },
  V4: {
    name: "V4",
    formula: "V4 - Wilson central terminal",
    positiveLabel: "left anterior chest electrode (V4)",
    negativeLabel: "Wilson central terminal",
    positiveTerminal: terminal("V4", { V4: 1 }),
    negativeTerminal: terminal("Wilson central terminal", { RA: 1 / 3, LA: 1 / 3, LL: 1 / 3 }),
    axis: axis(0.55, 0.74, -0.08)
  },
  V5: {
    name: "V5",
    formula: "V5 - Wilson central terminal",
    positiveLabel: "left anterolateral chest electrode (V5)",
    negativeLabel: "Wilson central terminal",
    positiveTerminal: terminal("V5", { V5: 1 }),
    negativeTerminal: terminal("Wilson central terminal", { RA: 1 / 3, LA: 1 / 3, LL: 1 / 3 }),
    axis: axis(0.8, 0.55, -0.05)
  },
  V6: {
    name: "V6",
    formula: "V6 - Wilson central terminal",
    positiveLabel: "left lateral chest electrode (V6)",
    negativeLabel: "Wilson central terminal",
    positiveTerminal: terminal("V6", { V6: 1 }),
    negativeTerminal: terminal("Wilson central terminal", { RA: 1 / 3, LA: 1 / 3, LL: 1 / 3 }),
    axis: axis(0.95, 0.35, -0.02)
  }
};

export function computeWilsonCentralTerminal(electrodePotentials: ElectrodePotentials): number {
  return (electrodePotentials.RA + electrodePotentials.LA + electrodePotentials.LL) / 3;
}

export function resolveTerminalPotential(
  terminalDefinition: LeadTerminal,
  electrodePotentials: ElectrodePotentials
): number {
  return Object.entries(terminalDefinition.weights).reduce(
    (total, [electrode, weight]) =>
      total + electrodePotentials[electrode as ElectrodeName] * (weight ?? 0),
    0
  );
}

export function computeLeadVoltage(
  lead: LeadName,
  electrodePotentials: ElectrodePotentials
): number {
  const definition = leadDefinitions[lead];
  const positive = resolveTerminalPotential(definition.positiveTerminal, electrodePotentials);
  const negative = resolveTerminalPotential(definition.negativeTerminal, electrodePotentials);

  return positive - negative;
}

export function computeLeadVoltages(electrodePotentials: ElectrodePotentials): LeadVoltages {
  return Object.fromEntries(
    leadOrder.map((name) => {
      return [name, computeLeadVoltage(name, electrodePotentials)];
    })
  ) as LeadVoltages;
}

function potentialContribution(source: RegionalCardiacSource, electrode: ElectrodeDefinition): number {
  const displacement = subtract(electrode.position, source.position);
  const distance = Math.max(0.24, magnitude(displacement));

  return source.strength * dot(source.moment, displacement) / distance ** 3;
}

export function computeElectrodePotentials(
  sources: RegionalCardiacSource[],
  electrodeOverrides: Partial<Record<ElectrodeName, Vec3>> = {}
): ElectrodePotentials {
  return Object.fromEntries(
    electrodeOrder.map((electrodeName) => {
      const electrode = {
        ...electrodeDefinitions[electrodeName],
        position: electrodeOverrides[electrodeName] ?? electrodeDefinitions[electrodeName].position
      };
      const potential = sources.reduce(
        (total, source) => total + potentialContribution(source, electrode),
        0
      );

      return [electrodeName, potential];
    })
  ) as ElectrodePotentials;
}

export function computeSourceContribution(
  source: RegionalCardiacSource,
  lead: LeadName
): SourceContribution {
  const electrodePotentials = computeElectrodePotentials([source]);

  return {
    sourceId: source.id,
    label: source.label,
    region: source.region,
    sourceType: source.sourceType,
    leadVoltage: computeLeadVoltage(lead, electrodePotentials)
  };
}
