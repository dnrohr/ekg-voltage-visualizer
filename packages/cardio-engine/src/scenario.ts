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
  }
};
