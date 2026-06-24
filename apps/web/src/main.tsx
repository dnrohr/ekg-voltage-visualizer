import React from "react";
import ReactDOM from "react-dom/client";
import { Camera, Contrast, Pause, Play, RotateCcw, Save, SkipBack, SkipForward } from "lucide-react";
import {
  evaluateScenario,
  explainLead,
  generateSyntheticReferenceTrace,
  getScenarioById,
  leadOrder,
  scenarioLibrary,
  validateScenario,
  type LeadName
} from "@ekg/cardio-engine";
import { EcgLeadGrid, HeartSchematic } from "@ekg/cardio-render-2d";
import { TorsoScene3D } from "@ekg/cardio-render-3d";
import "./styles.css";

const formatPotential = (value: number) =>
  `${value >= 0 ? "+" : ""}${value.toFixed(2)}`;

function App() {
  const [time, setTime] = React.useState(0.425);
  const [selectedLead, setSelectedLead] = React.useState<LeadName>("II");
  const [scenarioId, setScenarioId] = React.useState("normal-sinus-rhythm");
  const [comparisonId, setComparisonId] = React.useState("right-bundle-branch-block");
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [speed, setSpeed] = React.useState(1);
  const [highContrast, setHighContrast] = React.useState(false);
  const [reducedMotion, setReducedMotion] = React.useState(false);
  const lastFrame = React.useRef<number | null>(null);
  const scenario = React.useMemo(() => getScenarioById(scenarioId), [scenarioId]);
  const comparisonScenario = React.useMemo(() => getScenarioById(comparisonId), [comparisonId]);
  const state = React.useMemo(
    () => evaluateScenario(scenario, time),
    [scenario, time]
  );
  const comparisonState = React.useMemo(
    () => evaluateScenario(comparisonScenario, time),
    [comparisonScenario, time]
  );
  const explanation = React.useMemo(
    () => explainLead(state, selectedLead),
    [selectedLead, state]
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
    if (!isPlaying || reducedMotion) {
      lastFrame.current = null;
      return;
    }

    let frame = 0;
    const tick = (now: number) => {
      if (lastFrame.current !== null) {
        const elapsedMs = now - lastFrame.current;
        setTime((current) => (current + (elapsedMs / scenario.timing.cycleMs) * speed) % 1);
      }

      lastFrame.current = now;
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [isPlaying, reducedMotion, scenario, speed]);

  React.useEffect(() => {
    const stored = window.localStorage.getItem("ekg-view-preset");
    if (!stored) return;

    try {
      const preset = JSON.parse(stored) as {
        selectedLead?: LeadName;
        scenarioId?: string;
        comparisonId?: string;
        highContrast?: boolean;
        reducedMotion?: boolean;
      };
      if (preset.selectedLead && leadOrder.includes(preset.selectedLead)) setSelectedLead(preset.selectedLead);
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
        setTime((current) => (current + 0.01) % 1);
      } else if (event.key === "ArrowLeft") {
        setTime((current) => (current - 0.01 + 1) % 1);
      } else if (event.key.toLowerCase() === "l") {
        setSelectedLead((current) => leadOrder[(leadOrder.indexOf(current) + 1) % leadOrder.length]);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const savePreset = () => {
    window.localStorage.setItem(
      "ekg-view-preset",
      JSON.stringify({ selectedLead, scenarioId, comparisonId, highContrast, reducedMotion })
    );
  };

  const exportScreenshot = async () => {
    const canvas = document.querySelector<HTMLCanvasElement>(".scene3d-canvas canvas");
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `ekg-visualizer-${scenario.id}-${selectedLead}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <main className="app-shell">
      <section className="simulator-top">
        <div className="heart-panel" aria-label="Heart electrical state">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Synthetic teaching beat</p>
              <h1>EKG Voltage Visualizer</h1>
            </div>
            <p className="time-readout">{Math.round(state.timeMs)} ms</p>
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
            <div className="mechanical-summary" aria-label="Current mechanical state">
              <p className="eyebrow">Mechanical phase</p>
              <h3>{state.mechanical.phaseLabel}</h3>
              <p>{state.mechanical.phaseExplanation}</p>
              <div className="valve-grid">
                {Object.values(state.mechanical.valves).map((valve) => (
                  <span key={valve.name}>
                    <strong>{valve.label}</strong>
                    {Math.round(valve.openFraction * 100)}% open
                  </span>
                ))}
              </div>
              <p className="flow-line">{state.mechanical.flow.label}: {state.mechanical.flow.direction}</p>
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
          <button className="icon-button" type="button" onClick={() => setIsPlaying((value) => !value)} aria-label={isPlaying ? "Pause beat animation" : "Play beat animation"}>
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button className="icon-button" type="button" onClick={() => setTime(0)} aria-label="Reset to start">
            <RotateCcw size={18} />
          </button>
          <button className="icon-button" type="button" onClick={() => setTime((value) => (value - 0.02 + 1) % 1)} aria-label="Step backward">
            <SkipBack size={18} />
          </button>
          <button className="icon-button" type="button" onClick={() => setTime((value) => (value + 0.02) % 1)} aria-label="Step forward">
            <SkipForward size={18} />
          </button>
          <div className="speed-control" aria-label="Playback speed">
            {[0.5, 1, 2].map((value) => (
              <button
                key={value}
                type="button"
                className={speed === value ? "active" : ""}
                onClick={() => setSpeed(value)}
              >
                {value}x
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
        </div>
        <div className="scrubber-wrap">
          <input
            aria-label="Scrub through cardiac cycle"
            type="range"
            min="0"
            max="1"
            step="0.001"
            value={time}
            onChange={(event) => setTime(Number(event.target.value))}
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
        <TorsoScene3D state={state} selectedLead={selectedLead} />
      </section>

      <section className="ecg-panel">
        <div className="panel-heading compact">
          <div>
            <p className="eyebrow">Generated 12-lead display</p>
            <h2>{state.phaseLabel}</h2>
          </div>
          <p className="safety-note">{scenario.disclaimer}</p>
        </div>
        <EcgLeadGrid
          scenario={scenario}
          state={state}
          selectedLead={selectedLead}
          onSelectLead={setSelectedLead}
          referenceTrace={referenceTrace}
          highContrast={highContrast}
        />
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
