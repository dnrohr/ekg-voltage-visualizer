import type {
  CardiacScenario,
  HeartSurfaceModel,
  HeartSurfaceRegion,
  HeartSurfaceRegionState,
  LeadName,
  TissueState,
  Vec3
} from "./types";

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

function smoothStep(edge0: number, edge1: number, value: number): number {
  if (edge0 === edge1) return value >= edge1 ? 1 : 0;
  const x = clamp01((value - edge0) / (edge1 - edge0));
  return x * x * (3 - 2 * x);
}

function regionVertices(center: Vec3, radiusX: number, radiusY: number, radiusZ: number): Vec3[] {
  return [
    { x: center.x - radiusX, y: center.y, z: center.z },
    { x: center.x, y: center.y + radiusY, z: center.z + radiusZ },
    { x: center.x + radiusX, y: center.y, z: center.z },
    { x: center.x, y: center.y - radiusY, z: center.z - radiusZ }
  ];
}

function region(
  id: string,
  label: string,
  chamber: HeartSurfaceRegion["chamber"],
  anatomicalRegion: string,
  activationNodeId: string,
  center: Vec3,
  sourceId: HeartSurfaceRegion["sourceId"],
  baseActivationTimeMs: number,
  baseRepolarizationTimeMs: number,
  bestSeenLeads: LeadName[],
  oppositeLeads: LeadName[],
  scale: Vec3 = { x: 0.08, y: 0.05, z: 0.07 }
): HeartSurfaceRegion {
  return {
    id,
    label,
    chamber,
    anatomicalRegion,
    activationNodeId,
    center,
    vertices: regionVertices(center, scale.x, scale.y, scale.z),
    sourceId,
    baseActivationTimeMs,
    baseRepolarizationTimeMs,
    bestSeenLeads,
    oppositeLeads
  };
}

export const educationalHeartSurface: HeartSurfaceModel = {
  id: "educational-heart-surface-v2",
  label: "Educational segmented heart surface",
  regions: [
    region(
      "ra-high-lateral",
      "High right atrium",
      "RA",
      "SA node and high right atrial wall",
      "sa-node",
      { x: -0.38, y: 0.2, z: 0.5 },
      "atrialDepolarization",
      80,
      210,
      ["II", "aVF", "V1"],
      ["aVR"]
    ),
    region(
      "ra-free-wall",
      "Right atrial free wall",
      "RA",
      "right atrial muscle",
      "right-atrium",
      { x: -0.28, y: 0.18, z: 0.38 },
      "atrialDepolarization",
      96,
      235,
      ["II", "III", "aVF"],
      ["aVR"]
    ),
    region(
      "la-lateral",
      "Left atrial lateral wall",
      "LA",
      "left atrial muscle",
      "left-atrium",
      { x: 0.3, y: 0.18, z: 0.38 },
      "atrialDepolarization",
      126,
      260,
      ["I", "II", "V5"],
      ["aVR"]
    ),
    region(
      "av-junction",
      "AV junction",
      "RA",
      "AV node and central fibrous body",
      "av-node",
      { x: -0.04, y: 0.18, z: 0.22 },
      "atrialDepolarization",
      185,
      300,
      ["II"],
      ["aVR"],
      { x: 0.05, y: 0.04, z: 0.05 }
    ),
    region(
      "septal-right-facing",
      "Right-facing septum",
      "RV",
      "early interventricular septum",
      "septum-left-to-right",
      { x: -0.06, y: 0.17, z: -0.02 },
      "septalDepolarization",
      306,
      590,
      ["V1", "V2"],
      ["V5", "V6"],
      { x: 0.06, y: 0.04, z: 0.09 }
    ),
    region(
      "apical-ventricles",
      "Apical ventricles",
      "LV",
      "apical ventricular myocardium",
      "apex",
      { x: 0.05, y: 0.14, z: -0.48 },
      "ventricularDepolarization",
      322,
      540,
      ["II", "III", "aVF", "V4"],
      ["aVR"],
      { x: 0.1, y: 0.05, z: 0.08 }
    ),
    region(
      "rv-free-wall",
      "Right ventricular free wall",
      "RV",
      "right anterior ventricular wall",
      "right-ventricle",
      { x: -0.28, y: 0.15, z: -0.2 },
      "ventricularDepolarization",
      336,
      560,
      ["V1", "V2", "III"],
      ["I", "V6"],
      { x: 0.09, y: 0.05, z: 0.1 }
    ),
    region(
      "lv-anterior",
      "Left ventricular anterior wall",
      "LV",
      "anterior left ventricular wall",
      "left-ventricle",
      { x: 0.18, y: 0.1, z: -0.18 },
      "ventricularDepolarization",
      342,
      595,
      ["V3", "V4"],
      ["aVR", "V1"],
      { x: 0.09, y: 0.05, z: 0.1 }
    ),
    region(
      "lv-lateral",
      "Left ventricular lateral wall",
      "LV",
      "lateral left ventricular wall",
      "left-ventricle",
      { x: 0.32, y: 0.15, z: -0.24 },
      "ventricularDepolarization",
      348,
      610,
      ["I", "aVL", "V5", "V6"],
      ["aVR", "V1"],
      { x: 0.1, y: 0.05, z: 0.1 }
    ),
    region(
      "basal-lv-rv",
      "Basal ventricular ring",
      "LV",
      "late basal ventricular myocardium",
      "basal-ventricles",
      { x: 0.16, y: 0.16, z: 0.04 },
      "terminalDepolarization",
      366,
      645,
      ["I", "aVL", "V6"],
      ["III", "aVR"],
      { x: 0.12, y: 0.05, z: 0.08 }
    )
  ]
};

