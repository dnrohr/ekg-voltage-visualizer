export type Vec3 = {
  x: number;
  y: number;
  z: number;
};

export type CardiacPhase =
  | "baseline"
  | "p-wave"
  | "pr-segment"
  | "qrs"
  | "st-segment"
  | "t-wave";

export type LeadName =
  | "I"
  | "II"
  | "III"
  | "aVR"
  | "aVL"
  | "aVF"
  | "V1"
  | "V2"
  | "V3"
  | "V4"
  | "V5"
  | "V6";

export type ScenarioTiming = {
  bpm: number;
  cycleMs: number;
  pStartMs: number;
  pPeakMs: number;
  pEndMs: number;
  qrsStartMs: number;
  qrsPeakMs: number;
  qrsEndMs: number;
  tStartMs: number;
  tPeakMs: number;
  tEndMs: number;
};

export type WaveVectorConfig = {
  atrialDepolarization: Vec3;
  septalDepolarization: Vec3;
  ventricularDepolarization: Vec3;
  terminalDepolarization: Vec3;
  ventricularRepolarization: Vec3;
};

export type CardiacScenario = {
  id: string;
  name: string;
  description: string;
  disclaimer: string;
  timing: ScenarioTiming;
  waveVectors: WaveVectorConfig;
};

export type LeadDefinition = {
  name: LeadName;
  formula: string;
  positiveLabel: string;
  negativeLabel: string;
  axis: Vec3;
};

export type LeadVoltages = Record<LeadName, number>;

export type PhaseProgress = {
  atrialDepolarization: number;
  ventricularDepolarization: number;
  ventricularRepolarization: number;
};

export type SimulationState = {
  normalizedTime: number;
  timeMs: number;
  phase: CardiacPhase;
  phaseLabel: string;
  netVector: Vec3;
  leadVoltages: LeadVoltages;
  phaseProgress: PhaseProgress;
};

export type LeadExplanation = {
  lead: LeadName;
  formula: string;
  positiveLabel: string;
  negativeLabel: string;
  voltage: number;
  polarity: "positive" | "negative" | "near-flat";
  summary: string;
};

export type TraceSample = {
  normalizedTime: number;
  timeMs: number;
  voltage: number;
};
