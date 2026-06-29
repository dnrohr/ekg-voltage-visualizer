import React from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  classifyRegionLeadContribution,
  electrodeDefinitions,
  electrodeOrder,
  leadDefinitions,
  normalizedNihAnatomicalAnchors,
  type ElectrodeName,
  type HeartChamber,
  type HeartMeshField,
  type HeartMeshSegment,
  type IsochroneScope,
  type LeadContributionClass,
  type LeadName,
  type SimulationState,
  type TissueState,
  type Vec3
} from "@ekg/cardio-engine";

export type CameraPreset = "frontal" | "transverse" | "left-lateral" | "heart-close";
export type SurfaceMapMode = "wavefront" | "electrical-state";
export type AnatomyViewMode = "external" | "cutaway" | "chambers";
export type AnatomicalOverlayMode = "procedural" | "anatomical" | "hybrid";

type TorsoScene3DProps = {
  state: SimulationState;
  selectedLead: LeadName;
  selectedRegionId?: string;
  onSelectRegion?: (regionId: string) => void;
  layers?: Partial<TorsoScene3DLayers>;
  anatomicalPreview?: Partial<AnatomicalPreviewSettings>;
  cameraPreset?: CameraPreset;
  anatomyViewMode?: AnatomyViewMode;
  surfaceMapMode?: SurfaceMapMode;
  anatomicalOverlayMode?: AnatomicalOverlayMode;
  isochroneScope?: IsochroneScope;
  highContrast?: boolean;
  reducedMotion?: boolean;
  onCameraPresetChange?: (preset: CameraPreset) => void;
  onAnatomyViewModeChange?: (mode: AnatomyViewMode) => void;
  onSurfaceMapModeChange?: (mode: SurfaceMapMode) => void;
  onAnatomicalOverlayModeChange?: (mode: AnatomicalOverlayMode) => void;
  onIsochroneScopeChange?: (scope: IsochroneScope) => void;
};

export type AnatomicalPreviewSettings = {
  visible: boolean;
  opacity: number;
};

export type TorsoScene3DLayers = {
  wavefront: boolean;
  contours: boolean;
  stateMap: boolean;
  vector: boolean;
  leadProjection: boolean;
  leadContribution: boolean;
  contraction: boolean;
  chamberVolume: boolean;
  valveState: boolean;
  flow: boolean;
  phaseLabels: boolean;
  anatomicalMarkers: boolean;
};

const defaultLayers: TorsoScene3DLayers = {
  wavefront: true,
  contours: true,
  stateMap: false,
  vector: true,
  leadProjection: true,
  leadContribution: true,
  contraction: true,
  chamberVolume: false,
  valveState: true,
  flow: true,
  phaseLabels: true,
  anatomicalMarkers: true
};

const tissueColors: Record<TissueState, number> = {
  resting: 0xffffff,
  depolarizing: 0xf59e0b,
  active: 0xef4444,
  repolarizing: 0x3b82f6,
  recovered: 0x5eead4
};

const surfaceStateColors: Record<TissueState, number> = {
  resting: 0xe5e7eb,
  depolarizing: 0xf59e0b,
  active: 0xdc2626,
  repolarizing: 0x2563eb,
  recovered: 0x14b8a6
};

const surfaceMapModes: Record<SurfaceMapMode, string> = {
  wavefront: "Activation wave",
  "electrical-state": "Electrical state"
};

const anatomicalOverlayModes: Record<AnatomicalOverlayMode, string> = {
  procedural: "Procedural",
  anatomical: "Anatomical",
  hybrid: "Hybrid"
};

const anatomyViewModes: Record<AnatomyViewMode, string> = {
  external: "External",
  cutaway: "Cutaway",
  chambers: "Chambers"
};

const wavefrontBandWidthMs = 18;
const repolarizationBandWidthMs = 26;
export const nihAnatomicalPreviewAssetId = "nih-3d-3dpx-002636-whole-heart-optimized-v1";
export const nihAnatomicalPreviewPath = "/assets/nih-heart/ALM0006_Whole_NIH3D.optimized.glb";
const defaultAnatomicalPreview: AnatomicalPreviewSettings = {
  visible: true,
  opacity: 0.68
};

function scenePixelRatioCap(width: number, reducedMotion: boolean) {
  if (reducedMotion) return 1;
  if (width < 640) return 1;
  if (width < 900) return 1.5;
  return 2;
}

const chamberSurfaceColors: Record<HeartChamber, number> = {
  RA: 0x6bc4bb,
  LA: 0xee9f93,
  RV: 0x2f9b8f,
  LV: 0xdc6f63
};

const isochroneScopes: Record<IsochroneScope, string> = {
  "whole-heart": "Whole",
  atria: "Atria",
  ventricles: "Ventricles"
};

const leadContributionLabels: Record<LeadContributionClass, string> = {
  aligned: "aligned",
  opposed: "opposed",
  weak: "weak"
};

const anchorConfidenceColors = {
  low: 0xf59e0b,
  medium: 0x0f766e,
  high: 0x2563eb
} as const;

const cameraPresets: Record<CameraPreset, { label: string; position: THREE.Vector3; target: THREE.Vector3 }> = {
  frontal: {
    label: "Frontal",
    position: new THREE.Vector3(0, 0.16, 4.4),
    target: new THREE.Vector3(0, 0.06, 0.08)
  },
  transverse: {
    label: "Transverse",
    position: new THREE.Vector3(0, 3.9, 0.15),
    target: new THREE.Vector3(0, 0.04, 0.08)
  },
  "left-lateral": {
    label: "Left lateral",
    position: new THREE.Vector3(4.0, 0.24, 0.2),
    target: new THREE.Vector3(0.05, 0.02, 0.05)
  },
  "heart-close": {
    label: "Heart close-up",
    position: new THREE.Vector3(0.8, 0.36, 1.7),
    target: new THREE.Vector3(0.05, 0.0, 0.12)
  }
};

const toScene = (point: Vec3) => new THREE.Vector3(point.x, point.z, point.y);
const externalMeshOffset = new THREE.Vector3(0, 0, 0.26);
const surfacePatchOffset = new THREE.Vector3(0, 0, 0.31);
const surfacePatchScale = 2.05;

const chamberCueDefinitions = [
  { chamber: "RA", label: "RA", position: new THREE.Vector3(-0.2, 0.34, 0.14), scale: new THREE.Vector3(0.12, 0.11, 0.11), color: 0x2563eb },
  { chamber: "LA", label: "LA", position: new THREE.Vector3(0.22, 0.34, 0.12), scale: new THREE.Vector3(0.13, 0.11, 0.11), color: 0xdc2626 },
  { chamber: "RV", label: "RV", position: new THREE.Vector3(-0.15, -0.08, 0.2), scale: new THREE.Vector3(0.15, 0.28, 0.13), color: 0x2563eb },
  { chamber: "LV", label: "LV", position: new THREE.Vector3(0.18, -0.11, 0.18), scale: new THREE.Vector3(0.18, 0.32, 0.15), color: 0xdc2626 }
] as const;

function terminalCenter(weights: Partial<Record<ElectrodeName, number>>) {
  let totalWeight = 0;
  const center = new THREE.Vector3();

  for (const [name, weight] of Object.entries(weights)) {
    if (!weight) continue;
    center.addScaledVector(toScene(electrodeDefinitions[name as ElectrodeName].position), weight);
    totalWeight += weight;
  }

  return totalWeight === 0 ? center : center.divideScalar(totalWeight);
}

