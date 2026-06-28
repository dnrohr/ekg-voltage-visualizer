import type {
  CardiacScenario,
  HeartMeshFace,
  HeartMeshField,
  HeartMeshSegment,
  HeartMeshVertexField,
  HeartSurfaceModel,
  HeartSurfaceRegionState,
  Vec3
} from "./types";
import { educationalHeartSurface, evaluateHeartSurface } from "./surface";

function normalizeVector(vector: Vec3): Vec3 {
  const length = Math.hypot(vector.x, vector.y, vector.z);
  if (length < 0.0001) return { x: 0, y: 1, z: 0 };
  return {
    x: vector.x / length,
    y: vector.y / length,
    z: vector.z / length
  };
}

function vertexField(
  region: HeartSurfaceRegionState,
  id: string,
  position: Vec3,
  timeMs: number
): HeartMeshVertexField {
  return {
    id,
    regionId: region.id,
    chamber: region.chamber,
    anatomicalRegion: region.anatomicalRegion,
    position,
    normal: normalizeVector(position),
    activationTimeMs: region.activationTimeMs,
    repolarizationTimeMs: region.repolarizationTimeMs,
    state: region.state,
    activationProgress: region.activationProgress,
    repolarizationProgress: region.repolarizationProgress,
    phiActivationMs: timeMs - region.activationTimeMs,
    phiRepolarizationMs: timeMs - region.repolarizationTimeMs,
    bestSeenLeads: region.bestSeenLeads,
    oppositeLeads: region.oppositeLeads
  };
}

export function buildHeartMeshField(
  scenario: CardiacScenario,
  timeMs: number,
  surface: HeartSurfaceModel = educationalHeartSurface
): HeartMeshField {
  const regions = evaluateHeartSurface(scenario, timeMs, surface);
  const vertices: HeartMeshVertexField[] = [];
  const faces: HeartMeshFace[] = [];
  const segments: HeartMeshSegment[] = [];

  for (const region of regions) {
    const centerId = `${region.id}:center`;
    const regionVertexIds = [centerId];
    const regionFaceIds: string[] = [];

    vertices.push(vertexField(region, centerId, region.center, timeMs));

    region.vertices.forEach((position, index) => {
      const vertexId = `${region.id}:v${index}`;
      regionVertexIds.push(vertexId);
      vertices.push(vertexField(region, vertexId, position, timeMs));
    });

    for (let index = 0; index < region.vertices.length; index += 1) {
      const nextIndex = index === region.vertices.length - 1 ? 0 : index + 1;
      const faceId = `${region.id}:f${index}`;
      regionFaceIds.push(faceId);
      faces.push({
        id: faceId,
        regionId: region.id,
        chamber: region.chamber,
        vertexIds: [centerId, `${region.id}:v${index}`, `${region.id}:v${nextIndex}`]
      });
    }

    segments.push({
      id: region.id,
      label: region.label,
      chamber: region.chamber,
      anatomicalRegion: region.anatomicalRegion,
      vertexIds: regionVertexIds,
      faceIds: regionFaceIds,
      activationTimeMs: region.activationTimeMs,
      repolarizationTimeMs: region.repolarizationTimeMs
    });
  }

  return {
    id: `${surface.id}:mesh-field`,
    label: `${surface.label} mesh field`,
    sourceSurfaceId: surface.id,
    timeMs,
    vertices,
    faces,
    segments
  };
}
