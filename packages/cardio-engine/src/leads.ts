import type { LeadDefinition, LeadName, LeadVoltages, Vec3 } from "./types";
import { dot, normalize } from "./vector";

const axis = (x: number, y: number, z: number): Vec3 => normalize({ x, y, z });

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
    axis: axis(1, 0, 0)
  },
  II: {
    name: "II",
    formula: "LL - RA",
    positiveLabel: "left leg electrode (LL)",
    negativeLabel: "right arm electrode (RA)",
    axis: axis(0.55, -0.05, -0.85)
  },
  III: {
    name: "III",
    formula: "LL - LA",
    positiveLabel: "left leg electrode (LL)",
    negativeLabel: "left arm electrode (LA)",
    axis: axis(-0.2, -0.05, -1)
  },
  aVR: {
    name: "aVR",
    formula: "RA - average(LA, LL)",
    positiveLabel: "right arm electrode (RA)",
    negativeLabel: "average of LA and LL",
    axis: axis(-0.8, 0.03, 0.45)
  },
  aVL: {
    name: "aVL",
    formula: "LA - average(RA, LL)",
    positiveLabel: "left arm electrode (LA)",
    negativeLabel: "average of RA and LL",
    axis: axis(0.75, 0.03, 0.35)
  },
  aVF: {
    name: "aVF",
    formula: "LL - average(RA, LA)",
    positiveLabel: "left leg electrode (LL)",
    negativeLabel: "average of RA and LA",
    axis: axis(0, -0.05, -1)
  },
  V1: {
    name: "V1",
    formula: "V1 - Wilson central terminal",
    positiveLabel: "right sternal chest electrode (V1)",
    negativeLabel: "Wilson central terminal",
    axis: axis(-0.25, 0.9, 0.12)
  },
  V2: {
    name: "V2",
    formula: "V2 - Wilson central terminal",
    positiveLabel: "left sternal chest electrode (V2)",
    negativeLabel: "Wilson central terminal",
    axis: axis(0.02, 0.95, 0.1)
  },
  V3: {
    name: "V3",
    formula: "V3 - Wilson central terminal",
    positiveLabel: "mid anterior chest electrode (V3)",
    negativeLabel: "Wilson central terminal",
    axis: axis(0.32, 0.9, 0.02)
  },
  V4: {
    name: "V4",
    formula: "V4 - Wilson central terminal",
    positiveLabel: "left anterior chest electrode (V4)",
    negativeLabel: "Wilson central terminal",
    axis: axis(0.55, 0.74, -0.08)
  },
  V5: {
    name: "V5",
    formula: "V5 - Wilson central terminal",
    positiveLabel: "left anterolateral chest electrode (V5)",
    negativeLabel: "Wilson central terminal",
    axis: axis(0.8, 0.55, -0.05)
  },
  V6: {
    name: "V6",
    formula: "V6 - Wilson central terminal",
    positiveLabel: "left lateral chest electrode (V6)",
    negativeLabel: "Wilson central terminal",
    axis: axis(0.95, 0.35, -0.02)
  }
};

const leadGain: Record<LeadName, number> = {
  I: 0.95,
  II: 1.1,
  III: 0.78,
  aVR: 0.9,
  aVL: 0.62,
  aVF: 0.9,
  V1: 0.72,
  V2: 0.82,
  V3: 0.95,
  V4: 1.08,
  V5: 1.05,
  V6: 0.92
};

export function computeLeadVoltages(netVector: Vec3): LeadVoltages {
  return Object.fromEntries(
    leadOrder.map((name) => {
      const definition = leadDefinitions[name];
      const voltage = dot(netVector, definition.axis) * leadGain[name];
      return [name, voltage];
    })
  ) as LeadVoltages;
}