function createLabelTexture(text: string, background: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 64;
  const context = canvas.getContext("2d");

  if (context) {
    context.fillStyle = background;
    context.strokeStyle = "rgba(30, 41, 59, 0.42)";
    context.lineWidth = 3;
    context.beginPath();
    context.roundRect(12, 12, 104, 40, 10);
    context.fill();
    context.stroke();
    context.fillStyle = "#17202a";
    context.font = "700 24px Inter, Arial, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(text, 64, 32);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeChamber(
  name: string,
  color: number,
  position: THREE.Vector3,
  scale: THREE.Vector3,
  rotationZ = 0
) {
  const geometry = new THREE.SphereGeometry(1, 32, 24);
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.62,
    metalness: 0.02,
    transparent: true,
    opacity: 0.24
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = name;
  mesh.position.copy(position);
  mesh.scale.copy(scale);
  mesh.userData.baseScale = scale.clone();
  mesh.rotation.z = rotationZ;
  return mesh;
}

function prepareAnatomicalPreview(root: THREE.Object3D, opacity: number) {
  let meshCount = 0;
  root.name = "nih anatomical heart preview";
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    meshCount += 1;
    if (!child.geometry.getAttribute("normal")) {
      child.geometry.computeVertexNormals();
    }
    child.material = new THREE.MeshStandardMaterial({
      color: 0xc24135,
      emissive: 0x4a120f,
      emissiveIntensity: 0.12,
      roughness: 0.64,
      metalness: 0.02,
      transparent: true,
      opacity,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    child.renderOrder = 6;
  });

  const box = new THREE.Box3().setFromObject(root);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxDimension = Math.max(size.x, size.y, size.z, 0.0001);
  const scale = 1.08 / maxDimension;
  root.scale.setScalar(scale);
  root.position.copy(center).multiplyScalar(-scale).add(new THREE.Vector3(0.28, 0.02, 0.52));
  root.rotation.set(0, 0, 0);
  root.userData.previewDebug = {
    meshCount,
    sourceCenter: center.toArray(),
    sourceSize: size.toArray(),
    maxDimension,
    scale,
    position: root.position.toArray()
  };
}

function applyAnatomicalPreviewState(root: THREE.Object3D, settings: AnatomicalPreviewSettings) {
  root.visible = settings.visible;
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const material = child.material;
    const materials = Array.isArray(material) ? material : [material];
    materials.forEach((item) => {
      item.transparent = true;
      item.opacity = settings.opacity;
      item.depthWrite = false;
      item.needsUpdate = true;
    });
  });
}

function surfaceRegionColor(stateName: TissueState, mode: SurfaceMapMode): number {
  if (mode === "electrical-state") {
    return surfaceStateColors[stateName];
  }

  if (stateName === "depolarizing") return 0xf59e0b;
  if (stateName === "active") return 0xfca5a5;
  if (stateName === "repolarizing") return 0x93c5fd;
  if (stateName === "recovered") return 0x99f6e4;
  return 0xf8fafc;
}

function contourColor(relativeTimeMs: number): number {
  if (relativeTimeMs < 0) return 0x64748b;
  if (relativeTimeMs < 40) return 0xf59e0b;
  if (relativeTimeMs < 80) return 0xdc2626;
  return 0x7c3aed;
}

function leadContributionColor(classification: LeadContributionClass): number {
  if (classification === "aligned") return 0x16a34a;
  if (classification === "opposed") return 0xdc2626;
  return 0x64748b;
}

function externalMeshColor(chamber: HeartChamber, stateName: TissueState, isSelected: boolean, mode: SurfaceMapMode): number {
  if (isSelected) return 0x0f766e;
  if (mode === "electrical-state" || stateName === "depolarizing" || stateName === "repolarizing") {
    return surfaceRegionColor(stateName, mode);
  }

  return chamberSurfaceColors[chamber];
}

function colorUniform(color: number) {
  return new THREE.Color(color);
}

function makeExternalMeshFallbackMaterial(
  chamber: HeartChamber,
  stateName: TissueState,
  isSelected: boolean,
  isCurrentWave: boolean,
  mode: SurfaceMapMode,
  surfaceOpacity: number,
  highContrast: boolean
) {
  const color = highContrast && isSelected ? 0x000000 : externalMeshColor(chamber, stateName, isSelected, mode);
  return new THREE.MeshStandardMaterial({
    color,
    emissive: isCurrentWave || isSelected ? color : 0x000000,
    emissiveIntensity: highContrast && (isSelected || isCurrentWave) ? 0.52 : isSelected ? 0.38 : isCurrentWave ? 0.24 : 0.04,
    roughness: 0.42,
    metalness: 0.03,
    transparent: true,
    opacity: isSelected ? Math.max(0.92, surfaceOpacity) : mode === "wavefront" && stateName === "resting" ? Math.min(0.72, surfaceOpacity) : surfaceOpacity,
    side: THREE.DoubleSide
  });
}

