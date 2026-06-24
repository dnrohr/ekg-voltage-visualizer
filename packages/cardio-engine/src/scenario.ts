import type { CardiacScenario } from "./types";

export const normalSinusRhythmScenario: CardiacScenario = {
  id: "normal-sinus-rhythm",
  name: "Normal sinus rhythm",
  description:
    "One idealized 800 ms teaching beat with atrial depolarization, AV delay, ventricular depolarization, ST segment, and ventricular repolarization.",
  disclaimer:
    "Synthetic teaching signal only. This model is not diagnostic software, medical advice, or a patient-specific ECG simulation.",
  timing: {
    bpm: 75,
    cycleMs: 800,
    pStartMs: 80,
    pPeakMs: 130,
    pEndMs: 180,
    qrsStartMs: 300,
    qrsPeakMs: 340,
    qrsEndMs: 390,
    tStartMs: 520,
    tPeakMs: 610,
    tEndMs: 720
  },
  waveVectors: {
    atrialDepolarization: { x: 0.22, y: 0.02, z: -0.18 },
    septalDepolarization: { x: -0.22, y: 0.1, z: 0.02 },
    ventricularDepolarization: { x: 0.62, y: 0.16, z: -0.78 },
    terminalDepolarization: { x: -0.12, y: -0.03, z: 0.25 },
    ventricularRepolarization: { x: 0.34, y: 0.08, z: -0.34 }
  },
  activationModel: {
    depolarizationDurationMs: 34,
    repolarizationDurationMs: 76,
    nodes: [
      {
        id: "sa-node",
        label: "SA node",
        region: "right atrium",
        role: "pacemaker",
        position: { x: -0.42, y: 0.2, z: 0.52 },
        activationTimeMs: 80,
        repolarizationTimeMs: 210,
        mass: 0.18,
        sourceId: "atrialDepolarization"
      },
      {
        id: "right-atrium",
        label: "Right atrium",
        region: "right atrial muscle",
        role: "atria",
        position: { x: -0.28, y: 0.18, z: 0.42 },
        activationTimeMs: 96,
        repolarizationTimeMs: 235,
        mass: 0.34,
        sourceId: "atrialDepolarization"
      },
      {
        id: "left-atrium",
        label: "Left atrium",
        region: "left atrial muscle",
        role: "atria",
        position: { x: 0.28, y: 0.18, z: 0.42 },
        activationTimeMs: 126,
        repolarizationTimeMs: 260,
        mass: 0.38,
        sourceId: "atrialDepolarization"
      },
      {
        id: "av-node",
        label: "AV node",
        region: "AV junction",
        role: "av-delay",
        position: { x: -0.04, y: 0.18, z: 0.24 },
        activationTimeMs: 185,
        repolarizationTimeMs: 300,
        mass: 0.08,
        sourceId: "atrialDepolarization"
      },
      {
        id: "his-bundle",
        label: "His bundle",
        region: "central conduction system",
        role: "his-purkinje",
        position: { x: 0.0, y: 0.18, z: 0.1 },
        activationTimeMs: 288,
        repolarizationTimeMs: 360,
        mass: 0.06,
        sourceId: "septalDepolarization"
      },
      {
        id: "septum-left-to-right",
        label: "Septum",
        region: "interventricular septum",
        role: "septum",
        position: { x: -0.05, y: 0.17, z: -0.02 },
        activationTimeMs: 306,
        repolarizationTimeMs: 590,
        mass: 0.42,
        sourceId: "septalDepolarization"
      },
      {
        id: "apex",
        label: "Apical ventricles",
        region: "apical ventricular muscle",
        role: "ventricle",
        position: { x: 0.06, y: 0.14, z: -0.48 },
        activationTimeMs: 322,
        repolarizationTimeMs: 540,
        mass: 0.84,
        sourceId: "ventricularDepolarization"
      },
      {
        id: "right-ventricle",
        label: "Right ventricle",
        region: "right ventricular free wall",
        role: "ventricle",
        position: { x: -0.26, y: 0.15, z: -0.2 },
        activationTimeMs: 336,
        repolarizationTimeMs: 560,
        mass: 0.58,
        sourceId: "ventricularDepolarization"
      },
      {
        id: "left-ventricle",
        label: "Left ventricle",
        region: "left ventricular free wall",
        role: "ventricle",
        position: { x: 0.28, y: 0.15, z: -0.24 },
        activationTimeMs: 348,
        repolarizationTimeMs: 610,
        mass: 1.15,
        sourceId: "ventricularDepolarization"
      },
      {
        id: "basal-ventricles",
        label: "Basal ventricles",
        region: "basal ventricular muscle",
        role: "base",
        position: { x: 0.18, y: 0.16, z: 0.04 },
        activationTimeMs: 366,
        repolarizationTimeMs: 645,
        mass: 0.62,
        sourceId: "terminalDepolarization"
      }
    ],
    edges: [
      { from: "sa-node", to: "right-atrium", label: "atrial spread" },
      { from: "right-atrium", to: "left-atrium", label: "interatrial spread" },
      { from: "right-atrium", to: "av-node", label: "AV junction input" },
      { from: "av-node", to: "his-bundle", label: "AV nodal delay" },
      { from: "his-bundle", to: "septum-left-to-right", label: "His-septal activation" },
      { from: "septum-left-to-right", to: "apex", label: "Purkinje-like apical activation" },
      { from: "apex", to: "right-ventricle", label: "right ventricular spread" },
      { from: "apex", to: "left-ventricle", label: "left ventricular spread" },
      { from: "left-ventricle", to: "basal-ventricles", label: "epicardial/base spread" }
    ]
  }
};
