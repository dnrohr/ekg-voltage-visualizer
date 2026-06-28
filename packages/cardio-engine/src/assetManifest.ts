import type { AnatomicalAssetFormat, AnatomicalAssetManifest, AssetManifestIssue, HeartChamber } from "./types";

const acceptedOriginalFormats = new Set<AnatomicalAssetFormat>(["glb", "gltf", "obj"]);
const requiredChambers: HeartChamber[] = ["RA", "LA", "RV", "LV"];
const knownRedistributableLicenseSignals = [
  "creative commons",
  "cc0",
  "cc by",
  "cc-by",
  "mit",
  "apache",
  "bsd"
];

function isNonEmptyText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function addMissingTextIssue(issues: AssetManifestIssue[], manifest: AnatomicalAssetManifest, field: string, value: unknown) {
  if (!isNonEmptyText(value)) {
    issues.push({ severity: "error", field, message: "Required manifest text is missing." });
    return;
  }

  if (field.includes("url") && !/^https?:\/\//i.test(value)) {
    issues.push({ severity: "error", field, message: "URL fields must use an http(s) URL." });
  }

  if (field === "license.name" && manifest.license.allowsRedistribution) {
    const normalizedLicense = value.toLowerCase();
    if (!knownRedistributableLicenseSignals.some((signal) => normalizedLicense.includes(signal))) {
      issues.push({
        severity: "warning",
        field,
        message: "Redistribution is marked allowed, but the license name is not one of the recognized open-license signals."
      });
    }
  }
}

export function validateAnatomicalAssetManifest(manifest: AnatomicalAssetManifest): AssetManifestIssue[] {
  const issues: AssetManifestIssue[] = [];

  addMissingTextIssue(issues, manifest, "id", manifest.id);
  addMissingTextIssue(issues, manifest, "label", manifest.label);
  if (manifest.assetType !== "heart-anatomy-mesh") {
    issues.push({ severity: "error", field: "assetType", message: "Only heart-anatomy-mesh assets are accepted for V3." });
  }
  if (!Number.isInteger(manifest.version) || manifest.version < 1) {
    issues.push({ severity: "error", field: "version", message: "Manifest version must be a positive integer." });
  }

  addMissingTextIssue(issues, manifest, "source.url", manifest.source.url);
  addMissingTextIssue(issues, manifest, "source.title", manifest.source.title);
  addMissingTextIssue(issues, manifest, "source.author", manifest.source.author);
  addMissingTextIssue(issues, manifest, "source.retrievedAt", manifest.source.retrievedAt);

  addMissingTextIssue(issues, manifest, "license.name", manifest.license.name);
  addMissingTextIssue(issues, manifest, "license.url", manifest.license.url);
  if (manifest.license.attributionRequired) {
    addMissingTextIssue(issues, manifest, "license.attributionText", manifest.license.attributionText);
  }
  if (!manifest.license.allowsRedistribution && manifest.redistribution.bundledInRepository) {
    issues.push({
      severity: "error",
      field: "redistribution.bundledInRepository",
      message: "Assets that disallow redistribution must not be bundled in the repository."
    });
  }
  if (!manifest.license.allowsCommercialUse) {
    issues.push({
      severity: "warning",
      field: "license.allowsCommercialUse",
      message: "Non-commercial assets may limit deployment options and need explicit product approval."
    });
  }

  if (!acceptedOriginalFormats.has(manifest.files.originalFormat)) {
    issues.push({ severity: "error", field: "files.originalFormat", message: "Original mesh format must be glb, gltf, or obj." });
  }
  if (manifest.files.optimizedFormat !== "glb") {
    issues.push({ severity: "error", field: "files.optimizedFormat", message: "Optimized runtime mesh must be GLB." });
  }
  addMissingTextIssue(issues, manifest, "files.optimizedPath", manifest.files.optimizedPath);

  if (manifest.geometry.vertexCount <= 0) {
    issues.push({ severity: "error", field: "geometry.vertexCount", message: "Vertex count must be positive." });
  }
  if (manifest.geometry.faceCount <= 0) {
    issues.push({ severity: "error", field: "geometry.faceCount", message: "Face count must be positive." });
  }
  if (manifest.geometry.vertexCount > manifest.optimization.targetMaxVertices) {
    issues.push({
      severity: "warning",
      field: "geometry.vertexCount",
      message: "Vertex count exceeds the documented web optimization target."
    });
  }
  if (!manifest.geometry.hasNormals) {
    issues.push({ severity: "error", field: "geometry.hasNormals", message: "Heart meshes must include normals for anatomical lighting." });
  }
  if (manifest.geometry.scaleUnit !== "normalized" && manifest.geometry.maxDimensionMeters === undefined) {
    issues.push({
      severity: "error",
      field: "geometry.maxDimensionMeters",
      message: "Physical-unit assets must document their maximum dimension in meters."
    });
  }

  for (const chamber of requiredChambers) {
    if (!manifest.segmentation.chambers.includes(chamber)) {
      issues.push({ severity: "error", field: "segmentation.chambers", message: `Missing required chamber label ${chamber}.` });
    }
  }
  if (manifest.segmentation.regionIds.length === 0) {
    issues.push({ severity: "error", field: "segmentation.regionIds", message: "At least one anatomical region id is required." });
  }
  if (!manifest.segmentation.hasSeptum) {
    issues.push({ severity: "warning", field: "segmentation.hasSeptum", message: "A missing septum limits chamber/cutaway teaching value." });
  }

  if (manifest.modifications.length === 0) {
    issues.push({ severity: "warning", field: "modifications", message: "Record at least one modification note, even if the mesh is unmodified." });
  }
  if (manifest.optimization.targetMaxVertices > 100000) {
    issues.push({
      severity: "warning",
      field: "optimization.targetMaxVertices",
      message: "The target vertex count is high for the web viewer; document the performance rationale."
    });
  }
  if (manifest.optimization.targetMaxTextureSize > 2048) {
    issues.push({
      severity: "warning",
      field: "optimization.targetMaxTextureSize",
      message: "Texture target is above the V3 web-delivery recommendation."
    });
  }
  if (!isNonEmptyText(manifest.redistribution.notes)) {
    issues.push({ severity: "error", field: "redistribution.notes", message: "Redistribution constraints must be documented." });
  }
  if (!isNonEmptyText(manifest.educationalUseNotes)) {
    issues.push({ severity: "error", field: "educationalUseNotes", message: "Educational use boundaries must be documented." });
  }

  return issues;
}

export function hasBlockingAssetManifestIssues(issues: AssetManifestIssue[]): boolean {
  return issues.some((issue) => issue.severity === "error");
}