function makeWavefrontShaderMaterial(
  chamber: HeartChamber,
  isSelected: boolean,
  mode: SurfaceMapMode,
  renderer: THREE.WebGLRenderer,
  surfaceOpacity: number,
  highContrast: boolean,
  reducedMotion: boolean
) {
  if (!renderer.capabilities.precision) {
    return undefined;
  }

  return new THREE.ShaderMaterial({
    uniforms: {
      chamberColor: { value: colorUniform(chamberSurfaceColors[chamber]) },
      restingColor: { value: colorUniform(0xe5e7eb) },
      depolarizingColor: { value: colorUniform(0xf59e0b) },
      activeColor: { value: colorUniform(0xdc2626) },
      repolarizingColor: { value: colorUniform(0x2563eb) },
      recoveredColor: { value: colorUniform(0x14b8a6) },
      selectedColor: { value: colorUniform(highContrast ? 0x000000 : 0x0f766e) },
      wavefrontWidthMs: { value: highContrast ? wavefrontBandWidthMs + 8 : reducedMotion ? wavefrontBandWidthMs + 4 : wavefrontBandWidthMs },
      repolarizationWidthMs: { value: highContrast ? repolarizationBandWidthMs + 8 : reducedMotion ? repolarizationBandWidthMs + 4 : repolarizationBandWidthMs },
      electricalStateMode: { value: mode === "electrical-state" ? 1 : 0 },
      selected: { value: isSelected ? 1 : 0 },
      surfaceOpacity: { value: surfaceOpacity }
    },
    vertexShader: `
      attribute float phiActivationMs;
      attribute float phiRepolarizationMs;
      varying float vPhiActivationMs;
      varying float vPhiRepolarizationMs;
      varying vec3 vNormal;

      void main() {
        vPhiActivationMs = phiActivationMs;
        vPhiRepolarizationMs = phiRepolarizationMs;
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 chamberColor;
      uniform vec3 restingColor;
      uniform vec3 depolarizingColor;
      uniform vec3 activeColor;
      uniform vec3 repolarizingColor;
      uniform vec3 recoveredColor;
      uniform vec3 selectedColor;
      uniform float wavefrontWidthMs;
      uniform float repolarizationWidthMs;
      uniform float surfaceOpacity;
      uniform int electricalStateMode;
      uniform int selected;
      varying float vPhiActivationMs;
      varying float vPhiRepolarizationMs;
      varying vec3 vNormal;

      void main() {
        float activationBand = 1.0 - smoothstep(0.0, wavefrontWidthMs, abs(vPhiActivationMs));
        float recoveryBand = 1.0 - smoothstep(0.0, repolarizationWidthMs, abs(vPhiRepolarizationMs));
        float activeTissue = smoothstep(wavefrontWidthMs, wavefrontWidthMs + 12.0, vPhiActivationMs) * (1.0 - smoothstep(-repolarizationWidthMs, 0.0, vPhiRepolarizationMs));
        float recoveredTissue = smoothstep(repolarizationWidthMs, repolarizationWidthMs + 24.0, vPhiRepolarizationMs);
        float preActivation = 1.0 - smoothstep(-wavefrontWidthMs - 24.0, -wavefrontWidthMs, vPhiActivationMs);
        vec3 baseColor = electricalStateMode == 1 ? mix(chamberColor, restingColor, preActivation * 0.75) : chamberColor;
        baseColor = mix(baseColor, activeColor, activeTissue * (electricalStateMode == 1 ? 0.85 : 0.34));
        baseColor = mix(baseColor, recoveredColor, recoveredTissue * (electricalStateMode == 1 ? 0.72 : 0.22));
        baseColor = mix(baseColor, repolarizingColor, recoveryBand);
        baseColor = mix(baseColor, depolarizingColor, activationBand);
        baseColor = selected == 1 ? mix(baseColor, selectedColor, 0.76) : baseColor;
        float light = 0.58 + 0.42 * max(dot(normalize(vNormal), normalize(vec3(0.45, 0.72, 0.54))), 0.0);
        float waveGlow = max(activationBand, recoveryBand) * 0.28;
        gl_FragColor = vec4(baseColor * light + waveGlow, selected == 1 ? max(0.94, surfaceOpacity) : surfaceOpacity);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide
  });
}

function externalMeshPoint(point: Vec3, normal: Vec3, chamber: HeartChamber, center?: Vec3) {
  const base = toScene(point);
  const sceneNormal = toScene(normal).normalize();
  const anteriorLift = chamber === "RA" || chamber === "LA" ? 0.09 : 0.14;
  const lifted = new THREE.Vector3(base.x * 1.12, base.y * 1.04, base.z)
    .add(externalMeshOffset)
    .addScaledVector(sceneNormal, 0.065)
    .add(new THREE.Vector3(0, 0, anteriorLift));

  if (!center) return lifted;

  const centerBase = toScene(center);
  const centerLifted = new THREE.Vector3(centerBase.x * 1.12, centerBase.y * 1.04, centerBase.z)
    .add(externalMeshOffset)
    .addScaledVector(toScene(center).normalize(), 0.065)
    .add(new THREE.Vector3(0, 0, anteriorLift));
  const offset = lifted.clone().sub(centerLifted);
  return new THREE.Vector3(
    centerLifted.x + offset.x * 2.45,
    centerLifted.y + offset.y * 2.2,
    centerLifted.z + offset.z * 0.38 + (vertexDepthBias(chamber, point) * 0.025)
  );
}

function vertexDepthBias(chamber: HeartChamber, point: Vec3) {
  const ventricularBias = chamber === "LV" || chamber === "RV" ? 1.2 : 0.6;
  return ventricularBias + Math.max(0, -point.z) * 0.7;
}

function makeExternalMeshGeometry(field: HeartMeshField, segment: HeartMeshSegment) {
  const verticesById = new Map(field.vertices.map((vertex) => [vertex.id, vertex]));
  const centerVertex = verticesById.get(`${segment.id}:center`);
  const positions: number[] = [];
  const normals: number[] = [];
  const activationPhiValues: number[] = [];
  const repolarizationPhiValues: number[] = [];
  const activationTimeValues: number[] = [];
  const repolarizationTimeValues: number[] = [];
  const indices: number[] = [];
  const indexByVertexId = new Map<string, number>();

  for (const vertexId of segment.vertexIds) {
    const vertex = verticesById.get(vertexId);
    if (!vertex) continue;

    const position = externalMeshPoint(vertex.position, vertex.normal, vertex.chamber, centerVertex?.position);
    const normal = toScene(vertex.normal).normalize();
    indexByVertexId.set(vertexId, positions.length / 3);
    positions.push(position.x, position.y, position.z);
    normals.push(normal.x, normal.y, normal.z);
    activationPhiValues.push(vertex.phiActivationMs);
    repolarizationPhiValues.push(vertex.phiRepolarizationMs);
    activationTimeValues.push(vertex.activationTimeMs);
    repolarizationTimeValues.push(vertex.repolarizationTimeMs);
  }

  for (const face of field.faces) {
    if (face.regionId !== segment.id) continue;
    const faceIndices = face.vertexIds.map((vertexId) => indexByVertexId.get(vertexId));
    if (faceIndices.every((index) => index !== undefined)) {
      indices.push(faceIndices[0]!, faceIndices[1]!, faceIndices[2]!);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute("phiActivationMs", new THREE.Float32BufferAttribute(activationPhiValues, 1));
  geometry.setAttribute("phiRepolarizationMs", new THREE.Float32BufferAttribute(repolarizationPhiValues, 1));
  geometry.setAttribute("activationTimeMs", new THREE.Float32BufferAttribute(activationTimeValues, 1));
  geometry.setAttribute("repolarizationTimeMs", new THREE.Float32BufferAttribute(repolarizationTimeValues, 1));
  geometry.setIndex(indices);
  geometry.computeBoundingSphere();
  return geometry;
}

function externalMeshOutlinePoints(field: HeartMeshField, segment: HeartMeshSegment, lift = 0.012) {
  const verticesById = new Map(field.vertices.map((vertex) => [vertex.id, vertex]));
  const center = verticesById.get(`${segment.id}:center`);

  return segment.vertexIds
    .filter((vertexId) => !vertexId.endsWith(":center"))
    .map((vertexId) => verticesById.get(vertexId))
    .filter((vertex) => vertex !== undefined)
    .map((vertex) => externalMeshPoint(vertex.position, vertex.normal, vertex.chamber, center?.position).add(new THREE.Vector3(0, 0, lift)));
}

function averagePoint(points: THREE.Vector3[]) {
  const center = new THREE.Vector3();
  for (const point of points) {
    center.add(point);
  }

  return points.length === 0 ? center : center.divideScalar(points.length);
}

function surfacePatchPoints(center: Vec3, vertices: Vec3[]) {
  const centerPoint = toScene(center).add(surfacePatchOffset);
  return vertices.map((vertex) => {
    const point = toScene(vertex).add(surfacePatchOffset);
    const offset = point.clone().sub(centerPoint);
    return new THREE.Vector3(centerPoint.x + offset.x * surfacePatchScale, centerPoint.y + offset.y * surfacePatchScale, centerPoint.z);
  });
}

function makeSurfacePatchGeometry(center: Vec3, vertices: Vec3[]) {
  const points = [toScene(center).add(surfacePatchOffset), ...surfacePatchPoints(center, vertices)];
  const positions: number[] = [];
  const indices: number[] = [];

  for (const point of points) {
    positions.push(point.x, point.y, point.z);
  }

  for (let index = 1; index < points.length; index += 1) {
    const next = index === points.length - 1 ? 1 : index + 1;
    indices.push(0, index, next);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh || child instanceof THREE.Line || child instanceof THREE.Sprite) {
      const disposableGeometry = "geometry" in child ? child.geometry : undefined;
      const disposableMaterial = "material" in child ? child.material : undefined;

      disposableGeometry?.dispose();
      if (Array.isArray(disposableMaterial)) {
        disposableMaterial.forEach((material) => material.dispose());
      } else {
        disposableMaterial?.dispose();
      }
    }
  });
}

export function TorsoScene3D({
  state,
  selectedLead,
  selectedRegionId,
  onSelectRegion,
  layers,
  anatomicalPreview,
  cameraPreset,
  anatomyViewMode: preferredAnatomyViewMode,
  surfaceMapMode: preferredSurfaceMapMode,
  anatomicalOverlayMode: preferredAnatomicalOverlayMode,
  isochroneScope: preferredIsochroneScope,
  highContrast = false,
  reducedMotion = false,
  onCameraPresetChange,
  onAnatomyViewModeChange,
  onSurfaceMapModeChange,
  onAnatomicalOverlayModeChange,
  onIsochroneScopeChange
}: TorsoScene3DProps) {
  const mountRef = React.useRef<HTMLDivElement | null>(null);
  const sceneRef = React.useRef<THREE.Scene | null>(null);
  const rendererRef = React.useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = React.useRef<THREE.PerspectiveCamera | null>(null);
  const dynamicGroupRef = React.useRef<THREE.Group | null>(null);
  const anatomicalPreviewGroupRef = React.useRef<THREE.Group | null>(null);
  const anatomicalPreviewSettingsRef = React.useRef<AnatomicalPreviewSettings>(defaultAnatomicalPreview);
  const onSelectRegionRef = React.useRef<TorsoScene3DProps["onSelectRegion"]>(onSelectRegion);
  const [preset, setPreset] = React.useState<CameraPreset>("frontal");
  const [anatomyViewMode, setAnatomyViewMode] = React.useState<AnatomyViewMode>("external");
  const [surfaceMapMode, setSurfaceMapMode] = React.useState<SurfaceMapMode>("wavefront");
  const [anatomicalOverlayMode, setAnatomicalOverlayMode] = React.useState<AnatomicalOverlayMode>("hybrid");
  const [isochroneScope, setIsochroneScope] = React.useState<IsochroneScope>("ventricles");
  const [previewStatus, setPreviewStatus] = React.useState<"loading" | "loaded" | "failed">("loading");
  const activeLayers = React.useMemo(() => ({ ...defaultLayers, ...layers }), [layers]);
  const activeAnatomicalPreview = React.useMemo(
    () => ({
      ...defaultAnatomicalPreview,
      ...anatomicalPreview,
      opacity: THREE.MathUtils.clamp(anatomicalPreview?.opacity ?? defaultAnatomicalPreview.opacity, 0.08, 1)
    }),
    [anatomicalPreview]
  );

  React.useEffect(() => {
    onSelectRegionRef.current = onSelectRegion;
  }, [onSelectRegion]);

  React.useEffect(() => {
    if (cameraPreset) setPreset(cameraPreset);
  }, [cameraPreset]);

  React.useEffect(() => {
    if (preferredAnatomyViewMode) setAnatomyViewMode(preferredAnatomyViewMode);
  }, [preferredAnatomyViewMode]);

  React.useEffect(() => {
    if (preferredSurfaceMapMode) setSurfaceMapMode(preferredSurfaceMapMode);
  }, [preferredSurfaceMapMode]);

  React.useEffect(() => {
    if (preferredAnatomicalOverlayMode) setAnatomicalOverlayMode(preferredAnatomicalOverlayMode);
  }, [preferredAnatomicalOverlayMode]);

  React.useEffect(() => {
    if (preferredIsochroneScope) setIsochroneScope(preferredIsochroneScope);
  }, [preferredIsochroneScope]);

  const chooseCameraPreset = (value: CameraPreset) => {
    setPreset(value);
    onCameraPresetChange?.(value);
  };

  const chooseAnatomyViewMode = (value: AnatomyViewMode) => {
    setAnatomyViewMode(value);
    onAnatomyViewModeChange?.(value);
  };

  const chooseSurfaceMapMode = (value: SurfaceMapMode) => {
    setSurfaceMapMode(value);
    onSurfaceMapModeChange?.(value);
  };

  const chooseAnatomicalOverlayMode = (value: AnatomicalOverlayMode) => {
    setAnatomicalOverlayMode(value);
    onAnatomicalOverlayModeChange?.(value);
  };

  const chooseIsochroneScope = (value: IsochroneScope) => {
    setIsochroneScope(value);
    onIsochroneScopeChange?.(value);
  };

  React.useEffect(() => {
    const group = anatomicalPreviewGroupRef.current;
    anatomicalPreviewSettingsRef.current = activeAnatomicalPreview;
    if (!group) return;
    applyAnatomicalPreviewState(group, activeAnatomicalPreview);
    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  }, [activeAnatomicalPreview]);

  React.useEffect(() => {
    const mount = mountRef.current;
    if (!mount || !rendererRef.current || !sceneRef.current || !cameraRef.current) return;
    const { width, height } = mount.getBoundingClientRect();
    const pixelRatioCap = scenePixelRatioCap(width, reducedMotion);
    rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio, pixelRatioCap));
    rendererRef.current.setSize(Math.max(1, width), Math.max(1, height), false);
    rendererRef.current.render(sceneRef.current, cameraRef.current);
    (window as unknown as { __scene3dRenderBudget?: unknown }).__scene3dRenderBudget = {
      width: Math.round(width),
      height: Math.round(height),
      devicePixelRatio: window.devicePixelRatio,
      pixelRatioCap,
      reducedMotion
    };
  }, [reducedMotion]);

  React.useEffect(() => {
    if (!mountRef.current) return;

    const mount = mountRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
    mount.appendChild(renderer.domElement);

    const ambient = new THREE.HemisphereLight(0xffffff, 0xcbd5e1, 2.1);
    const key = new THREE.DirectionalLight(0xffffff, 2.4);
    key.position.set(2, 2.8, 3);
    scene.add(ambient, key);

    const torso = new THREE.Mesh(
      new THREE.SphereGeometry(1, 48, 32),
      new THREE.MeshPhysicalMaterial({
        color: 0xcbd5e1,
        transparent: true,
        opacity: 0.2,
        roughness: 0.5,
        transmission: 0.18,
        side: THREE.DoubleSide
      })
    );
    torso.name = "transparent torso shell";
    torso.scale.set(1.05, 1.58, 0.58);
    torso.position.set(0, -0.02, 0.32);
    scene.add(torso);

    const torsoWire = new THREE.LineSegments(
      new THREE.WireframeGeometry(torso.geometry),
      new THREE.LineBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.25 })
    );
    torsoWire.name = "transparent torso wireframe";
    torsoWire.scale.copy(torso.scale);
    torsoWire.position.copy(torso.position);
    scene.add(torsoWire);

    const heart = new THREE.Group();
    heart.name = "procedural heart";
    heart.add(makeChamber("right atrium", 0x9ad7d0, new THREE.Vector3(-0.2, 0.34, 0.14), new THREE.Vector3(0.2, 0.18, 0.18)));
    heart.add(makeChamber("left atrium", 0xf2b7aa, new THREE.Vector3(0.22, 0.34, 0.12), new THREE.Vector3(0.22, 0.18, 0.18)));
    heart.add(makeChamber("right ventricle", 0x7fc8bd, new THREE.Vector3(-0.15, -0.08, 0.2), new THREE.Vector3(0.25, 0.45, 0.22), -0.22));
    heart.add(makeChamber("left ventricle", 0xe98978, new THREE.Vector3(0.18, -0.11, 0.18), new THREE.Vector3(0.3, 0.54, 0.25), 0.2));
    scene.add(heart);

    const anatomicalPreviewGroup = new THREE.Group();
    anatomicalPreviewGroup.name = "nih anatomical heart preview group";
    applyAnatomicalPreviewState(anatomicalPreviewGroup, activeAnatomicalPreview);
    scene.add(anatomicalPreviewGroup);
    const loader = new GLTFLoader();
    let previewDisposed = false;
    loader.load(
      nihAnatomicalPreviewPath,
      (gltf) => {
        if (previewDisposed) {
          disposeObject(gltf.scene);
          return;
        }
        const currentPreviewSettings = anatomicalPreviewSettingsRef.current;
        prepareAnatomicalPreview(gltf.scene, currentPreviewSettings.opacity);
        anatomicalPreviewGroup.add(gltf.scene);
        applyAnatomicalPreviewState(anatomicalPreviewGroup, currentPreviewSettings);
        (window as unknown as { __nihAnatomicalPreview?: unknown }).__nihAnatomicalPreview = gltf.scene.userData.previewDebug;
        setPreviewStatus("loaded");
        renderer.render(scene, camera);
      },
      undefined,
      (error) => {
        console.warn("Unable to load NIH anatomical heart preview", error);
        setPreviewStatus("failed");
      }
    );

    const dynamicGroup = new THREE.Group();
    scene.add(dynamicGroup);
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const handlePointerDown = (event: PointerEvent) => {
      if (!onSelectRegionRef.current) return;

      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
      pointer.y = -(((event.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1);
      raycaster.setFromCamera(pointer, camera);

      const regionTargets = dynamicGroup.children.filter((child) => typeof child.userData.regionId === "string");
      const [hit] = raycaster.intersectObjects(regionTargets, false);
      const regionId = hit?.object.userData.regionId as string | undefined;
      if (regionId) onSelectRegionRef.current(regionId);
    };

    renderer.domElement.addEventListener("pointerdown", handlePointerDown);

    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;
    dynamicGroupRef.current = dynamicGroup;
    anatomicalPreviewGroupRef.current = anatomicalPreviewGroup;

    const resize = () => {
      const { width, height } = mount.getBoundingClientRect();
      const pixelRatioCap = scenePixelRatioCap(width, reducedMotion);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, pixelRatioCap));
      renderer.setSize(Math.max(1, width), Math.max(1, height), false);
      camera.aspect = Math.max(1, width) / Math.max(1, height);
      camera.updateProjectionMatrix();
      (window as unknown as { __scene3dRenderBudget?: unknown }).__scene3dRenderBudget = {
        width: Math.round(width),
        height: Math.round(height),
        devicePixelRatio: window.devicePixelRatio,
        pixelRatioCap,
        reducedMotion
      };
    };

    const render = () => {
      renderer.render(scene, camera);
    };

    resize();
    render();
    const observer = new ResizeObserver(() => {
      resize();
      render();
    });
    observer.observe(mount);

    return () => {
      previewDisposed = true;
      observer.disconnect();
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      disposeObject(scene);
      renderer.dispose();
      renderer.domElement.remove();
      sceneRef.current = null;
      rendererRef.current = null;
      cameraRef.current = null;
      dynamicGroupRef.current = null;
      anatomicalPreviewGroupRef.current = null;
    };
  }, []);

  React.useEffect(() => {
    const camera = cameraRef.current;
    const scene = sceneRef.current;
    const renderer = rendererRef.current;
    if (!camera || !scene || !renderer) return;

    const view = cameraPresets[preset];
    camera.position.copy(view.position);
    camera.lookAt(view.target);
    renderer.render(scene, camera);
  }, [preset]);

  React.useEffect(() => {
    const scene = sceneRef.current;
    const renderer = rendererRef.current;
    const camera = cameraRef.current;
    const dynamicGroup = dynamicGroupRef.current;
    if (!scene || !renderer || !camera || !dynamicGroup) return;

    disposeObject(dynamicGroup);
    dynamicGroup.clear();

    const selectedDefinition = leadDefinitions[selectedLead];
    const regionMechanics = new Map(state.mechanical.regionMechanics.map((region) => [region.regionId, region]));
    const regionsById = new Map(state.surfaceRegions.map((region) => [region.id, region]));
    const internalAnatomyMode = anatomyViewMode !== "external";
    const surfaceOpacity = anatomyViewMode === "external" ? 0.92 : anatomyViewMode === "cutaway" ? 0.46 : 0.24;
    const showProceduralPatchOverlay = anatomicalOverlayMode !== "anatomical";
    const showAnatomicalProjectionOverlay = anatomicalOverlayMode !== "procedural";
    const heart = scene.getObjectByName("procedural heart");
    heart?.children.forEach((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const baseScale = child.userData.baseScale as THREE.Vector3 | undefined;
      if (!baseScale) return;
      const chamberScale = activeLayers.contraction && child.name.includes("atrium")
        ? 1 - state.mechanical.chamber.atrialContraction * 0.08
        : activeLayers.contraction
          ? 1 - state.mechanical.chamber.ventricularContraction * 0.11
          : 1;
      child.scale.copy(baseScale).multiplyScalar(chamberScale);
    });

    if (activeLayers.anatomicalMarkers) {
      const markerDebug = {
        count: normalizedNihAnatomicalAnchors.length,
        selectedRegionId,
        selectedAnchorIds: normalizedNihAnatomicalAnchors
          .filter((anchor) => selectedRegionId && anchor.educationalRegionIds.includes(selectedRegionId))
          .map((anchor) => anchor.id)
      };
      (window as unknown as { __nihAnatomicalMarkers?: unknown }).__nihAnatomicalMarkers = markerDebug;

      for (const anchor of normalizedNihAnatomicalAnchors) {
        const primaryRegionId = anchor.educationalRegionIds.includes(selectedRegionId ?? "")
          ? selectedRegionId
          : anchor.educationalRegionIds[0];
        const region = primaryRegionId ? regionsById.get(primaryRegionId) : undefined;
        const isSelectedAnchor = selectedRegionId ? anchor.educationalRegionIds.includes(selectedRegionId) : false;
        const markerColor = anchor.chamberHint ? chamberSurfaceColors[anchor.chamberHint] : anchorConfidenceColors[anchor.confidence];
        const position = new THREE.Vector3(anchor.scenePosition.x, anchor.scenePosition.y, anchor.scenePosition.z);
        const marker = new THREE.Mesh(
          new THREE.SphereGeometry(isSelectedAnchor ? 0.046 : 0.032, 24, 16),
          new THREE.MeshStandardMaterial({
            color: markerColor,
            emissive: isSelectedAnchor ? markerColor : 0x000000,
            emissiveIntensity: isSelectedAnchor ? 0.42 : 0.08,
            roughness: 0.36,
            transparent: true,
            opacity: isSelectedAnchor ? 0.98 : 0.82
          })
        );
        marker.name = `approximate anatomical anchor ${anchor.id}`;
        marker.position.copy(position);
        marker.renderOrder = isSelectedAnchor ? 45 : 33;
        marker.userData.regionId = primaryRegionId;
        marker.userData.anchorId = anchor.id;
        dynamicGroup.add(marker);

        const halo = new THREE.Mesh(
          new THREE.TorusGeometry(isSelectedAnchor ? 0.09 : 0.062, isSelectedAnchor ? 0.006 : 0.0035, 8, 36),
          new THREE.MeshBasicMaterial({
            color: isSelectedAnchor ? 0x111827 : markerColor,
            transparent: true,
            opacity: isSelectedAnchor ? 0.95 : 0.46,
            depthTest: false
          })
        );
        halo.name = `approximate anatomical anchor halo ${anchor.id}`;
        halo.position.copy(position);
        halo.rotation.x = Math.PI / 2;
        halo.renderOrder = isSelectedAnchor ? 46 : 34;
        dynamicGroup.add(halo);

        const label = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: createLabelTexture(region?.label ?? anchor.label, isSelectedAnchor ? "#fef3c7" : "#ffffff"),
            transparent: true,
            depthTest: false
          })
        );
        label.name = `approximate anatomical anchor label ${anchor.id}`;
        label.position.copy(position).add(new THREE.Vector3(0, isSelectedAnchor ? 0.09 : 0.065, 0.03));
        label.scale.set(isSelectedAnchor ? 0.36 : 0.28, isSelectedAnchor ? 0.16 : 0.12, 1);
        label.renderOrder = isSelectedAnchor ? 47 : 35;
        dynamicGroup.add(label);
      }
    } else {
      (window as unknown as { __nihAnatomicalMarkers?: unknown }).__nihAnatomicalMarkers = {
        count: 0,
        selectedRegionId,
        selectedAnchorIds: []
      };
    }

    if (activeLayers.wavefront || activeLayers.stateMap) {
      for (const segment of state.heartMeshField.segments) {
        const region = regionsById.get(segment.id);
        if (!region) continue;

        const isSelectedRegion = segment.id === selectedRegionId;
        const isCurrentWave = region.state === "depolarizing" || region.state === "repolarizing";
        const meshMode = activeLayers.stateMap ? "electrical-state" : surfaceMapMode;
        const material =
          makeWavefrontShaderMaterial(segment.chamber, isSelectedRegion, meshMode, renderer, surfaceOpacity, highContrast, reducedMotion) ??
          makeExternalMeshFallbackMaterial(segment.chamber, region.state, isSelectedRegion, isCurrentWave, meshMode, surfaceOpacity, highContrast);
        const mesh = new THREE.Mesh(
          makeExternalMeshGeometry(state.heartMeshField, segment),
          material
        );
        mesh.name = `v3 external heart mesh ${segment.id}`;
        mesh.userData.regionId = segment.id;
        mesh.renderOrder = 8;
        dynamicGroup.add(mesh);

        const outlinePoints = externalMeshOutlinePoints(state.heartMeshField, segment, 0.006);
        if (outlinePoints.length >= 3) {
          const outline = new THREE.LineLoop(
            new THREE.BufferGeometry().setFromPoints(outlinePoints),
            new THREE.LineBasicMaterial({
              color: isSelectedRegion ? 0x0f766e : isCurrentWave ? 0x111827 : 0x475569,
              transparent: true,
              opacity: isSelectedRegion || isCurrentWave ? 0.95 : internalAnatomyMode ? 0.28 : 0.46
            })
          );
          outline.name = `v3 external heart outline ${segment.id}`;
          outline.renderOrder = 9;
          dynamicGroup.add(outline);
        }
      }
    }

    const activeIsochroneMap = state.isochroneMaps[isochroneScope];
    const scopedRegionIds = new Set(activeIsochroneMap.bands.map((band) => band.regionId));
    const bandsByRegion = new Map(activeIsochroneMap.bands.map((band) => [band.regionId, band]));

    if (showAnatomicalProjectionOverlay && (activeLayers.wavefront || activeLayers.stateMap || activeLayers.contours)) {
      const projectedAnchorIds: string[] = [];

      for (const anchor of normalizedNihAnatomicalAnchors) {
        const anchorRegions = anchor.educationalRegionIds
          .map((regionId) => regionsById.get(regionId))
          .filter((region) => region !== undefined);
        const currentRegion =
          anchorRegions.find((region) => region.state === "depolarizing" || region.state === "repolarizing") ??
          anchorRegions.find((region) => region.id === selectedRegionId) ??
          anchorRegions[0];
        if (!currentRegion) continue;

        const anchorBand =
          anchor.educationalRegionIds.map((regionId) => bandsByRegion.get(regionId)).find((band) => band?.isCurrentWavefront) ??
          anchor.educationalRegionIds.map((regionId) => bandsByRegion.get(regionId)).find((band) => band !== undefined);
        const position = new THREE.Vector3(anchor.scenePosition.x, anchor.scenePosition.y, anchor.scenePosition.z).add(new THREE.Vector3(0, 0, 0.052));
        const isCurrentWave = currentRegion.state === "depolarizing" || currentRegion.state === "repolarizing";
        const isSelectedAnchor = selectedRegionId ? anchor.educationalRegionIds.includes(selectedRegionId) : false;
        const projectionMode = activeLayers.stateMap ? "electrical-state" : surfaceMapMode;
        const color = surfaceRegionColor(currentRegion.state, projectionMode);

        if (activeLayers.wavefront || activeLayers.stateMap) {
          if (activeLayers.stateMap || isCurrentWave || currentRegion.state === "active" || isSelectedAnchor) {
            const waveRing = new THREE.Mesh(
              new THREE.TorusGeometry(isCurrentWave ? 0.132 : isSelectedAnchor ? 0.116 : 0.086, isCurrentWave ? 0.011 : 0.006, 10, 56),
              new THREE.MeshBasicMaterial({
                color: isSelectedAnchor ? 0x0f766e : color,
                transparent: true,
                opacity: isCurrentWave ? 0.96 : currentRegion.state === "active" ? 0.5 : 0.34,
                depthTest: false
              })
            );
            waveRing.name = `anatomical projected ${currentRegion.state} band ${anchor.id}`;
            waveRing.position.copy(position);
            waveRing.rotation.x = Math.PI / 2;
            waveRing.renderOrder = isCurrentWave ? 52 : 42;
            dynamicGroup.add(waveRing);
            projectedAnchorIds.push(anchor.id);
          }
        }

        if (activeLayers.contours && anchorBand) {
          const contourRing = new THREE.Mesh(
            new THREE.TorusGeometry(anchorBand.isCurrentWavefront ? 0.158 : 0.122, anchorBand.isCurrentWavefront ? 0.006 : 0.0035, 8, 48),
            new THREE.MeshBasicMaterial({
              color: contourColor(anchorBand.bandStartMs),
              transparent: true,
              opacity: anchorBand.isCurrentWavefront ? 0.94 : 0.42,
              depthTest: false
            })
          );
          contourRing.name = `anatomical projected isochrone ${anchor.id}`;
          contourRing.position.copy(position).add(new THREE.Vector3(0, 0.006, 0));
          contourRing.rotation.x = Math.PI / 2;
          contourRing.renderOrder = anchorBand.isCurrentWavefront ? 53 : 43;
          dynamicGroup.add(contourRing);
          projectedAnchorIds.push(anchor.id);

          if (anchorBand.isCurrentWavefront) {
            const label = new THREE.Sprite(
              new THREE.SpriteMaterial({
                map: createLabelTexture(`${Math.round(anchorBand.relativeActivationMs)} ms`, "#fef3c7"),
                transparent: true,
                depthTest: false
              })
            );
            label.name = `anatomical projected isochrone label ${anchor.id}`;
            label.position.copy(position).add(new THREE.Vector3(0, 0.13, 0.05));
            label.scale.set(0.22, 0.11, 1);
            label.renderOrder = 54;
            dynamicGroup.add(label);
          }
        }
      }

      (window as unknown as { __nihAnatomicalProjection?: unknown }).__nihAnatomicalProjection = {
        mode: anatomicalOverlayMode,
        projectedAnchorCount: new Set(projectedAnchorIds).size,
        timeMs: state.timeMs,
        scope: isochroneScope
      };
    } else {
      (window as unknown as { __nihAnatomicalProjection?: unknown }).__nihAnatomicalProjection = {
        mode: anatomicalOverlayMode,
        projectedAnchorCount: 0,
        timeMs: state.timeMs,
        scope: isochroneScope
      };
    }

    if (activeLayers.contours) for (const segment of state.heartMeshField.segments) {
      if (!scopedRegionIds.has(segment.id)) continue;
      const band = bandsByRegion.get(segment.id);
      if (!band) continue;

      const contourPoints = externalMeshOutlinePoints(state.heartMeshField, segment, band.isCurrentWavefront ? 0.028 : 0.018);
      if (contourPoints.length < 3) continue;

      const meshContour = new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(contourPoints),
        new THREE.LineBasicMaterial({
          color: band.isCurrentWavefront ? 0x111827 : contourColor(band.bandStartMs),
          transparent: true,
          opacity: band.isCurrentWavefront ? 0.98 : 0.72,
          depthTest: false
        })
      );
      meshContour.name = `v3 mesh isochrone contour ${segment.id}`;
      meshContour.renderOrder = band.isCurrentWavefront ? 32 : 30;
      dynamicGroup.add(meshContour);

      const shouldLabel = band.isCurrentWavefront || band.relativeActivationMs % 40 === 0;
      if (shouldLabel) {
        const label = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: createLabelTexture(`${Math.round(band.relativeActivationMs)} ms`, band.isCurrentWavefront ? "#fef3c7" : "#ffffff"),
            transparent: true,
            depthTest: false
          })
        );
        label.name = `v3 mesh contour label ${segment.id}`;
        label.position.copy(averagePoint(contourPoints)).add(new THREE.Vector3(0, 0.08, 0.04));
        label.scale.set(0.2, 0.1, 1);
        label.renderOrder = 33;
        dynamicGroup.add(label);
      }
    }

    if (activeLayers.leadContribution) for (const segment of state.heartMeshField.segments) {
      const region = regionsById.get(segment.id);
      if (!region) continue;

      const contribution = classifyRegionLeadContribution(region, selectedLead);
      if (Math.abs(contribution.signedWeight) <= 0.05) continue;

      const haloPoints = externalMeshOutlinePoints(state.heartMeshField, segment, 0.04 + Math.min(0.03, Math.abs(contribution.signedWeight) * 0.025));
      if (haloPoints.length < 3) continue;

      const color = leadContributionColor(contribution.classification);
      const halo = new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(haloPoints),
        new THREE.LineBasicMaterial({
          color,
          transparent: true,
          opacity: contribution.classification === "weak" ? 0.52 : 0.88,
          depthTest: false
        })
      );
      halo.name = `selected lead contribution ${selectedLead} ${segment.id}`;
      halo.renderOrder = 38;
      dynamicGroup.add(halo);

      const marker = new THREE.Mesh(
        new THREE.SphereGeometry(0.018 + Math.min(0.022, Math.abs(contribution.signedWeight) * 0.016), 16, 10),
        new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: contribution.classification === "weak" ? 0.7 : 0.96,
          depthTest: false
        })
      );
      marker.name = `selected lead contribution marker ${selectedLead} ${segment.id}`;
      marker.position.copy(averagePoint(haloPoints)).add(new THREE.Vector3(0, 0.02, 0.08));
      marker.renderOrder = 39;
      dynamicGroup.add(marker);

      if (contribution.classification !== "weak") {
        const label = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: createLabelTexture(leadContributionLabels[contribution.classification], contribution.classification === "aligned" ? "#dcfce7" : "#fee2e2"),
            transparent: true,
            depthTest: false
          })
        );
        label.name = `selected lead contribution label ${selectedLead} ${segment.id}`;
        label.position.copy(marker.position).add(new THREE.Vector3(0, 0.07, 0.04));
        label.scale.set(0.24, 0.12, 1);
        label.renderOrder = 40;
        dynamicGroup.add(label);
      }
    }

    const positiveCenter = terminalCenter(selectedDefinition.positiveTerminal.weights);
    const negativeCenter = terminalCenter(selectedDefinition.negativeTerminal.weights);
    if (activeLayers.leadProjection) {
      const leadLineGeometry = new THREE.BufferGeometry().setFromPoints([negativeCenter, positiveCenter]);
      const leadLine = new THREE.Line(
        leadLineGeometry,
        new THREE.LineBasicMaterial({ color: 0x0f766e, linewidth: 3 })
      );
      dynamicGroup.add(leadLine);

      const leadArrow = new THREE.ArrowHelper(
        positiveCenter.clone().sub(negativeCenter).normalize(),
        negativeCenter,
        positiveCenter.distanceTo(negativeCenter),
        0x0f766e,
        0.13,
        0.08
      );
      dynamicGroup.add(leadArrow);
    }

    const leadVoltage = state.leadVoltages[selectedLead];
    const projectionAxis = toScene(selectedDefinition.axis).normalize();
    const projectionDirection = leadVoltage >= 0 ? projectionAxis : projectionAxis.clone().multiplyScalar(-1);
    const projectionColor = highContrast
      ? leadVoltage > 0.04 ? 0x166534 : leadVoltage < -0.04 ? 0x991b1b : 0x111827
      : leadVoltage > 0.04 ? 0x16a34a : leadVoltage < -0.04 ? 0xdc2626 : 0x64748b;
    const projectionOrigin = new THREE.Vector3(0, 0.04, 0.18);
    const projectionLength = 0.2 + Math.min(0.46, Math.abs(leadVoltage) * 0.32);
    if (activeLayers.leadProjection && projectionDirection.lengthSq() > 0.001) {
      dynamicGroup.add(
        new THREE.ArrowHelper(projectionDirection, projectionOrigin, projectionLength, projectionColor, 0.11, 0.07)
      );

      const projectionLabel = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: createLabelTexture(`${selectedLead} ${leadVoltage.toFixed(2)} mV`, leadVoltage >= 0 ? "#dcfce7" : "#fee2e2"),
          transparent: true
        })
      );
      projectionLabel.position.copy(projectionOrigin).addScaledVector(projectionDirection, projectionLength + 0.08);
      projectionLabel.scale.set(0.38, 0.16, 1);
      dynamicGroup.add(projectionLabel);
    }

    for (const electrodeName of electrodeOrder) {
      const electrode = electrodeDefinitions[electrodeName];
      const position = toScene(electrode.position);
      const positiveWeight = selectedDefinition.positiveTerminal.weights[electrodeName] ?? 0;
      const negativeWeight = selectedDefinition.negativeTerminal.weights[electrodeName] ?? 0;
      const color =
        positiveWeight > 0 ? 0x22c55e : negativeWeight > 0 ? 0xef4444 : electrode.role === "ground" ? 0x94a3b8 : 0xffffff;
      const marker = new THREE.Mesh(
        new THREE.SphereGeometry(positiveWeight || negativeWeight ? 0.065 : 0.045, 24, 16),
        new THREE.MeshStandardMaterial({ color, roughness: 0.35 })
      );
      marker.position.copy(position);
      dynamicGroup.add(marker);

      const label = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: createLabelTexture(electrodeName, positiveWeight > 0 ? "#dcfce7" : negativeWeight > 0 ? "#fee2e2" : "#ffffff"),
          transparent: true
        })
      );
      label.position.copy(position).add(new THREE.Vector3(0, 0.08, 0));
      label.scale.set(0.24, 0.12, 1);
      dynamicGroup.add(label);
    }

    if (activeLayers.chamberVolume || internalAnatomyMode) {
      for (const cue of chamberCueDefinitions) {
        const fraction = state.mechanical.chamberVolumes[cue.chamber];
        const volumeMesh = new THREE.Mesh(
          new THREE.SphereGeometry(1, 28, 18),
          new THREE.MeshStandardMaterial({
            color: cue.color,
            transparent: true,
            opacity: internalAnatomyMode ? 0.28 + fraction * 0.2 : 0.18 + fraction * 0.18,
            roughness: 0.5
          })
        );
        volumeMesh.name = `chamber volume ${cue.chamber}`;
        volumeMesh.position.copy(cue.position);
        volumeMesh.scale.copy(cue.scale).multiplyScalar(0.52 + fraction * 0.58);
        volumeMesh.renderOrder = internalAnatomyMode ? 16 : 10;
        dynamicGroup.add(volumeMesh);

        if (internalAnatomyMode) {
          const label = new THREE.Sprite(
            new THREE.SpriteMaterial({
              map: createLabelTexture(cue.label, cue.chamber === "RA" || cue.chamber === "RV" ? "#dbeafe" : "#fee2e2"),
              transparent: true,
              depthTest: false
            })
          );
          label.name = `chamber label ${cue.chamber}`;
          label.position.copy(cue.position).add(new THREE.Vector3(0, cue.chamber === "RA" || cue.chamber === "LA" ? 0.13 : -0.04, 0.2));
          label.scale.set(0.22, 0.11, 1);
          label.renderOrder = 34;
          dynamicGroup.add(label);
        }
      }

      if (internalAnatomyMode) {
        const septum = new THREE.Mesh(
          new THREE.BoxGeometry(0.04, 0.72, 0.11),
          new THREE.MeshStandardMaterial({
            color: 0xf8fafc,
            emissive: 0xcbd5e1,
            emissiveIntensity: 0.08,
            transparent: true,
            opacity: anatomyViewMode === "chambers" ? 0.54 : 0.42,
            roughness: 0.38
          })
        );
        septum.name = "interventricular septum landmark";
        septum.position.set(0.02, -0.03, 0.25);
        septum.rotation.z = 0.18;
        septum.renderOrder = 17;
        dynamicGroup.add(septum);

        const septumLabel = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: createLabelTexture("septum", "#f8fafc"),
            transparent: true,
            depthTest: false
          })
        );
        septumLabel.name = "septum label";
        septumLabel.position.set(0.03, -0.38, 0.42);
        septumLabel.scale.set(0.28, 0.14, 1);
        septumLabel.renderOrder = 35;
        dynamicGroup.add(septumLabel);

        if (anatomyViewMode === "cutaway") {
          const cutPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(0.96, 1.12),
            new THREE.MeshBasicMaterial({
              color: 0x0f766e,
              transparent: true,
              opacity: 0.1,
              side: THREE.DoubleSide,
              depthWrite: false
            })
          );
          cutPlane.name = "anterior cutaway plane";
          cutPlane.position.set(0, 0.02, 0.48);
          cutPlane.renderOrder = 15;
          dynamicGroup.add(cutPlane);
        }
      }
    }

    for (const node of state.tissueNodes) {
      const nodePosition = toScene(node.position).add(new THREE.Vector3(0, 0, 0.15));
      const size = node.state === "depolarizing" || node.state === "repolarizing" ? 0.075 : 0.055;
      const tissue = new THREE.Mesh(
        new THREE.SphereGeometry(size, 24, 16),
        new THREE.MeshStandardMaterial({
          color: tissueColors[node.state],
          emissive: node.state === "depolarizing" || node.state === "repolarizing" ? tissueColors[node.state] : 0x000000,
          emissiveIntensity: 0.22,
          roughness: 0.4
        })
      );
      tissue.position.copy(nodePosition);
      dynamicGroup.add(tissue);
    }

    if (showProceduralPatchOverlay && (activeLayers.wavefront || activeLayers.stateMap)) for (const region of state.surfaceRegions) {
      const position = toScene(region.center).add(new THREE.Vector3(0, 0, 0.18));
      const color = surfaceRegionColor(region.state, activeLayers.stateMap ? "electrical-state" : surfaceMapMode);
      const isCurrentWave = region.state === "depolarizing" || region.state === "repolarizing";
      const isSelectedRegion = region.id === selectedRegionId;
      const mechanicalRegion = regionMechanics.get(region.id);
      const outlinePoints = surfacePatchPoints(region.center, region.vertices).map((point) => point.add(new THREE.Vector3(0, 0, 0.006)));
      const patch = new THREE.Mesh(
        makeSurfacePatchGeometry(region.center, region.vertices),
        new THREE.MeshBasicMaterial({
          color: isSelectedRegion ? 0x0f766e : color,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: isSelectedRegion ? 0.36 : isCurrentWave ? 0.3 : surfaceMapMode === "wavefront" && region.state === "resting" ? 0.08 : 0.18,
          depthTest: false
        })
      );
      patch.name = `surface mesh region ${region.id}`;
      patch.userData.regionId = region.id;
      patch.renderOrder = 20;
      if (activeLayers.contraction && mechanicalRegion) {
        patch.scale.setScalar(1 + mechanicalRegion.wallDeformation * 0.55);
      }
      dynamicGroup.add(patch);

      const outline = new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(outlinePoints),
        new THREE.LineBasicMaterial({
          color: isSelectedRegion ? 0x0f766e : isCurrentWave ? 0x111827 : 0x64748b,
          transparent: true,
          opacity: isCurrentWave || isSelectedRegion ? 0.82 : 0.34,
          depthTest: false
        })
      );
      outline.name = `surface mesh outline ${region.id}`;
      outline.renderOrder = 21;
      dynamicGroup.add(outline);

      if (isCurrentWave) {
        const wavefront = new THREE.Mesh(
          new THREE.TorusGeometry(isSelectedRegion ? 0.145 : 0.125, 0.008, 8, 48),
          new THREE.MeshBasicMaterial({
            color: region.state === "depolarizing" ? 0xf59e0b : 0x2563eb,
            transparent: true,
            opacity: 0.98,
            depthTest: false
          })
        );
        wavefront.name = `moving wavefront ${region.id}`;
        wavefront.renderOrder = 22;
        wavefront.position.copy(position);
        wavefront.rotation.x = Math.PI / 2;
        dynamicGroup.add(wavefront);
      }

      if (isSelectedRegion) {
        const selectionRing = new THREE.Mesh(
          new THREE.TorusGeometry(0.16, 0.007, 8, 36),
          new THREE.MeshBasicMaterial({ color: 0x0f766e })
        );
        selectionRing.name = `selected region ring ${region.id}`;
        selectionRing.position.copy(position);
        selectionRing.rotation.x = Math.PI / 2;
        dynamicGroup.add(selectionRing);
      }
    }

    if (showProceduralPatchOverlay && (activeLayers.wavefront || activeLayers.stateMap)) {
      const surfaceLinePoints: THREE.Vector3[] = [];
      for (let index = 0; index < state.surfaceRegions.length - 1; index += 1) {
        surfaceLinePoints.push(
          toScene(state.surfaceRegions[index].center).add(new THREE.Vector3(0, 0, 0.34)),
          toScene(state.surfaceRegions[index + 1].center).add(new THREE.Vector3(0, 0, 0.34))
        );
      }

      const ventricularRegions = state.surfaceRegions.filter((region) => region.chamber === "RV" || region.chamber === "LV");
      for (const region of ventricularRegions) {
        for (const neighbor of ventricularRegions) {
          if (region.id >= neighbor.id) continue;
          const from = toScene(region.center).add(new THREE.Vector3(0, 0, 0.34));
          const to = toScene(neighbor.center).add(new THREE.Vector3(0, 0, 0.34));
          if (from.distanceTo(to) < 0.48) {
            surfaceLinePoints.push(from, to);
          }
        }
      }

      const surfaceMeshLines = new THREE.LineSegments(
        new THREE.BufferGeometry().setFromPoints(surfaceLinePoints),
        new THREE.LineBasicMaterial({
          color: 0x334155,
          transparent: true,
          opacity: 0.38,
          depthTest: false
        })
      );
      surfaceMeshLines.name = "coarse heart surface mesh scaffold";
      surfaceMeshLines.renderOrder = 19;
      dynamicGroup.add(surfaceMeshLines);
    }

    if (showProceduralPatchOverlay && activeLayers.contours) for (const region of state.surfaceRegions) {
      if (!scopedRegionIds.has(region.id)) continue;
      const band = bandsByRegion.get(region.id);
      if (!band) continue;

      const position = toScene(region.center).add(new THREE.Vector3(0, 0.003, 0.18));
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(band.isCurrentWavefront ? 0.105 : 0.092, band.isCurrentWavefront ? 0.006 : 0.0035, 8, 36),
        new THREE.MeshBasicMaterial({
          color: contourColor(band.bandStartMs),
          transparent: true,
          opacity: band.isCurrentWavefront ? 0.95 : 0.62
        })
      );
      ring.name = `isochrone contour ${region.id}`;
      ring.position.copy(position);
      ring.rotation.x = Math.PI / 2;
      dynamicGroup.add(ring);

      const shouldLabel = band.isCurrentWavefront || band.relativeActivationMs % 40 === 0;
      if (shouldLabel) {
        const label = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: createLabelTexture(`${Math.round(band.relativeActivationMs)} ms`, band.isCurrentWavefront ? "#fef3c7" : "#ffffff"),
            transparent: true
          })
        );
        label.position.copy(position).add(new THREE.Vector3(0, 0.11, 0.04));
        label.scale.set(0.2, 0.1, 1);
        dynamicGroup.add(label);
      }
    }

    const valveMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f766e,
      emissive: 0x0f766e,
      emissiveIntensity: 0.1,
      roughness: 0.45,
      transparent: true,
      opacity: 0.45 + Math.max(state.mechanical.valves.mitral.openFraction, state.mechanical.valves.aortic.openFraction) * 0.45
    });
    if (activeLayers.valveState) {
      const avValve = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.018, 0.05), valveMaterial);
      avValve.name = "AV valve plane";
      avValve.position.set(0.02, 0.12, 0.18);
      avValve.rotation.z = state.mechanical.valves.mitral.openFraction > 0.5 ? 0.42 : 0.02;
      dynamicGroup.add(avValve);

      const semilunarValve = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.018, 0.05), valveMaterial.clone());
      semilunarValve.name = "semilunar valve plane";
      semilunarValve.position.set(0.04, 0.28, 0.13);
      semilunarValve.rotation.z = state.mechanical.valves.aortic.openFraction > 0.5 ? -0.5 : -0.04;
      dynamicGroup.add(semilunarValve);
    }

    if (activeLayers.flow && state.mechanical.flow.intensity > 0) {
      const flowColor = state.mechanical.flow.region === "aortic-ejection" ? 0xdc2626 : 0x2563eb;
      const start = state.mechanical.flow.region === "aortic-ejection"
        ? new THREE.Vector3(0.04, 0.02, 0.18)
        : new THREE.Vector3(-0.28, 0.44, 0.18);
      const direction = state.mechanical.flow.region === "aortic-ejection"
        ? new THREE.Vector3(0.18, 0.56, -0.04).normalize()
        : new THREE.Vector3(0.34, -0.36, 0.02).normalize();
      dynamicGroup.add(
        new THREE.ArrowHelper(direction, start, 0.25 + state.mechanical.flow.intensity * 0.34, flowColor, 0.08, 0.05)
      );
    }

    const vectorLength = Math.min(0.72, state.netVector.x ** 2 + state.netVector.y ** 2 + state.netVector.z ** 2);
    const vectorDirection = toScene(state.netVector).normalize();
    if (activeLayers.vector && Number.isFinite(vectorDirection.length()) && vectorLength > 0.01) {
      dynamicGroup.add(
        new THREE.ArrowHelper(vectorDirection, new THREE.Vector3(0, 0.04, 0.18), vectorLength, 0x1f2937, 0.13, 0.08)
      );
    }

    const torsoShell = scene.getObjectByName("transparent torso shell") as THREE.Mesh | undefined;
    if (torsoShell) {
      torsoShell.visible = anatomyViewMode === "external";
    }

    const torsoWire = scene.getObjectByName("transparent torso wireframe");
    if (torsoWire) {
      torsoWire.visible = anatomyViewMode === "external";
    }

    renderer.render(scene, camera);
  }, [activeLayers, anatomicalOverlayMode, anatomyViewMode, highContrast, isochroneScope, reducedMotion, selectedLead, selectedRegionId, state, surfaceMapMode]);

  return (
    <div className={`scene3d ${highContrast ? "high-contrast" : ""} ${reducedMotion ? "reduced-motion" : ""}`}>
      <div className="scene3d-toolbar" aria-label="3D camera controls">
        {Object.entries(cameraPresets).map(([key, view]) => (
          <button
            key={key}
            type="button"
            className={preset === key ? "active" : ""}
            onClick={() => chooseCameraPreset(key as CameraPreset)}
            aria-pressed={preset === key}
            aria-keyshortcuts="V"
          >
            {view.label}
          </button>
        ))}
        <div className="anatomy-mode-toggle" aria-label="Anatomy view mode">
          {Object.entries(anatomyViewModes).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={anatomyViewMode === key ? "active" : ""}
              onClick={() => chooseAnatomyViewMode(key as AnatomyViewMode)}
              aria-pressed={anatomyViewMode === key}
              aria-keyshortcuts="A"
            >
              {label}
            </button>
          ))}
        </div>
        <div className="surface-mode-toggle" aria-label="Surface map mode">
          {Object.entries(surfaceMapModes).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={surfaceMapMode === key ? "active" : ""}
              onClick={() => chooseSurfaceMapMode(key as SurfaceMapMode)}
              aria-pressed={surfaceMapMode === key}
              aria-keyshortcuts="F"
            >
              {label}
            </button>
          ))}
        </div>
        <div className="anatomical-overlay-toggle" aria-label="Anatomical overlay mode">
          {Object.entries(anatomicalOverlayModes).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={anatomicalOverlayMode === key ? "active" : ""}
              onClick={() => chooseAnatomicalOverlayMode(key as AnatomicalOverlayMode)}
              aria-pressed={anatomicalOverlayMode === key}
              aria-keyshortcuts="O"
            >
              {label}
            </button>
          ))}
        </div>
        <div className="isochrone-scope-toggle" aria-label="Isochrone contour scope">
          {Object.entries(isochroneScopes).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={isochroneScope === key ? "active" : ""}
              onClick={() => chooseIsochroneScope(key as IsochroneScope)}
              aria-pressed={isochroneScope === key}
              aria-keyshortcuts="I"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      {activeLayers.phaseLabels && (
        <div className="isochrone-caption" aria-label="Isochrone contour summary">
          NIH anatomical reference mesh: {activeAnatomicalPreview.visible ? previewStatus : "hidden"} at {Math.round(activeAnatomicalPreview.opacity * 100)}% opacity. Teaching overlays remain authored from the procedural simulation; mesh isochrone contours: {isochroneScopes[isochroneScope]}, 20 ms bands, current level-set highlighted.
          {` Overlay comparison: ${anatomicalOverlayModes[anatomicalOverlayMode].toLowerCase()}.`}
          {activeLayers.leadContribution && ` ${selectedLead} contributor halos: aligned, opposed, weak.`}
          {activeLayers.anatomicalMarkers && " Anatomical markers are approximate educational anchor mappings, not segmented chamber labels."}
          {previewStatus === "failed" && " The procedural teaching mesh is still available because the reference GLB did not load."}
        </div>
      )}
      <div className="surface-map-legend" aria-label="Surface state legend">
        <span><i className="legend-dot resting" />Not activated</span>
        <span><i className="legend-dot depolarizing" />Depolarizing</span>
        <span><i className="legend-dot active" />Depolarized</span>
        <span><i className="legend-dot repolarizing" />Repolarizing</span>
        <span><i className="legend-dot recovered" />Recovered</span>
      </div>
      <div ref={mountRef} className="scene3d-canvas" role="img" aria-label="3D torso, heart, electrode, selected lead, and selectable surface region visualization" />
    </div>
  );
}
