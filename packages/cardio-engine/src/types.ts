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

export type MechanicalPhase =
  | "atrial-systole"
  | "isovolumetric-contraction"
  | "ventricular-ejection"
  | "isovolumetric-relaxation"
  | "rapid-filling"
  | "diastasis";

export type ValveName = "mitral" | "tricuspid" | "aortic" | "pulmonary";

export type FlowRegion =
  | "venous-return"
  | "av-inflow"
  | "atrial-kick"
  | "aortic-ejection"
  | "pulmonary-ejection"
  | "no-flow";

export type ValveState = {
  name: ValveName;
  label: string;
  openFraction: number;
  flowDirection: string;
  pressureLabel: string;
};

export type HeartSoundMarker = {
  id: "S1" | "S2";
  label: string;
  timeMs: number;
  normalizedTime: number;
  description: string;
};

export type ChamberMechanics = {
  atrialContraction: number;
  ventricularContraction: number;
  atrialVolumeFraction: number;
  ventricularVolumeFraction: number;
  wallThickening: number;
  electromechanicalDelayMs: number;
};

export type RegionMechanicalState = {
  regionId: string;
  chamber: HeartChamber;
  activationTimeMs: number;
  contractionOnsetMs: number;
  contractionProgress: number;
  wallDeformation: number;
  chamberVolumeFraction: number;
};

export type FlowState = {
  region: FlowRegion;
  label: string;
  intensity: number;
  oxygenatedFraction: number;
  direction: string;
};

export type MechanicalState = {
  phase: MechanicalPhase;
  phaseLabel: string;
  phaseExplanation: string;
  valves: Record<ValveName, ValveState>;
  sounds: HeartSoundMarker[];
  activeSound: HeartSoundMarker | null;
  chamber: ChamberMechanics;
  chamberVolumes: Record<HeartChamber, number>;
  regionMechanics: RegionMechanicalState[];
  flow: FlowState;
};

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

export type ElectrodeName =
  | "RA"
  | "LA"
  | "RL"
  | "LL"
  | "V1"
  | "V2"
  | "V3"
  | "V4"
  | "V5"
  | "V6";

export type ElectrodeDefinition = {
  name: ElectrodeName;
  label: string;
  position: Vec3;
  role: "limb" | "ground" | "precordial";
};

export type ElectrodePotentials = Record<ElectrodeName, number>;

export type LeadTerminal = {
  label: string;
  weights: Partial<Record<ElectrodeName, number>>;
};

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

export type TissueState =
  | "resting"
  | "depolarizing"
  | "active"
  | "repolarizing"
  | "recovered";

export type HeartChamber = "RA" | "LA" | "RV" | "LV";

export type ActivationNodeRole =
  | "pacemaker"
  | "atria"
  | "av-delay"
  | "his-purkinje"
  | "septum"
  | "ventricle"
  | "base";

export type ActivationNode = {
  id: string;
  label: string;
  region: string;
  role: ActivationNodeRole;
  position: Vec3;
  activationTimeMs: number;
  repolarizationTimeMs: number;
  mass: number;
  sourceId: keyof WaveVectorConfig;
};

export type ActivationEdge = {
  from: string;
  to: string;
  label: string;
};

export type ActivationModel = {
  depolarizationDurationMs: number;
  repolarizationDurationMs: number;
  nodes: ActivationNode[];
  edges: ActivationEdge[];
};

export type ScenarioReference = {
  label: string;
  source: string;
  license: string;
  notes: string;
};

export type CardiacScenario = {
  id: string;
  name: string;
  description: string;
  disclaimer: string;
  category?: string;
  whatChanged?: string[];
  reference?: ScenarioReference;
  timing: ScenarioTiming;
  waveVectors: WaveVectorConfig;
  activationModel: ActivationModel;
  electrodeOverrides?: Partial<Record<ElectrodeName, Vec3>>;
};

export type LeadDefinition = {
  name: LeadName;
  formula: string;
  positiveLabel: string;
  negativeLabel: string;
  positiveTerminal: LeadTerminal;
  negativeTerminal: LeadTerminal;
  axis: Vec3;
};

export type LeadVoltages = Record<LeadName, number>;

