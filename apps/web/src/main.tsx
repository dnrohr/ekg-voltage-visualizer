import React from "react";
import ReactDOM from "react-dom/client";
import { Camera, Contrast, Download, Pause, Play, RotateCcw, Save, SkipBack, SkipForward } from "lucide-react";
import {
  advanceClock,
  createClockState,
  evaluateScenario,
  explainLead,
  explainLeadProbe,
  explainSurfaceRegion,
  frameStepMs,
  generateSyntheticReferenceTrace,
  getScenarioById,
  leadOrder,
  millisecondStepMs,
  playbackSpeeds,
  scenarioLibrary,
  stepClock,
  validateScenario,
  type IsochroneScope,
  type PlaybackSpeed,
  type LeadName
} from "@ekg/cardio-engine";
import { EcgLeadGrid, HeartSchematic, SelectedLeadTrace } from "@ekg/cardio-render-2d";
import { TorsoScene3D, type AnatomyViewMode, type CameraPreset, type SurfaceMapMode, type TorsoScene3DLayers } from "@ekg/cardio-render-3d";
import "./styles.css";

const formatPotential = (value: number) =>
  `${value >= 0 ? "+" : ""}${value.toFixed(2)}`;

const formatRegionWeight = (value: number) =>
  `${value >= 0 ? "+" : ""}${value.toFixed(2)}`;

const formatDelta = (value: number) =>
  value >= 0 ? `${Math.round(value)} ms ago` : `in ${Math.abs(Math.round(value))} ms`;

const activeRegionSummary = (state: ReturnType<typeof evaluateScenario>) =>
  state.surfaceRegions
    .filter((region) => region.state === "depolarizing" || region.state === "repolarizing" || region.state === "active")
    .sort((a, b) => Math.abs(state.timeMs - a.activationTimeMs) - Math.abs(state.timeMs - b.activationTimeMs))
    .slice(0, 4);

const leadPolarityLabel = (voltage: number) =>
  voltage > 0.04 ? "positive" : voltage < -0.04 ? "negative" : "near baseline";

type LearnerMode = "probe-to-heart" | "heart-to-probe" | "advanced";

type V3ViewState = {
  cameraPreset: CameraPreset;
  anatomyViewMode: AnatomyViewMode;
  surfaceMapMode: SurfaceMapMode;
  isochroneScope: IsochroneScope;
};

type VisualLayers = TorsoScene3DLayers & {
  chamberVolume: boolean;
  ecgGrid: boolean;
  enlargedLead: boolean;
  ecgLabels: boolean;
  projectionMarkers: boolean;
  contributionHighlights: boolean;
};

const learnerModes: Record<LearnerMode, string> = {
  "probe-to-heart": "Lead to heart",
  "heart-to-probe": "Heart to leads",
  advanced: "Advanced"
};

const learnerModeOrder = Object.keys(learnerModes) as LearnerMode[];
const cameraPresetOrder: CameraPreset[] = ["frontal", "transverse", "left-lateral", "heart-close"];
const anatomyViewModeOrder: AnatomyViewMode[] = ["external", "cutaway", "chambers"];
const surfaceMapModeOrder: SurfaceMapMode[] = ["wavefront", "electrical-state"];
const isochroneScopeOrder: IsochroneScope[] = ["whole-heart", "atria", "ventricles"];

const layerPresets: Record<LearnerMode, VisualLayers> = {
  "probe-to-heart": {
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
    ecgGrid: true,
    enlargedLead: true,
    ecgLabels: true,
    projectionMarkers: true,
    contributionHighlights: true
  },
  "heart-to-probe": {
    wavefront: true,
    contours: true,
    stateMap: true,
    vector: false,
    leadProjection: false,
    leadContribution: true,
    contraction: true,
    chamberVolume: true,
    valveState: true,
    flow: false,
    phaseLabels: true,
    ecgGrid: true,
    enlargedLead: false,
    ecgLabels: true,
    projectionMarkers: false,
    contributionHighlights: true
  },
  advanced: {
    wavefront: true,
    contours: true,
    stateMap: true,
    vector: true,
    leadProjection: true,
    leadContribution: true,
    contraction: true,
    chamberVolume: true,
    valveState: true,
    flow: true,
    phaseLabels: true,
    ecgGrid: true,
    enlargedLead: true,
    ecgLabels: true,
    projectionMarkers: true,
    contributionHighlights: true
  }
};

const layerLabels: Array<{ key: keyof VisualLayers; label: string; group: "Electrical" | "Mechanical" | "ECG" }> = [
  { key: "wavefront", label: "Wavefront", group: "Electrical" },
  { key: "contours", label: "Contours", group: "Electrical" },
  { key: "stateMap", label: "State map", group: "Electrical" },
  { key: "vector", label: "Net vector", group: "Electrical" },
  { key: "leadProjection", label: "Lead probe", group: "Electrical" },
  { key: "leadContribution", label: "Mesh contributors", group: "Electrical" },
  { key: "contraction", label: "Contraction", group: "Mechanical" },
  { key: "chamberVolume", label: "Chamber volume", group: "Mechanical" },
  { key: "valveState", label: "Valves", group: "Mechanical" },
  { key: "flow", label: "Flow", group: "Mechanical" },
  { key: "phaseLabels", label: "Phase labels", group: "Mechanical" },
  { key: "ecgGrid", label: "12-lead grid", group: "ECG" },
  { key: "enlargedLead", label: "Enlarged lead", group: "ECG" },
  { key: "ecgLabels", label: "Labels", group: "ECG" },
  { key: "projectionMarkers", label: "Projection marker", group: "ECG" },
  { key: "contributionHighlights", label: "Region highlights", group: "ECG" }
];

const v3LayerKeys: Array<keyof TorsoScene3DLayers> = [
  "wavefront",
  "contours",
  "stateMap",
  "vector",
  "leadProjection",
  "leadContribution",
  "contraction",
  "chamberVolume",
  "valveState",
  "flow",
  "phaseLabels"
];

type Lesson = {
  id: string;
  title: string;
  focus: string;
  lead: LeadName;
  regionId: string;
  timeMs: number;
  mode: LearnerMode;
  scenarioId: string;
  comparisonId: string;
  cameraPreset: CameraPreset;
  anatomyViewMode: AnatomyViewMode;
  meshFocus: string;
  prompt: string;
  options: Array<{ id: string; label: string; correct: boolean; feedback: string }>;
};