function stateAtTime(
  timeMs: number,
  activationTimeMs: number,
  repolarizationTimeMs: number,
  depolarizationDurationMs: number,
  repolarizationDurationMs: number
): TissueState {
  const activationEnd = activationTimeMs + depolarizationDurationMs;
  const repolarizationEnd = repolarizationTimeMs + repolarizationDurationMs;

  if (timeMs >= activationTimeMs && timeMs < activationEnd) return "depolarizing";
  if (timeMs >= activationEnd && timeMs < repolarizationTimeMs) return "active";
  if (timeMs >= repolarizationTimeMs && timeMs < repolarizationEnd) return "repolarizing";
  if (timeMs >= repolarizationEnd) return "recovered";
  return "resting";
}

export function evaluateHeartSurface(
  scenario: CardiacScenario,
  timeMs: number,
  surface: HeartSurfaceModel = educationalHeartSurface
): HeartSurfaceRegionState[] {
  const nodesById = new Map(scenario.activationModel.nodes.map((node) => [node.id, node]));

  return surface.regions.map((surfaceRegion) => {
    const node = nodesById.get(surfaceRegion.activationNodeId);
    const activationTimeMs = node?.activationTimeMs ?? surfaceRegion.baseActivationTimeMs;
    const repolarizationTimeMs = node?.repolarizationTimeMs ?? surfaceRegion.baseRepolarizationTimeMs;
    const activationEnd = activationTimeMs + scenario.activationModel.depolarizationDurationMs;
    const repolarizationEnd = repolarizationTimeMs + scenario.activationModel.repolarizationDurationMs;

    return {
      ...surfaceRegion,
      activationTimeMs,
      repolarizationTimeMs,
      state: stateAtTime(
        timeMs,
        activationTimeMs,
        repolarizationTimeMs,
        scenario.activationModel.depolarizationDurationMs,
        scenario.activationModel.repolarizationDurationMs
      ),
      activationProgress: smoothStep(activationTimeMs, activationEnd, timeMs),
      repolarizationProgress: smoothStep(repolarizationTimeMs, repolarizationEnd, timeMs)
    };
  });
}

export function getSurfaceRegionById(
  id: string,
  surface: HeartSurfaceModel = educationalHeartSurface
): HeartSurfaceRegion | undefined {
  return surface.regions.find((region) => region.id === id);
}
