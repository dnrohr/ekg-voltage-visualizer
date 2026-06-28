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
  type PlaybackSpeed,
  type LeadName
} from "@ekg/cardio-engine";
import { EcgLeadGrid, HeartSchematic, SelectedLeadTrace } from "@ekg/cardio-render-2d";
import { TorsoScene3D, type TorsoScene3DLayers } from "@ekg/cardio-render-3d";
import "./styles.css";

const formatPotential = (value: number) =>
  `${value >= 0 ? "+" : ""}${value.toFixed(2)}`;

const formatRegionWeight = (value: number) =>
  `${value >= 0 ? "+" : ""}${value.toFixed(2)}`;

const formatDelta = (value: number) =>
  value >= 0 ? `${Math.round(value)} ms ago` : `in ${Math.abs(Math.round(value))} ms`;

type LearnerMode = "probe-to-heart" | "heart-to-probe" | "advanced";

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

type Lesson = {
  id: string;
  title: string;
  focus: string;
  lead: LeadName;
  regionId: string;
  timeMs: number;
  mode: LearnerMode;
  prompt: string;
  options: Array<{ id: string; label: string; correct: boolean; feedback: string }>;
};

const lessons: Lesson[] = [
  {
    id: "directional-view",
    title: "Lead as directional view",
    focus: "A lead rises when the dominant vector points toward its positive side.",
    lead: "II",
    regionId: "apical-ventricles",
    timeMs: 340,
    mode: "probe-to-heart",
    prompt: "At this moment, why is Lead II positive?",
    options: [
      { id: "toward", label: "The vector points toward Lead II's positive side.", correct: true, feedback: "Yes. Lead II is acting like a directional view of the dominant vector." },
      { id: "electrode", label: "Electricity travels down the Lead II wire.", correct: false, feedback: "Not quite. A lead is a voltage measurement, not a path that electricity travels along." }
    ]
  },
  {
    id: "limb-leads",
    title: "Limb leads",
    focus: "I, II, III, aVR, aVL, and aVF compare limb-electrode potentials from different frontal views.",
    lead: "aVR",
    regionId: "apical-ventricles",
    timeMs: 340,
    mode: "probe-to-heart",
    prompt: "Why is aVR often negative during this simplified QRS moment?",
    options: [
      { id: "away", label: "The main vector points away from aVR's positive side.", correct: true, feedback: "Right. aVR views from the right-arm positive side, opposite the dominant ventricular vector here." },
      { id: "broken", label: "The aVR electrode is inactive.", correct: false, feedback: "No. aVR is an augmented lead derived from limb electrodes; it is still a computed voltage." }
    ]
  },
  {
    id: "precordial",
    title: "Precordial leads",
    focus: "Chest leads compare local chest electrodes to the Wilson central terminal, so V1 and V5 can see different sides of ventricular activation.",
    lead: "V5",
    regionId: "lv-lateral",
    timeMs: 348,
    mode: "heart-to-probe",
    prompt: "Which selected-region leads should notice the LV lateral wall most directly?",
    options: [
      { id: "lateral", label: "I, aVL, V5, and V6.", correct: true, feedback: "Correct. The selected region metadata marks these as best-seen leads for the LV lateral wall." },
      { id: "right", label: "V1 and aVR only.", correct: false, feedback: "Those are opposite-side views for this selected region in the teaching model." }
    ]
  },
  {
    id: "qrs-propagation",
    title: "Normal ventricular depolarization",
    focus: "The wavefront moves from septum and apex toward later ventricular regions while ECG traces update continuously.",
    lead: "V1",
    regionId: "septal-right-facing",
    timeMs: 310,
    mode: "heart-to-probe",
    prompt: "What activates before the lateral LV wall in this model?",
    options: [
      { id: "septum", label: "The right-facing septum.", correct: true, feedback: "Yes. Septal activation begins early, before lateral LV activation." },
      { id: "late", label: "The basal ventricular ring only.", correct: false, feedback: "The basal ring is a later ventricular region in this teaching sequence." }
    ]
  },
  {
    id: "mechanical-delay",
    title: "Mechanical delay",
    focus: "Electrical activation precedes visible squeeze; isovolumetric phases can have closed valves with little volume change.",
    lead: "II",
    regionId: "septal-right-facing",
    timeMs: 364,
    mode: "advanced",
    prompt: "At isovolumetric contraction, what is the key mechanical lesson?",
    options: [
      { id: "delay", label: "Valves can be closed while volume stays nearly fixed.", correct: true, feedback: "Exactly. The visible squeeze and flow do not happen at the same instant as depolarization." },
      { id: "instant", label: "The ventricles instantly empty at QRS onset.", correct: false, feedback: "No. The model keeps ventricular volume high until ejection timing begins." }
    ]
  },
  {
    id: "reconstruct",
    title: "Reconstructing from leads",
    focus: "Use multiple lead views plus the region panel to infer which heart regions are active.",
    lead: "V6",
    regionId: "lv-lateral",
    timeMs: 350,
    mode: "advanced",
    prompt: "If V5/V6 are positive while V1 is opposite, what is the safest teaching inference?",
    options: [
      { id: "region", label: "The dominant view favors left/lateral ventricular regions in this model.", correct: true, feedback: "Good. Keep the inference model-scoped and educational, not diagnostic." },
      { id: "diagnosis", label: "This proves a specific clinical diagnosis.", correct: false, feedback: "No. The app is synthetic and educational; it does not diagnose." }
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
  const referenceTrace = React.useMemo(
    () => generateSyntheticReferenceTrace(scenario, selectedLead),
    [scenario, selectedLead]
  );
  const validationReport = React.useMemo(() => validateScenario(scenario), [scenario]);
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
      };
      if (preset.selectedLead && leadOrder.includes(preset.selectedLead)) setSelectedLead(preset.selectedLead);
      if (preset.selectedRegionId) setSelectedRegionId(preset.selectedRegionId);
      if (preset.learnerMode && preset.learnerMode in learnerModes) setLearnerMode(preset.learnerMode);
      if (preset.visualLayers) setVisualLayers((current) => ({ ...current, ...preset.visualLayers }));
      if (preset.scenarioId) setScenarioId(preset.scenarioId);
      if (preset.comparisonId) setComparisonId(preset.comparisonId);
      if (typeof preset.highContrast === "boolean") setHighContrast(preset.highContrast);
      if (typeof preset.reducedMotion === "boolean") setReducedMotion(preset.reducedMotion);
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
      JSON.stringify({ selectedLead, selectedRegionId, learnerMode, visualLayers, scenarioId, comparisonId, highContrast, reducedMotion })
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
    applyLearnerMode(lesson.mode);
  };

  const exportScreenshot = async () => {
    const canvas = document.querySelector<HTMLCanvasElement>(".scene3d-canvas canvas");
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `ekg-visualizer-${scenario.id}-${selectedLead}.png`;
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
          </div>
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
          <h2>{scenario.name} vs {comparisonScenario.name}</h2>
          <div className="change-list">
            {(comparisonScenario.whatChanged ?? []).map((item) => <span key={item}>{item}</span>)}
          </div>
        </div>
        <div className="comparison-metrics">
          <span><strong>{scenario.name}</strong>{state.leadVoltages[selectedLead].toFixed(2)} mV in {selectedLead}</span>
          <span><strong>{comparisonScenario.name}</strong>{comparisonState.leadVoltages[selectedLead].toFixed(2)} mV in {selectedLead}</span>
          <span><strong>Delta</strong>{(comparisonExplanation.voltage - explanation.voltage).toFixed(2)} mV</span>
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