const lessons: Lesson[] = [
  {
    id: "normal-qrs-mesh",
    title: "Normal QRS propagation",
    focus: "Use the V3 mesh wavefront to follow septal and apical ventricular activation before later free-wall activation.",
    lead: "II",
    regionId: "apical-ventricles",
    timeMs: 322,
    mode: "probe-to-heart",
    scenarioId: "normal-sinus-rhythm",
    comparisonId: "right-bundle-branch-block",
    cameraPreset: "heart-close",
    anatomyViewMode: "external",
    meshFocus: "Watch the orange depolarization band and current isochrone contour cross the ventricular mesh.",
    prompt: "Which region should be active early in a normal teaching QRS?",
    options: [
      { id: "apex", label: "Septum/apex before later free-wall regions.", correct: true, feedback: "Yes. The authored route starts through the His/septal-apical path before later ventricular regions." },
      { id: "basal", label: "Basal ventricles only.", correct: false, feedback: "The basal region is later in this teaching activation sequence." }
    ]
  },
  {
    id: "limb-leads",
    title: "Limb lead axes",
    focus: "Limb leads compare frontal-plane body-surface potentials, so the same QRS vector can look positive in II and negative in aVR.",
    lead: "aVR",
    regionId: "apical-ventricles",
    timeMs: 340,
    mode: "probe-to-heart",
    scenarioId: "normal-sinus-rhythm",
    comparisonId: "left-axis-deviation",
    cameraPreset: "frontal",
    anatomyViewMode: "external",
    meshFocus: "Use the lead probe arrow and mesh contributor halos to connect axis direction with the active ventricular regions.",
    prompt: "Why is aVR often negative during this simplified QRS moment?",
    options: [
      { id: "away", label: "The main vector points away from aVR's positive side.", correct: true, feedback: "Right. aVR views from the right-arm positive side, opposite the dominant ventricular vector here." },
      { id: "broken", label: "The aVR electrode is inactive.", correct: false, feedback: "No. aVR is an augmented lead derived from limb electrodes; it is still a computed voltage." }
    ]
  },
  {
    id: "precordial",
    title: "Precordial lead views",
    focus: "Chest leads compare each precordial electrode with the Wilson central terminal, making V1 and V6 sensitive to different mesh regions.",
    lead: "V5",
    regionId: "lv-lateral",
    timeMs: 348,
    mode: "heart-to-probe",
    scenarioId: "normal-sinus-rhythm",
    comparisonId: "right-axis-deviation",
    cameraPreset: "left-lateral",
    anatomyViewMode: "external",
    meshFocus: "Select the LV lateral wall and compare the best-seen/opposite lead chips with the contributor halos.",
    prompt: "Which selected-region leads should notice the LV lateral wall most directly?",
    options: [
      { id: "lateral", label: "I, aVL, V5, and V6.", correct: true, feedback: "Correct. The selected region metadata marks these as best-seen leads for the LV lateral wall." },
      { id: "right", label: "V1 and aVR only.", correct: false, feedback: "Those are opposite-side views for this selected region in the teaching model." }
    ]
  },
  {
    id: "bundle-delay-comparison",
    title: "Bundle-branch delay comparison",
    focus: "Compare normal propagation with a bundle-branch-delay teaching scenario to see timing changes before ECG widening.",
    lead: "V1",
    regionId: "rv-free-wall",
    timeMs: 410,
    mode: "advanced",
    scenarioId: "right-bundle-branch-block",
    comparisonId: "left-bundle-branch-block",
    cameraPreset: "heart-close",
    anatomyViewMode: "cutaway",
    meshFocus: "Use the comparison cards and cutaway mesh to ask what changed in activation timing before the QRS changed.",
    prompt: "What is the safest interpretation of the wider generated QRS here?",
    options: [
      { id: "timing", label: "Authored ventricular activation timing changed first.", correct: true, feedback: "Exactly. The lesson is heart-model timing before ECG morphology." },
      { id: "diagnosis", label: "The app has diagnosed bundle-branch block.", correct: false, feedback: "No. This is a synthetic teaching comparison, not clinical diagnosis." }
    ]
  },
  {
    id: "ectopic-focus",
    title: "Ectopic ventricular focus",
    focus: "Start from a ventricular focus and inspect how an abnormal activation origin changes the mesh wavefront and selected leads.",
    lead: "II",
    regionId: "rv-free-wall",
    timeMs: 280,
    mode: "advanced",
    scenarioId: "ventricular-ectopic-focus",
    comparisonId: "ventricular-ectopic-focus",
    cameraPreset: "heart-close",
    anatomyViewMode: "chambers",
    meshFocus: "The chamber view makes the early RV free-wall source easier to inspect while the ECG cursor stays synchronized.",
    prompt: "What makes this ectopic-focus lesson different from normal QRS propagation?",
    options: [
      { id: "origin", label: "The earliest ventricular activation starts away from the normal His-Purkinje route.", correct: true, feedback: "Right. The model begins ventricular activation in the RV free wall for this teaching case." },
      { id: "wire", label: "The lead wire triggers the ventricle.", correct: false, feedback: "No. Leads measure body-surface potential differences; they do not trigger activation." }
    ]
  },
  {
    id: "repolarization",
    title: "Repolarization and T wave",
    focus: "Use the blue repolarization band to separate recovery from depolarization and connect it to the teaching T wave.",
    lead: "V6",
    regionId: "lv-lateral",
    timeMs: 610,
    mode: "advanced",
    scenarioId: "normal-sinus-rhythm",
    comparisonId: "left-bundle-branch-block",
    cameraPreset: "heart-close",
    anatomyViewMode: "external",
    meshFocus: "Look for repolarizing/recovered tissue labels and remember that the recovery wave is not just depolarization running backward.",
    prompt: "What does the T-wave lesson emphasize in this model?",
    options: [
      { id: "recovery", label: "Regional recovery shapes the signal after depolarization.", correct: true, feedback: "Yes. The T wave comes from authored regional repolarization timing." },
      { id: "reverse", label: "It is simply the QRS wave running backward.", correct: false, feedback: "Not in this teaching model. Repolarization has its own regional timing and vector." }
    ]
  },
  {
    id: "comparison-workflow",
    title: "Normal vs abnormal comparison",
    focus: "Use the V3 comparison viewer to compare normal sinus rhythm with an abnormal teaching scenario without losing the shared time cursor.",
    lead: "V1",
    regionId: "rv-free-wall",
    timeMs: 410,
    mode: "advanced",
    scenarioId: "right-bundle-branch-block",
    comparisonId: "right-bundle-branch-block",
    cameraPreset: "transverse",
    anatomyViewMode: "cutaway",
    meshFocus: "Read the normal anchor and selected-comparison cards before looking at the voltage delta.",
    prompt: "In the comparison viewer, what should you inspect before the ECG delta?",
    options: [
      { id: "heart-first", label: "The authored heart timing and active regions.", correct: true, feedback: "Exactly. The viewer is designed heart-first, then ECG." },
      { id: "diagnostic", label: "A diagnostic normal/abnormal decision.", correct: false, feedback: "No. The viewer is an educational comparison, not a classifier." }
    ]
  }
];

