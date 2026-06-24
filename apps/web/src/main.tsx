import React from "react";
import ReactDOM from "react-dom/client";
import { Pause, Play, RotateCcw } from "lucide-react";
import {
  evaluateScenario,
  explainLead,
  leadOrder,
  normalSinusRhythmScenario,
  type LeadName
} from "@ekg/cardio-engine";
import { EcgLeadGrid, HeartSchematic } from "@ekg/cardio-render-2d";
import "./styles.css";

function App() {
  const [time, setTime] = React.useState(0.425);
  const [selectedLead, setSelectedLead] = React.useState<LeadName>("II");
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [speed, setSpeed] = React.useState(1);
  const lastFrame = React.useRef<number | null>(null);
  const state = React.useMemo(
    () => evaluateScenario(normalSinusRhythmScenario, time),
    [time]
  );
  const explanation = React.useMemo(
    () => explainLead(state, selectedLead),
    [selectedLead, state]
  );

  React.useEffect(() => {
    if (!isPlaying) {
      lastFrame.current = null;
      return;
    }

    let frame = 0;
    const tick = (now: number) => {
      if (lastFrame.current !== null) {
        const elapsedMs = now - lastFrame.current;
        setTime((current) => (current + (elapsedMs / normalSinusRhythmScenario.timing.cycleMs) * speed) % 1);
      }

      lastFrame.current = now;
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [isPlaying, speed]);

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
          <HeartSchematic state={state} />
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
            </dl>
            <p>{explanation.summary}</p>
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
            <span style={{ left: "10%" }}>P</span>
            <span style={{ left: "38%" }}>QRS</span>
            <span style={{ left: "55%" }}>ST</span>
            <span style={{ left: "76%" }}>T</span>
          </div>
        </div>
      </section>

      <section className="ecg-panel">
        <div className="panel-heading compact">
          <div>
            <p className="eyebrow">Generated 12-lead display</p>
            <h2>{state.phaseLabel}</h2>
          </div>
          <p className="safety-note">{normalSinusRhythmScenario.disclaimer}</p>
        </div>
        <EcgLeadGrid
          scenario={normalSinusRhythmScenario}
          state={state}
          selectedLead={selectedLead}
          onSelectLead={setSelectedLead}
        />
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