export type CardiacSourceType = "depolarization" | "repolarization";

export type RegionalCardiacSource = {
  id: keyof WaveVectorConfig;
  label: string;
  region: string;
  sourceType: CardiacSourceType;
  position: Vec3;
  moment: Vec3;
  strength: number;
};

export type SourceContribution = {
  sourceId: keyof WaveVectorConfig;
  label: string;
  region: string;
  sourceType: CardiacSourceType;
  leadVoltage: number;
};

export type PhaseProgress = {
  atrialDepolarization: number;
  ventricularDepolarization: number;
  ventricularRepolarization: number;
};

export type TissueNodeState = ActivationNode & {
  state: TissueState;
  activationProgress: number;
  repolarizationProgress: number;
};

export type HeartSurfaceRegion = {
  id: string;
  label: string;
  chamber: HeartChamber;
  anatomicalRegion: string;
  activationNodeId: string;
  center: Vec3;
  vertices: Vec3[];
  sourceId: keyof WaveVectorConfig;
  baseActivationTimeMs: number;
  baseRepolarizationTimeMs: number;
  bestSeenLeads: LeadName[];
  oppositeLeads: LeadName[];
};

export type HeartSurfaceModel = {
  id: string;
  label: string;
  regions: HeartSurfaceRegion[];
};

export type HeartSurfaceRegionState = HeartSurfaceRegion & {
  activationTimeMs: number;
  repolarizationTimeMs: number;
  state: TissueState;
  activationProgress: number;
  repolarizationProgress: number;
};

export type HeartMeshVertexField = {
  id: string;
  regionId: string;
  chamber: HeartChamber;
  anatomicalRegion: string;
  position: Vec3;
  normal: Vec3;
  activationTimeMs: number;
  repolarizationTimeMs: number;
  state: TissueState;
  activationProgress: number;
  repolarizationProgress: number;
  phiActivationMs: number;
  phiRepolarizationMs: number;
  bestSeenLeads: LeadName[];
  oppositeLeads: LeadName[];
};

export type HeartMeshFace = {
  id: string;
  regionId: string;
  chamber: HeartChamber;
  vertexIds: [string, string, string];
};

export type HeartMeshSegment = {
  id: string;
  label: string;
  chamber: HeartChamber;
  anatomicalRegion: string;
  vertexIds: string[];
  faceIds: string[];
  activationTimeMs: number;
  repolarizationTimeMs: number;
};

export type HeartMeshField = {
  id: string;
  label: string;
  sourceSurfaceId: string;
  timeMs: number;
  vertices: HeartMeshVertexField[];
  faces: HeartMeshFace[];
  segments: HeartMeshSegment[];
};

export type AnatomicalAssetFormat = "glb" | "gltf" | "obj";

export type AnatomicalAssetManifest = {
  id: string;
  label: string;
  assetType: "heart-anatomy-mesh";
  version: number;
  source: {
    url: string;
    title: string;
    author: string;
    institution?: string;
    retrievedAt: string;
  };
  license: {
    name: string;
    url: string;
    allowsRedistribution: boolean;
    allowsCommercialUse: boolean;
    attributionRequired: boolean;
    attributionText: string;
  };
  files: {
    originalFormat: AnatomicalAssetFormat;
    optimizedFormat: "glb";
    originalPath?: string;
    optimizedPath: string;
    texturePaths?: string[];
  };
  geometry: {
    vertexCount: number;
    faceCount: number;
    hasNormals: boolean;
    hasUvCoordinates: boolean;
    scaleUnit: "normalized" | "meter" | "millimeter" | "centimeter";
    coordinateSystem: "engine" | "asset-native";
    maxDimensionMeters?: number;
  };
  segmentation: {
    chambers: HeartChamber[];
    regionIds: string[];
    hasSeptum: boolean;
    hasValves: boolean;
    notes: string;
  };
  modifications: string[];
  optimization: {
    targetMaxVertices: number;
    targetMaxTextureSize: number;
    dracoCompressed: boolean;
    meshoptCompressed: boolean;
    notes: string;
  };
  redistribution: {
    bundledInRepository: boolean;
    requiresSeparateDownload: boolean;
    notes: string;
  };
  educationalUseNotes: string;
};