function App() {
  const [timeMs, setTimeMs] = React.useState(340);
  const [selectedLead, setSelectedLead] = React.useState<LeadName>("II");
  const [scenarioId, setScenarioId] = React.useState("normal-sinus-rhythm");
  const [comparisonId, setComparisonId] = React.useState("right-bundle-branch-block");
  const [selectedRegionId, setSelectedRegionId] = React.useState("lv-lateral");
  const [learnerMode, setLearnerMode] = React.useState<LearnerMode>("probe-to-heart");
  const [v3ViewState, setV3ViewState] = React.useState<V3ViewState>({
    cameraPreset: lessons[0].cameraPreset,
    anatomyViewMode: lessons[0].anatomyViewMode,
    surfaceMapMode: "wavefront",
    isochroneScope: "ventricles"
  });
  const [visualLayers, setVisualLayers] = React.useState<VisualLayers>(layerPresets["probe-to-heart"]);
  const [selectedLessonId, setSelectedLessonId] = React.useState(lessons[0].id);
  const [quizChoiceId, setQuizChoiceId] = React.useState<string | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [speed, setSpeed] = React.useState<PlaybackSpeed>(1);
  const [highContrast, setHighContrast] = React.useState(false);
  const [reducedMotion, setReducedMotion] = React.useState(false);
  const lastFrame = React.useRef<number | null>(null);
  const scenarioRef = React.useRef(getScenarioById(scenarioId));
  const surfaceRegionsRef = React.useRef<ReturnType<typeof evaluateScenario>["surfaceRegions"]>([]);
  const normalComparisonScenario = React.useMemo(() => getScenarioById("normal-sinus-rhythm"), []);
  const scenario = React.useMemo(() => getScenarioById(scenarioId), [scenarioId]);
  const comparisonScenario = React.useMemo(() => getScenarioById(comparisonId), [comparisonId]);
  const clock = React.useMemo(() => createClockState(scenario, timeMs), [scenario, timeMs]);
  const state = React.useMemo(
    () => evaluateScenario(scenario, clock.normalizedTime),
    [clock.normalizedTime, scenario]
  );
  const comparisonState = React.useMemo(
    () => evaluateScenario(comparisonScenario, clock.normalizedTime),
    [clock.normalizedTime, comparisonScenario]
  );
  const normalComparisonState = React.useMemo(
    () => evaluateScenario(normalComparisonScenario, clock.normalizedTime),
    [clock.normalizedTime, normalComparisonScenario]
  );
  const explanation = React.useMemo(
    () => explainLead(state, selectedLead),
    [selectedLead, state]
  );
  const probeExplanation = React.useMemo(
    () => explainLeadProbe(state, selectedLead),
    [selectedLead, state]
  );
  const regionInspection = React.useMemo(
    () => explainSurfaceRegion(state, selectedRegionId, selectedLead) ?? explainSurfaceRegion(state, state.surfaceRegions[0]?.id ?? "", selectedLead),
    [selectedLead, selectedRegionId, state]
  );
  const comparisonExplanation = React.useMemo(
    () => explainLead(comparisonState, selectedLead),
    [comparisonState, selectedLead]
  );
  const normalComparisonExplanation = React.useMemo(
    () => explainLead(normalComparisonState, selectedLead),
    [normalComparisonState, selectedLead]
  );
  const referenceTrace = React.useMemo(
    () => generateSyntheticReferenceTrace(scenario, selectedLead),
    [scenario, selectedLead]
  );
  const validationReport = React.useMemo(() => validateScenario(scenario), [scenario]);
  const normalActiveRegions = React.useMemo(() => activeRegionSummary(normalComparisonState), [normalComparisonState]);
  const comparisonActiveRegions = React.useMemo(() => activeRegionSummary(comparisonState), [comparisonState]);
  const comparisonVoltageDelta = comparisonState.leadVoltages[selectedLead] - normalComparisonState.leadVoltages[selectedLead];
  const qrsEndDeltaMs = comparisonScenario.timing.qrsEndMs - normalComparisonScenario.timing.qrsEndMs;
  const selectedLesson = React.useMemo(
    () => lessons.find((lesson) => lesson.id === selectedLessonId) ?? lessons[0],
    [selectedLessonId]
  );
  const selectedQuizChoice = selectedLesson.options.find((option) => option.id === quizChoiceId);
  const tissueCounts = React.useMemo(
    () =>
      state.tissueNodes.reduce(
        (counts, node) => ({
          ...counts,
          [node.state]: counts[node.state] + 1
        }),
        { resting: 0, depolarizing: 0, active: 0, repolarizing: 0, recovered: 0 }
      ),
    [state]
  );
  const v3RenderProfile = React.useMemo(() => {
    const segmentCount = state.heartMeshField.segments.length;
    const vertexCount = state.heartMeshField.vertices.length;
    const faceCount = state.heartMeshField.faces.length;
    const currentContourCount = state.isochroneMaps[v3ViewState.isochroneScope].bands.filter((band) => band.isCurrentWavefront).length;
    const enabled3DLayers = v3LayerKeys.filter((key) => visualLayers[key]);

    return {
      segmentCount,
      vertexCount,
      faceCount,
      currentContourCount,
      enabled3DLayers,
      shaderPath: visualLayers.wavefront || visualLayers.stateMap ? "shader wavefront material with standard-material fallback" : "static overlay layers",
      devicePixelRatioCap: 2
    };
  }, [state.heartMeshField, state.isochroneMaps, v3ViewState.isochroneScope, visualLayers]);

  React.useEffect(() => {
    scenarioRef.current = scenario;
    surfaceRegionsRef.current = state.surfaceRegions;
  }, [scenario, state.surfaceRegions]);

  React.useEffect(() => {
    if (!isPlaying || reducedMotion) {
      lastFrame.current = null;
      return;
    }

    let frame = 0;
    const tick = (now: number) => {
      if (lastFrame.current !== null) {
        const elapsedMs = now - lastFrame.current;
        setTimeMs((current) => advanceClock(scenario, current, elapsedMs, speed).timeMs);
      }

      lastFrame.current = now;
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [isPlaying, reducedMotion, scenario, speed]);

  React.useEffect(() => {
    setTimeMs((current) => createClockState(scenario, current).timeMs);
  }, [scenario]);

  React.useEffect(() => {
    const stored = window.localStorage.getItem("ekg-view-preset");
    if (!stored) return;

    try {
      const preset = JSON.parse(stored) as {
        selectedLead?: LeadName;
        selectedRegionId?: string;
        learnerMode?: LearnerMode;
        visualLayers?: Partial<VisualLayers>;
        scenarioId?: string;
        comparisonId?: string;
        highContrast?: boolean;
        reducedMotion?: boolean;
        v3ViewState?: Partial<V3ViewState>;
      };
      if (preset.selectedLead && leadOrder.includes(preset.selectedLead)) setSelectedLead(preset.selectedLead);
      if (preset.selectedRegionId) setSelectedRegionId(preset.selectedRegionId);
      if (preset.learnerMode && preset.learnerMode in learnerModes) setLearnerMode(preset.learnerMode);
      if (preset.visualLayers) setVisualLayers((current) => ({ ...current, ...preset.visualLayers }));
      if (preset.scenarioId) setScenarioId(preset.scenarioId);
      if (preset.comparisonId) setComparisonId(preset.comparisonId);
      if (typeof preset.highContrast === "boolean") setHighContrast(preset.highContrast);
      if (typeof preset.reducedMotion === "boolean") setReducedMotion(preset.reducedMotion);
      if (preset.v3ViewState) {
        setV3ViewState((current) => ({
          cameraPreset: preset.v3ViewState?.cameraPreset && cameraPresetOrder.includes(preset.v3ViewState.cameraPreset) ? preset.v3ViewState.cameraPreset : current.cameraPreset,
          anatomyViewMode: preset.v3ViewState?.anatomyViewMode && anatomyViewModeOrder.includes(preset.v3ViewState.anatomyViewMode) ? preset.v3ViewState.anatomyViewMode : current.anatomyViewMode,
          surfaceMapMode: preset.v3ViewState?.surfaceMapMode && surfaceMapModeOrder.includes(preset.v3ViewState.surfaceMapMode) ? preset.v3ViewState.surfaceMapMode : current.surfaceMapMode,
          isochroneScope: preset.v3ViewState?.isochroneScope && isochroneScopeOrder.includes(preset.v3ViewState.isochroneScope) ? preset.v3ViewState.isochroneScope : current.isochroneScope
        }));
      }
    } catch {
      window.localStorage.removeItem("ekg-view-preset");
    }
  }, []);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.tagName === "INPUT" || target?.tagName === "SELECT" || target?.tagName === "TEXTAREA") return;

      if (event.key === " ") {
        event.preventDefault();
        setIsPlaying((value) => !value);
      } else if (event.key === "ArrowRight") {
        setTimeMs((current) => stepClock(scenarioRef.current, current, millisecondStepMs).timeMs);
      } else if (event.key === "ArrowLeft") {
        setTimeMs((current) => stepClock(scenarioRef.current, current, -millisecondStepMs).timeMs);
      } else if (event.key.toLowerCase() === "l") {
        setSelectedLead((current) => leadOrder[(leadOrder.indexOf(current) + 1) % leadOrder.length]);
      } else if (event.key.toLowerCase() === "s") {
        setScenarioId((current) => scenarioLibrary[(scenarioLibrary.findIndex((item) => item.id === current) + 1) % scenarioLibrary.length].id);
      } else if (event.key.toLowerCase() === "c") {
        setComparisonId((current) => scenarioLibrary[(scenarioLibrary.findIndex((item) => item.id === current) + 1) % scenarioLibrary.length].id);
      } else if (event.key.toLowerCase() === "m") {
        setLearnerMode((current) => {
          const nextMode = learnerModeOrder[(learnerModeOrder.indexOf(current) + 1) % learnerModeOrder.length];
          setVisualLayers(layerPresets[nextMode]);
          return nextMode;
        });
      } else if (event.key.toLowerCase() === "v") {
        setV3ViewState((current) => ({
          ...current,
          cameraPreset: cameraPresetOrder[(cameraPresetOrder.indexOf(current.cameraPreset) + 1) % cameraPresetOrder.length]
        }));
      } else if (event.key.toLowerCase() === "a") {
        setV3ViewState((current) => ({
          ...current,
          anatomyViewMode: anatomyViewModeOrder[(anatomyViewModeOrder.indexOf(current.anatomyViewMode) + 1) % anatomyViewModeOrder.length]
        }));
      } else if (event.key.toLowerCase() === "f") {
        setV3ViewState((current) => ({
          ...current,
          surfaceMapMode: surfaceMapModeOrder[(surfaceMapModeOrder.indexOf(current.surfaceMapMode) + 1) % surfaceMapModeOrder.length]
        }));
      } else if (event.key.toLowerCase() === "i") {
        setV3ViewState((current) => ({
          ...current,
          isochroneScope: isochroneScopeOrder[(isochroneScopeOrder.indexOf(current.isochroneScope) + 1) % isochroneScopeOrder.length]
        }));
      } else if (/^[1-9]$/.test(event.key)) {
        const layer = layerLabels[Number(event.key) - 1];
        if (layer) setVisualLayers((current) => ({ ...current, [layer.key]: !current[layer.key] }));
      } else if (event.key.toLowerCase() === "r") {
        setSelectedRegionId((current) => {
          const regions = surfaceRegionsRef.current;
          const currentIndex = Math.max(0, regions.findIndex((region) => region.id === current));
          const step = event.shiftKey ? -1 : 1;
          return regions[(currentIndex + step + regions.length) % regions.length]?.id ?? current;
        });
      } else if (event.key.toLowerCase() === "g") {
        setSelectedLessonId((current) => {
          const currentIndex = Math.max(0, lessons.findIndex((lesson) => lesson.id === current));
          const step = event.shiftKey ? -1 : 1;
          const nextLesson = lessons[(currentIndex + step + lessons.length) % lessons.length];
          setQuizChoiceId(null);
          setSelectedLead(nextLesson.lead);
          setSelectedRegionId(nextLesson.regionId);
          setTimeMs(nextLesson.timeMs);
          setScenarioId(nextLesson.scenarioId);
          setComparisonId(nextLesson.comparisonId);
          setV3ViewState((current) => ({
            ...current,
            cameraPreset: nextLesson.cameraPreset,
            anatomyViewMode: nextLesson.anatomyViewMode
          }));
          setLearnerMode(nextLesson.mode);
          setVisualLayers(layerPresets[nextLesson.mode]);
          return nextLesson.id;
        });
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const savePreset = () => {
    window.localStorage.setItem(
      "ekg-view-preset",
      JSON.stringify({ selectedLead, selectedRegionId, learnerMode, visualLayers, scenarioId, comparisonId, highContrast, reducedMotion, v3ViewState })
    );
  };

  const applyLearnerMode = (mode: LearnerMode) => {
    setLearnerMode(mode);
    setVisualLayers(layerPresets[mode]);
  };

  const toggleLayer = (key: keyof VisualLayers) => {
    setVisualLayers((current) => ({ ...current, [key]: !current[key] }));
  };

  const startLesson = (lesson: Lesson) => {
    setSelectedLessonId(lesson.id);
    setQuizChoiceId(null);
    setSelectedLead(lesson.lead);
    setSelectedRegionId(lesson.regionId);
    setTimeMs(lesson.timeMs);
    setScenarioId(lesson.scenarioId);
    setComparisonId(lesson.comparisonId);
    setV3ViewState((current) => ({
      ...current,
      cameraPreset: lesson.cameraPreset,
      anatomyViewMode: lesson.anatomyViewMode
    }));
    applyLearnerMode(lesson.mode);
  };

  const exportScreenshot = async () => {
    const canvas = document.querySelector<HTMLCanvasElement>(".scene3d-canvas canvas");
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `ekg-visualizer-${scenario.id}-${selectedLead}-${v3ViewState.cameraPreset}-${v3ViewState.anatomyViewMode}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const exportStudySnapshot = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      scenarioId,
      comparisonId,
      timeMs: clock.timeMs,
      selectedLead,
      selectedRegionId: regionInspection?.regionId,
      learnerMode,
      visualLayers,
      v3ViewState,
      accessibility: {
        highContrast,
        reducedMotion
      },
      renderProfile: v3RenderProfile,
      leadVoltage: state.leadVoltages[selectedLead],
      phaseLabel: state.phaseLabel,
      mechanicalPhase: state.mechanical.phaseLabel,
      selectedLessonId
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.download = `ekg-study-${scenario.id}-${Math.round(clock.timeMs)}ms.json`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <main className={`app-shell ${highContrast ? "high-contrast-mode" : ""} ${reducedMotion ? "reduced-motion-mode" : ""}`}>
      <section className="simulator-top">
        <div className="heart-panel" aria-label="Heart electrical state">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Synthetic teaching beat</p>
              <h1>EKG Voltage Visualizer</h1>
            </div>
            <p className="time-readout">{Math.round(clock.timeMs)} / {clock.cycleMs} ms</p>
          </div>
          <div className="scenario-controls" aria-label="Scenario controls">
            <label htmlFor="scenario-select">
              <span>Scenario</span>
              <select id="scenario-select" aria-label="Scenario" value={scenarioId} onChange={(event) => setScenarioId(event.target.value)}>
                {scenarioLibrary.map((item) => (
                  <option value={item.id} key={item.id}>{item.name}</option>
                ))}
              </select>
            </label>
            <label htmlFor="comparison-select">
              <span>Compare</span>
              <select id="comparison-select" aria-label="Compare" value={comparisonId} onChange={(event) => setComparisonId(event.target.value)}>
                {scenarioLibrary.map((item) => (
                  <option value={item.id} key={item.id}>{item.name}</option>
                ))}
              </select>
            </label>
          </div>
          <HeartSchematic state={state} selectedLead={selectedLead} />
        </div>

        <aside className="explanation-panel" aria-label="Selected lead explanation">
          <div className="lead-picker" aria-label="Select lead">
            {leadOrder.map((lead) => (
              <button
                key={lead}
                type="button"
                className={lead === selectedLead ? "active" : ""}
                onClick={() => setSelectedLead(lead)}
              >
                {lead}
              </button>
            ))}
          </div>

          <div className="lead-explanation">
            <p className="eyebrow">Selected lead</p>
            <h2>{selectedLead}</h2>
            <dl>
              <div>
                <dt>Formula</dt>
                <dd>{explanation.formula}</dd>
              </div>
              <div>
                <dt>Positive side</dt>
                <dd>{explanation.positiveLabel}</dd>
              </div>
              <div>
                <dt>Negative reference</dt>
                <dd>{explanation.negativeLabel}</dd>
              </div>
              <div>
                <dt>Current value</dt>
                <dd>{explanation.voltage.toFixed(2)} mV, {explanation.polarity}</dd>
              </div>
              <div>
                <dt>Terminal potentials</dt>
                <dd>
                  {formatPotential(explanation.positivePotential)} / {formatPotential(explanation.negativePotential)} model units
                </dd>
              </div>
              <div>
                <dt>Wilson terminal</dt>
                <dd>{state.wilsonCentralTerminal.toFixed(2)} model units</dd>
              </div>
            </dl>
            <p>{explanation.summary}</p>
            <div className={`probe-panel ${probeExplanation.alignment}`} aria-label="Lead probe teaching mode">
              <div className="probe-summary">
                <p className="eyebrow">Lead probe</p>
                <h3>{probeExplanation.alignmentLabel}</h3>
                <p>{probeExplanation.summary}</p>
              </div>
              {visualLayers.enlargedLead && (
                <SelectedLeadTrace
                  scenario={scenario}
                  state={state}
                  selectedLead={selectedLead}
                  probe={probeExplanation}
                  referenceTrace={referenceTrace}
                  showLabels={visualLayers.ecgLabels}
                  showProjectionMarker={visualLayers.projectionMarkers}
                  showContributionMarkers={visualLayers.contributionHighlights}
                  highContrast={highContrast}
                />
              )}
              <div className="probe-metrics" aria-label="Lead probe projection values">
                <span>
                  <strong>Alignment</strong>
                  {probeExplanation.alignment}
                </span>
                <span>
                  <strong>Projection</strong>
                  {probeExplanation.normalizedProjection.toFixed(2)}
                </span>
                <span>
                  <strong>Marker</strong>
                  {probeExplanation.markerVoltage.toFixed(2)} mV
                </span>
              </div>
              <div className="probe-region-list" aria-label="Surface region probe contribution summary">
                {probeExplanation.regions.map((region) => (
                  <div className={`probe-region-row ${region.classification}`} key={region.regionId}>
                    <span>
                      <strong>{region.label}</strong>
                      <small>{region.chamber}, {region.state}, {region.classification}, {region.relationship}</small>
                    </span>
                    <span>{formatRegionWeight(region.signedWeight)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mechanical-summary" aria-label="Current mechanical state">
              <p className="eyebrow">Mechanical phase</p>
              {visualLayers.phaseLabels && <h3>{state.mechanical.phaseLabel}</h3>}
              {visualLayers.phaseLabels && <p>{state.mechanical.phaseExplanation}</p>}
              {visualLayers.chamberVolume && (
                <p className="flow-line">
                  LV/RV volume: {Math.round(state.mechanical.chamberVolumes.LV * 100)}%; atrial volume: {Math.round(state.mechanical.chamberVolumes.LA * 100)}%
                </p>
              )}
              {visualLayers.valveState && <div className="valve-grid">
                {Object.values(state.mechanical.valves).map((valve) => (
                  <span key={valve.name}>
                    <strong>{valve.label}</strong>
                    {Math.round(valve.openFraction * 100)}% open
                  </span>
                ))}
              </div>}
              {visualLayers.flow && <p className="flow-line">{state.mechanical.flow.label}: {state.mechanical.flow.direction}</p>}
            </div>
            <div className="tissue-summary" aria-label="Current tissue states">
              <p className="eyebrow">Tissue state</p>
              <p>{state.phaseExplanation}</p>
              <div className="tissue-state-list">
                {Object.entries(tissueCounts).map(([stateName, count]) => (
                  <span className={`tissue-pill ${stateName}`} key={stateName}>
                    {stateName} {count}
                  </span>
                ))}
              </div>
            </div>
            <div className="contribution-list" aria-label="Regional contribution breakdown">
              <p className="eyebrow">Top source contributions</p>
              {explanation.contributions.slice(0, 4).map((contribution) => (
                <div className="contribution-row" key={contribution.sourceId}>
                  <span>
                    <strong>{contribution.label}</strong>
                    <small>{contribution.region}, {contribution.sourceType}</small>
                  </span>
                  <span>{contribution.leadVoltage.toFixed(2)} mV</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <section className="timeline-panel" aria-label="Timeline controls">
        <div className="transport-controls">
          <button className="icon-button" type="button" onClick={() => setIsPlaying((value) => !value)} aria-label={isPlaying ? "Pause beat animation" : "Play beat animation"} aria-keyshortcuts="Space">
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button className="icon-button" type="button" onClick={() => setTimeMs(0)} aria-label="Reset to start">
            <RotateCcw size={18} />
          </button>
          <button className="icon-button" type="button" onClick={() => setTimeMs((value) => stepClock(scenario, value, -frameStepMs).timeMs)} aria-label="Step backward one frame" aria-keyshortcuts="ArrowLeft">
            <SkipBack size={18} />
          </button>
          <button className="icon-button" type="button" onClick={() => setTimeMs((value) => stepClock(scenario, value, frameStepMs).timeMs)} aria-label="Step forward one frame" aria-keyshortcuts="ArrowRight">
            <SkipForward size={18} />
          </button>
          <button className="step-button" type="button" onClick={() => setTimeMs((value) => stepClock(scenario, value, -millisecondStepMs).timeMs)}>
            -1 ms
          </button>
          <button className="step-button" type="button" onClick={() => setTimeMs((value) => stepClock(scenario, value, millisecondStepMs).timeMs)}>
            +1 ms
          </button>
          <div className="speed-control" aria-label="Playback speed">
            {playbackSpeeds.map((value) => (
              <button
                key={value}
                type="button"
                className={speed === value ? "active" : ""}
                onClick={() => setSpeed(value)}
              >
                {value === 0.05 ? "20x slow" : `${value}x`}
              </button>
            ))}
          </div>
          <button className={`icon-button ${highContrast ? "active" : ""}`} type="button" onClick={() => setHighContrast((value) => !value)} aria-label="Toggle high contrast ECG grid">
            <Contrast size={18} />
          </button>
          <button className={`text-toggle ${reducedMotion ? "active" : ""}`} type="button" onClick={() => setReducedMotion((value) => !value)}>
            Reduced motion
          </button>
          <button className="icon-button" type="button" onClick={savePreset} aria-label="Save view preset">
            <Save size={18} />
          </button>
          <button className="icon-button" type="button" onClick={() => void exportScreenshot()} aria-label="Export 3D screenshot">
            <Camera size={18} />
          </button>
          <button className="icon-button" type="button" onClick={exportStudySnapshot} aria-label="Export study snapshot">
            <Download size={18} />
          </button>
        </div>
        <div className="scrubber-wrap">
          <input
            aria-label="Scrub through cardiac cycle"
            type="range"
            min="0"
            max={clock.cycleMs}
            step="1"
            value={clock.timeMs}
            onChange={(event) => setTimeMs(Number(event.target.value))}
          />
          <div className="phase-markers" aria-hidden="true">
            <span style={{ left: `${(scenario.timing.pPeakMs / scenario.timing.cycleMs) * 100}%` }}>P</span>
            <span style={{ left: `${(scenario.timing.qrsPeakMs / scenario.timing.cycleMs) * 100}%` }}>QRS</span>
            {state.mechanical.sounds.map((sound) => (
              <span className="sound-marker" style={{ left: `${sound.normalizedTime * 100}%` }} key={sound.id}>{sound.label}</span>
            ))}
            <span style={{ left: `${(scenario.timing.tPeakMs / scenario.timing.cycleMs) * 100}%` }}>T</span>
          </div>
        </div>
      </section>

      <section className="layer-panel" aria-label="Layer controls and learner modes">
        <div className="learner-mode-controls" aria-label="Learner mode">
          {Object.entries(learnerModes).map(([mode, label]) => (
              <button
                key={mode}
                type="button"
                className={learnerMode === mode ? "active" : ""}
                onClick={() => applyLearnerMode(mode as LearnerMode)}
                aria-pressed={learnerMode === mode}
              >
                {label}
              </button>
          ))}
        </div>
        <div className="layer-groups">
          {(["Electrical", "Mechanical", "ECG"] as const).map((group) => (
            <fieldset className="layer-group" key={group}>
              <legend>{group}</legend>
              {layerLabels.filter((item) => item.group === group).map((item) => (
                <label key={item.key}>
                  <input
                    type="checkbox"
                    checked={visualLayers[item.key]}
                    onChange={() => toggleLayer(item.key)}
                    aria-keyshortcuts={
                      layerLabels.findIndex((candidate) => candidate.key === item.key) < 9
                        ? String(layerLabels.findIndex((candidate) => candidate.key === item.key) + 1)
                        : undefined
                    }
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </fieldset>
          ))}
        </div>
      </section>

      <section className="lesson-panel" aria-label="Guided lessons and quizzes">
        <div className="lesson-list" aria-label="Lesson navigation">
          {lessons.map((lesson, index) => (
            <button
              key={lesson.id}
              type="button"
              className={lesson.id === selectedLesson.id ? "active" : ""}
              onClick={() => startLesson(lesson)}
            >
              <span>Lesson {index + 1}</span>
              <strong>{lesson.title}</strong>
            </button>
          ))}
        </div>
        <div className="lesson-card">
          <p className="eyebrow">Guided lesson</p>
          <h2>{selectedLesson.title}</h2>
          <p>{selectedLesson.focus}</p>
          <div className="lesson-context">
            <span><strong>Lead</strong>{selectedLesson.lead}</span>
            <span><strong>Region</strong>{state.surfaceRegions.find((region) => region.id === selectedLesson.regionId)?.label ?? selectedLesson.regionId}</span>
            <span><strong>Time</strong>{selectedLesson.timeMs} ms</span>
            <span><strong>Scenario</strong>{getScenarioById(selectedLesson.scenarioId).name}</span>
            <span><strong>3D view</strong>{selectedLesson.cameraPreset}, {selectedLesson.anatomyViewMode}</span>
          </div>
          <p className="lesson-mesh-focus">{selectedLesson.meshFocus}</p>
          <div className="quiz-card" aria-label="Lesson quiz prompt">
            <p>{selectedLesson.prompt}</p>
            <div className="quiz-options">
              {selectedLesson.options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={quizChoiceId === option.id ? "selected" : ""}
                  onClick={() => setQuizChoiceId(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {selectedQuizChoice && (
              <p className={`quiz-feedback ${selectedQuizChoice.correct ? "correct" : "try-again"}`}>
                {selectedQuizChoice.feedback}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="comparison-panel" aria-label="Scenario comparison">
        <div>
          <p className="eyebrow">What changed?</p>
          <h2>{normalComparisonScenario.name} vs {comparisonScenario.name}</h2>
          <p className="comparison-copy">
            Compare the heart state first, then the {selectedLead} trace. Both scenarios are sampled at the same point in their cardiac cycle so timing shifts stay visible.
          </p>
          <div className="change-list">
            {(comparisonScenario.whatChanged ?? []).map((item) => <span key={item}>{item}</span>)}
          </div>
          <div className="scenario-compare-viewer" aria-label="Normal and comparison scenario heart-state viewer">
            <div className="scenario-compare-card baseline">
              <p className="eyebrow">Normal anchor</p>
              <h3>{normalComparisonScenario.name}</h3>
              <div className="scenario-heart-strip" aria-label="Normal active regions">
                {normalActiveRegions.map((region) => (
                  <span className={`tissue-pill ${region.state}`} key={region.id}>
                    {region.chamber} {region.state}
                  </span>
                ))}
              </div>
              <p>{normalComparisonState.phaseLabel}: {normalComparisonExplanation.polarity} {selectedLead} at {normalComparisonExplanation.voltage.toFixed(2)} mV.</p>
            </div>
            <div className="scenario-compare-card selected">
              <p className="eyebrow">Selected comparison</p>
              <h3>{comparisonScenario.name}</h3>
              <div className="scenario-heart-strip" aria-label="Comparison active regions">
                {comparisonActiveRegions.map((region) => (
                  <span className={`tissue-pill ${region.state}`} key={region.id}>
                    {region.chamber} {region.state}
                  </span>
                ))}
              </div>
              <p>{comparisonState.phaseLabel}: {comparisonExplanation.polarity} {selectedLead} at {comparisonExplanation.voltage.toFixed(2)} mV.</p>
            </div>
          </div>
        </div>
        <div className="comparison-metrics">
          <span><strong>Normal {selectedLead}</strong>{normalComparisonState.leadVoltages[selectedLead].toFixed(2)} mV, {leadPolarityLabel(normalComparisonState.leadVoltages[selectedLead])}</span>
          <span><strong>Comparison {selectedLead}</strong>{comparisonState.leadVoltages[selectedLead].toFixed(2)} mV, {leadPolarityLabel(comparisonState.leadVoltages[selectedLead])}</span>
          <span><strong>ECG delta</strong>{comparisonVoltageDelta >= 0 ? "+" : ""}{comparisonVoltageDelta.toFixed(2)} mV</span>
          <span><strong>QRS end shift</strong>{qrsEndDeltaMs >= 0 ? "+" : ""}{Math.round(qrsEndDeltaMs)} ms</span>
          <div className="lead-delta-meter" aria-label={`${selectedLead} comparison voltage delta`}>
            <span style={{ width: `${Math.min(100, Math.abs(comparisonVoltageDelta) * 80)}%` }} />
          </div>
          <p className="comparison-safety-note">Synthetic comparison only. These differences show how authored heart timing or vectors change generated leads; they are not clinical diagnostic criteria.</p>
        </div>
      </section>

      <section className="anatomy-panel">
        <div className="panel-heading compact">
          <div>
            <p className="eyebrow">Spatial anatomy view</p>
            <h2>Heart, electrodes, and selected lead</h2>
          </div>
          <p className="safety-note">Procedural anatomy, synchronized to the same teaching simulation as the 2D view.</p>
        </div>
        <TorsoScene3D
          state={state}
          selectedLead={selectedLead}
          selectedRegionId={regionInspection?.regionId}
          onSelectRegion={setSelectedRegionId}
          layers={visualLayers}
          cameraPreset={v3ViewState.cameraPreset}
          anatomyViewMode={v3ViewState.anatomyViewMode}
          surfaceMapMode={v3ViewState.surfaceMapMode}
          isochroneScope={v3ViewState.isochroneScope}
          highContrast={highContrast}
          reducedMotion={reducedMotion}
          onCameraPresetChange={(cameraPreset) => setV3ViewState((current) => ({ ...current, cameraPreset }))}
          onAnatomyViewModeChange={(anatomyViewMode) => setV3ViewState((current) => ({ ...current, anatomyViewMode }))}
          onSurfaceMapModeChange={(surfaceMapMode) => setV3ViewState((current) => ({ ...current, surfaceMapMode }))}
          onIsochroneScopeChange={(isochroneScope) => setV3ViewState((current) => ({ ...current, isochroneScope }))}
        />
        {regionInspection && (
          <div className="region-inspector" aria-label="Selected surface region inspection">
            <div className="region-panel">
              <p className="eyebrow">Selected region</p>
              <h3>{regionInspection.label}</h3>
              <p>{regionInspection.summary}</p>
              <div className="region-study-card" aria-label="Selected lead relationship for region">
                <p className="eyebrow">Study focus</p>
                <h4>{selectedLead} relationship: {regionInspection.selectedLeadRelationship}</h4>
                <p>{regionInspection.leadRelationshipSummary}</p>
              </div>
              <div className="region-state-explainer" aria-label="Tissue state explanation">
                <span>
                  <strong>Electrical state</strong>
                  {regionInspection.tissueStateExplanation}
                </span>
                <span>
                  <strong>Wavefront timing</strong>
                  {regionInspection.wavefrontTimingSummary}
                </span>
                <span>
                  <strong>Contributor class</strong>
                  {regionInspection.selectedLeadContributionClass ?? "weak"}
                </span>
              </div>
              <div className="region-timing-grid">
                <span>
                  <strong>Activation</strong>
                  {Math.round(regionInspection.activationTimeMs)} ms ({formatDelta(regionInspection.activationDeltaMs)})
                </span>
                <span>
                  <strong>Recovery</strong>
                  {Math.round(regionInspection.repolarizationTimeMs)} ms ({formatDelta(regionInspection.repolarizationDeltaMs)})
                </span>
                <span>
                  <strong>Contraction cue</strong>
                  {Math.round(regionInspection.contractionOnsetMs)} ms
                </span>
                <span>
                  <strong>Current state</strong>
                  {regionInspection.chamber}, {regionInspection.state}
                </span>
              </div>
              <div className="region-lead-groups">
                <span><strong>Best seen</strong>{regionInspection.bestSeenLeads.join(", ")}</span>
                <span><strong>Opposite</strong>{regionInspection.oppositeLeads.join(", ")}</span>
              </div>
              <p className="region-safety-note">{regionInspection.safetyNote}</p>
            </div>
            <div className="region-picker" aria-label="Keyboard surface region selection">
              {state.surfaceRegions.map((region) => (
                <button
                  key={region.id}
                  type="button"
                  className={region.id === regionInspection.regionId ? "active" : ""}
                  onClick={() => setSelectedRegionId(region.id)}
                >
                  <span>{region.label}</span>
                  <small>{region.chamber}, {Math.round(region.activationTimeMs)} ms</small>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="ecg-panel">
        <div className="panel-heading compact">
          <div>
            <p className="eyebrow">Generated 12-lead display</p>
            <h2>{state.phaseLabel}</h2>
          </div>
          <p className="safety-note">{scenario.disclaimer}</p>
        </div>
        {visualLayers.ecgGrid && (
          <EcgLeadGrid
            scenario={scenario}
            state={state}
            selectedLead={selectedLead}
            onSelectLead={setSelectedLead}
            referenceTrace={referenceTrace}
            regionInspection={visualLayers.contributionHighlights ? regionInspection : undefined}
            showLabels={visualLayers.ecgLabels}
            showRegionIndicators={visualLayers.contributionHighlights}
            highContrast={highContrast}
          />
        )}
        <div className="validation-panel" aria-label="Reference and validation summary">
          <div>
            <p className="eyebrow">Reference overlay</p>
            <p>{referenceTrace.label} ({referenceTrace.provenance}). {scenario.reference?.notes}</p>
          </div>
          <div className="render-profile" aria-label="V3 render budget profile">
            <p className="eyebrow">V3 render budget</p>
            <span>{v3RenderProfile.segmentCount} segments</span>
            <span>{v3RenderProfile.vertexCount} vertices</span>
            <span>{v3RenderProfile.faceCount} faces</span>
            <span>{v3RenderProfile.currentContourCount} current contours</span>
          </div>
          <div className="validation-checks">
            {validationReport.checks.map((check) => (
              <span className={check.status} key={check.id}>
                <strong>{check.label}</strong>
                {check.detail}
              </span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
