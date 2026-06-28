import React from "react";
import * as THREE from "three";
import {
  electrodeDefinitions,
  electrodeOrder,
  leadDefinitions,
  type ElectrodeName,
  type IsochroneScope,
  type LeadName,
  type SimulationState,
  type TissueState,
  type Vec3
} from "@ekg/cardio-engine";

type CameraPreset = "frontal" | "transverse" | "left-lateral" | "heart-close";
type SurfaceMapMode = "wavefront" | "electrical-state";

type TorsoScene3DProps = {
  state: SimulationState;
  selectedLead: LeadName;
  selectedRegionId?: string;
  onSelectRegion?: (regionId: string) => void;
  layers?: Partial<TorsoScene3DLayers>;
};

export type TorsoScene3DLayers = {
  wavefront: boolean;
  contours: boolean;
  stateMap: boolean;
  vector: boolean;
  leadProjection: boolean;
  contraction: boolean;
  chamberVolume: boolean;
  valveState: boolean;
  flow: boolean;
  phaseLabels: boolean;
};

const defaultLayers: TorsoScene3DLayers = {
  wavefront: true,
  contours: true,
  stateMap: false,
  vector: true,
  leadProjection: true,
  contraction: true,
  chamberVolume: false,
  valveState: true,
  flow: true,
  phaseLabels: true
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

const isochroneScopes: Record<IsochroneScope, string> = {
  "whole-heart": "Whole",
  atria: "Atria",
  ventricles: "Ventricles"
};

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
const surfacePatchOffset = new THREE.Vector3(0, 0, 0.31);
const surfacePatchScale = 2.05;

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
    opacity: 0.9
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = name;
  mesh.position.copy(position);
  mesh.scale.copy(scale);
  mesh.userData.baseScale = scale.clone();
  mesh.rotation.z = rotationZ;
  return mesh;
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

export function TorsoScene3D({ state, selectedLead, selectedRegionId, onSelectRegion, layers }: TorsoScene3DProps) {
  const mountRef = React.useRef<HTMLDivElement | null>(null);
  const sceneRef = React.useRef<THREE.Scene | null>(null);
  const rendererRef = React.useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = React.useRef<THREE.PerspectiveCamera | null>(null);
  const dynamicGroupRef = React.useRef<THREE.Group | null>(null);
  const onSelectRegionRef = React.useRef<TorsoScene3DProps["onSelectRegion"]>(onSelectRegion);
  const [preset, setPreset] = React.useState<CameraPreset>("frontal");
  const [cutaway, setCutaway] = React.useState(false);
  const [surfaceMapMode, setSurfaceMapMode] = React.useState<SurfaceMapMode>("wavefront");
  const [isochroneScope, setIsochroneScope] = React.useState<IsochroneScope>("ventricles");
  const activeLayers = React.useMemo(() => ({ ...defaultLayers, ...layers }), [layers]);

  React.useEffect(() => {
    onSelectRegionRef.current = onSelectRegion;
  }, [onSelectRegion]);

  React.useEffect(() => {
    if (!mountRef.current) return;

    const mount = mountRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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

    const resize = () => {
      const { width, height } = mount.getBoundingClientRect();
      renderer.setSize(Math.max(1, width), Math.max(1, height), false);
      camera.aspect = Math.max(1, width) / Math.max(1, height);
      camera.updateProjectionMatrix();
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
      observer.disconnect();
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      disposeObject(scene);
      renderer.dispose();
      renderer.domElement.remove();
      sceneRef.current = null;
      rendererRef.current = null;
      cameraRef.current = null;
      dynamicGroupRef.current = null;
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
    const projectionColor = leadVoltage > 0.04 ? 0x16a34a : leadVoltage < -0.04 ? 0xdc2626 : 0x64748b;
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

    if (activeLayers.chamberVolume) {
      const volumeCues = [
        { chamber: "RA", position: new THREE.Vector3(-0.2, 0.34, 0.14), scale: new THREE.Vector3(0.12, 0.11, 0.11), color: 0x2563eb },
        { chamber: "LA", position: new THREE.Vector3(0.22, 0.34, 0.12), scale: new THREE.Vector3(0.13, 0.11, 0.11), color: 0xdc2626 },
        { chamber: "RV", position: new THREE.Vector3(-0.15, -0.08, 0.2), scale: new THREE.Vector3(0.15, 0.28, 0.13), color: 0x2563eb },
        { chamber: "LV", position: new THREE.Vector3(0.18, -0.11, 0.18), scale: new THREE.Vector3(0.18, 0.32, 0.15), color: 0xdc2626 }
      ] as const;

      for (const cue of volumeCues) {
        const fraction = state.mechanical.chamberVolumes[cue.chamber];
        const volumeMesh = new THREE.Mesh(
          new THREE.SphereGeometry(1, 28, 18),
          new THREE.MeshStandardMaterial({
            color: cue.color,
            transparent: true,
            opacity: 0.18 + fraction * 0.18,
            roughness: 0.5
          })
        );
        volumeMesh.name = `chamber volume ${cue.chamber}`;
        volumeMesh.position.copy(cue.position);
        volumeMesh.scale.copy(cue.scale).multiplyScalar(0.52 + fraction * 0.58);
        dynamicGroup.add(volumeMesh);
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

    if (activeLayers.wavefront || activeLayers.stateMap) for (const region of state.surfaceRegions) {
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
          opacity: isSelectedRegion ? 0.98 : surfaceMapMode === "wavefront" && region.state === "resting" ? 0.62 : 0.92,
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
          opacity: isCurrentWave || isSelectedRegion ? 0.98 : 0.66,
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

    if (activeLayers.wavefront || activeLayers.stateMap) {
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

    const activeIsochroneMap = state.isochroneMaps[isochroneScope];
    const scopedRegionIds = new Set(activeIsochroneMap.bands.map((band) => band.regionId));
    const bandsByRegion = new Map(activeIsochroneMap.bands.map((band) => [band.regionId, band]));

    if (activeLayers.contours) for (const region of state.surfaceRegions) {
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
      torsoShell.visible = !cutaway;
    }

    renderer.render(scene, camera);
  }, [activeLayers, cutaway, isochroneScope, selectedLead, selectedRegionId, state, surfaceMapMode]);

  return (
    <div className="scene3d">
      <div className="scene3d-toolbar" aria-label="3D camera controls">
        {Object.entries(cameraPresets).map(([key, view]) => (
          <button
            key={key}
            type="button"
            className={preset === key ? "active" : ""}
            onClick={() => setPreset(key as CameraPreset)}
          >
            {view.label}
          </button>
        ))}
        <label className="cutaway-toggle">
          <input
            type="checkbox"
            checked={cutaway}
            onChange={(event) => setCutaway(event.target.checked)}
          />
          Cutaway
        </label>
        <div className="surface-mode-toggle" aria-label="Surface map mode">
          {Object.entries(surfaceMapModes).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={surfaceMapMode === key ? "active" : ""}
              onClick={() => setSurfaceMapMode(key as SurfaceMapMode)}
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
              onClick={() => setIsochroneScope(key as IsochroneScope)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      {activeLayers.phaseLabels && (
        <div className="isochrone-caption" aria-label="Isochrone contour summary">
          Isochrone contours: {isochroneScopes[isochroneScope]}, 20 ms bands, current wavefront highlighted.
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
