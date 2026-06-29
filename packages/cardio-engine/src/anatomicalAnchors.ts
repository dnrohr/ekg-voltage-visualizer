import nihAnchors from "../../../references/nih-heart-normal-female/anchors.v1.json";
import type {
  AnatomicalAnchor,
  AnatomicalAnchorConfidence,
  AnatomicalAnchorKind,
  AnatomicalAnchorSet,
  AnatomicalCoordinateNormalization,
  NormalizedAnatomicalAnchor,
  Vec3
} from "./types";
import { educationalHeartSurface } from "./surface";

const anchorKinds = new Set<AnatomicalAnchorKind>([
  "apex",
  "base",
  "septum",
  "ventricular-wall",
  "atrial-reference",
  "great-vessel-reference",
  "orientation-reference"
]);

const confidenceLevels = new Set<AnatomicalAnchorConfidence>(["low", "medium", "high"]);

const isFiniteVec3 = (point: Vec3) =>
  Number.isFinite(point.x) && Number.isFinite(point.y) && Number.isFinite(point.z);

const boundsCenter = (normalization: AnatomicalCoordinateNormalization): Vec3 => ({
  x: (normalization.sourceBounds.min.x + normalization.sourceBounds.max.x) / 2,
  y: (normalization.sourceBounds.min.y + normalization.sourceBounds.max.y) / 2,
  z: (normalization.sourceBounds.min.z + normalization.sourceBounds.max.z) / 2
});

const boundsMaxDimension = (normalization: AnatomicalCoordinateNormalization) =>
  Math.max(
    normalization.sourceBounds.max.x - normalization.sourceBounds.min.x,
    normalization.sourceBounds.max.y - normalization.sourceBounds.min.y,
    normalization.sourceBounds.max.z - normalization.sourceBounds.min.z,
    0.0001
  );

export function normalizeAnatomicalPoint(point: Vec3, normalization: AnatomicalCoordinateNormalization): Vec3 {
  const center = boundsCenter(normalization);
  const scale = normalization.normalizedMaxDimension / boundsMaxDimension(normalization);

  return {
    x: (point.x - center.x) * scale + normalization.sceneOffset.x,
    y: (point.y - center.y) * scale + normalization.sceneOffset.y,
    z: (point.z - center.z) * scale + normalization.sceneOffset.z
  };
}

export function normalizeAnatomicalAnchors(anchorSet: AnatomicalAnchorSet): NormalizedAnatomicalAnchor[] {
  return anchorSet.anchors.map((anchor) => ({
    ...anchor,
    scenePosition: normalizeAnatomicalPoint(anchor.sourcePosition, anchorSet.coordinateNormalization)
  }));
}

export function validateAnatomicalAnchorSet(anchorSet: AnatomicalAnchorSet): string[] {
  const issues: string[] = [];
  const knownRegionIds = new Set(educationalHeartSurface.regions.map((region) => region.id));
  const seenAnchorIds = new Set<string>();

  if (!anchorSet.id) issues.push("Anchor set id is required.");
  if (!anchorSet.assetId) issues.push("Anchor set asset id is required.");
  if (anchorSet.version <= 0) issues.push("Anchor set version must be positive.");
  if (anchorSet.assetId !== anchorSet.coordinateNormalization.assetId) {
    issues.push("Anchor set asset id must match coordinate normalization asset id.");
  }
  if (!isFiniteVec3(anchorSet.coordinateNormalization.sourceBounds.min)) {
    issues.push("Coordinate normalization sourceBounds.min must be finite.");
  }
  if (!isFiniteVec3(anchorSet.coordinateNormalization.sourceBounds.max)) {
    issues.push("Coordinate normalization sourceBounds.max must be finite.");
  }
  if (!isFiniteVec3(anchorSet.coordinateNormalization.sceneOffset)) {
    issues.push("Coordinate normalization sceneOffset must be finite.");
  }
  if (anchorSet.coordinateNormalization.normalizedMaxDimension <= 0) {
    issues.push("Coordinate normalization normalizedMaxDimension must be positive.");
  }
  if (!anchorSet.educationalUseNotes) issues.push("Educational use notes are required.");

  for (const anchor of anchorSet.anchors) {
    if (seenAnchorIds.has(anchor.id)) issues.push(`Duplicate anchor id: ${anchor.id}.`);
    seenAnchorIds.add(anchor.id);
    if (!anchor.id) issues.push("Anchor id is required.");
    if (!anchor.label) issues.push(`Anchor ${anchor.id} label is required.`);
    if (!anchorKinds.has(anchor.kind)) issues.push(`Anchor ${anchor.id} has unsupported kind.`);
    if (!confidenceLevels.has(anchor.confidence)) issues.push(`Anchor ${anchor.id} has unsupported confidence.`);
    if (!isFiniteVec3(anchor.sourcePosition)) issues.push(`Anchor ${anchor.id} sourcePosition must be finite.`);
    if (anchor.educationalRegionIds.length === 0) issues.push(`Anchor ${anchor.id} needs at least one educational region id.`);
    for (const regionId of anchor.educationalRegionIds) {
      if (!knownRegionIds.has(regionId)) issues.push(`Anchor ${anchor.id} references unknown educational region ${regionId}.`);
    }
    if (!anchor.approximationNote) issues.push(`Anchor ${anchor.id} approximation note is required.`);
  }

  return issues;
}

export const nihAnatomicalAnchorSet = nihAnchors as AnatomicalAnchorSet;
export const normalizedNihAnatomicalAnchors = normalizeAnatomicalAnchors(nihAnatomicalAnchorSet);