export type AssetManifestIssueSeverity = "error" | "warning";

export type AssetManifestIssue = {
  severity: AssetManifestIssueSeverity;
  field: string;
  message: string;
};

export type IsochroneScope = "whole-heart" | "atria" | "ventricles";

export type IsochroneBand = {
  regionId: string;
  label: string;
  chamber: HeartChamber;
  activationTimeMs: number;
  relativeActivationMs: number;
  bandStartMs: number;
  bandEndMs: number;
  isCurrentWavefront: boolean;
};

export type IsochroneContour = {
  relativeTimeMs: number;
  label: string;
  regionIds: string[];
  isCurrent: boolean;
};

export type IsochroneMap = {
  scope: IsochroneScope;
  intervalMs: number;
  anchorTimeMs: number;
  bands: IsochroneBand[];
  contours: IsochroneContour[];
};

export type SimulationState = {
  normalizedTime: number;
  timeMs: number;
  phase: CardiacPhase;
  phaseLabel: string;
  phaseExplanation: string;
  tissueNodes: TissueNodeState[];
  netVector: Vec3;
  cardiacSources: RegionalCardiacSource[];
  surfaceRegions: HeartSurfaceRegionState[];
  heartMeshField: HeartMeshField;
  isochroneMap: IsochroneMap;
  isochroneMaps: Record<IsochroneScope, IsochroneMap>;
  electrodePotentials: ElectrodePotentials;
  wilsonCentralTerminal: number;
  leadVoltages: LeadVoltages;
  phaseProgress: PhaseProgress;
  mechanical: MechanicalState;
};

export type LeadExplanation = {
  lead: LeadName;
  formula: string;
  positiveLabel: string;
  negativeLabel: string;
  voltage: number;
  positivePotential: number;
  negativePotential: number;
  contributions: SourceContribution[];
  polarity: "positive" | "negative" | "near-flat";
  summary: string;
};

export type LeadProbeAlignment = "toward" | "away" | "sideways" | "mixed";
export type LeadContributionClass = "aligned" | "opposed" | "weak";

export type RegionProbeContribution = {
  regionId: string;
  label: string;
  chamber: HeartChamber;
  state: TissueState;
  relationship: "best-seen" | "opposite" | "indirect";
  classification: LeadContributionClass;
  signedWeight: number;
  activationTimeMs: number;
  repolarizationTimeMs: number;
  activationProgress: number;
  repolarizationProgress: number;
};

export type LeadProbeExplanation = {
  lead: LeadName;
  projection: number;
  normalizedProjection: number;
  markerVoltage: number;
  alignment: LeadProbeAlignment;
  alignmentLabel: string;
  regions: RegionProbeContribution[];
  summary: string;
};

export type RegionLeadRelationship = "best-seen" | "opposite";

export type RegionLeadIndicator = {
  lead: LeadName;
  relationship: RegionLeadRelationship;
  voltage: number;
  expectedDeflection: "positive" | "negative" | "near-flat";
};

export type RegionLeadInspection = {
  regionId: string;
  label: string;
  chamber: HeartChamber;
  anatomicalRegion: string;
  state: TissueState;
  activationTimeMs: number;
  repolarizationTimeMs: number;
  contractionOnsetMs: number;
  activationDeltaMs: number;
  repolarizationDeltaMs: number;
  bestSeenLeads: LeadName[];
  oppositeLeads: LeadName[];
  leadIndicators: RegionLeadIndicator[];
  summary: string;
};

export type TraceSample = {
  normalizedTime: number;
  timeMs: number;
  voltage: number;
};

export type ReferenceTraceSample = TraceSample & {
  annotation?: "P" | "QRS" | "T";
};

export type ReferenceLeadTrace = {
  lead: LeadName;
  provenance: "synthetic-reference" | "reference-derived" | "high-fidelity-precomputed";
  label: string;
  samples: ReferenceTraceSample[];
};

export type ValidationCheck = {
  id: string;
  label: string;
  level: "conceptual" | "polarity-timing" | "morphology-plausibility" | "reference-agreement";
  status: "pass" | "caution";
  detail: string;
};

export type ScenarioValidationReport = {
  scenarioId: string;
  checks: ValidationCheck[];
};
