import { generateLeadTrace, leadOrder, type CardiacScenario, type LeadName, type ReferenceLeadTrace, type SimulationState } from "@ekg/cardio-engine";

type EcgLeadGridProps = {
  scenario: CardiacScenario;
  state: SimulationState;
  selectedLead: LeadName;
  onSelectLead: (lead: LeadName) => void;
  referenceTrace?: ReferenceLeadTrace;
  highContrast?: boolean;
};

const width = 220;
const height = 92;
const midline = height / 2;
const scaleY = 34;

function tracePath(scenario: CardiacScenario, lead: LeadName): string {
  return generateLeadTrace(scenario, lead, 220)
    .map((sample, index) => {
      const x = sample.normalizedTime * width;
      const y = midline - sample.voltage * scaleY;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function referencePath(referenceTrace: ReferenceLeadTrace): string {
  return referenceTrace.samples
    .map((sample, index) => {
      const x = sample.normalizedTime * width;
      const y = midline - sample.voltage * scaleY;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

export function EcgLeadGrid({ scenario, state, selectedLead, onSelectLead, referenceTrace, highContrast = false }: EcgLeadGridProps) {
  const cursorX = state.normalizedTime * width;

  return (
    <div className={`ecg-grid ${highContrast ? "high-contrast" : ""}`} aria-label="Synthetic 12 lead ECG grid">
      {leadOrder.map((lead) => {
        const isSelected = lead === selectedLead;
        const voltage = state.leadVoltages[lead];

        return (
          <button
            className={`lead-card ${isSelected ? "selected" : ""}`}
            key={lead}
            onClick={() => onSelectLead(lead)}
            type="button"
            aria-pressed={isSelected}
          >
            <span className="lead-header">
              <span>{lead}</span>
              <span>{voltage.toFixed(2)} mV</span>
            </span>
            <svg viewBox={`0 0 ${width} ${height}`} className="lead-trace" aria-hidden="true">
              <path className="minor-grid" d="M 0 23 H 220 M 0 46 H 220 M 0 69 H 220 M 44 0 V 92 M 88 0 V 92 M 132 0 V 92 M 176 0 V 92" />
              <line className="baseline" x1="0" y1={midline} x2={width} y2={midline} />
              {referenceTrace?.lead === lead && <path className="reference-trace" d={referencePath(referenceTrace)} />}
              <path className="trace" d={tracePath(scenario, lead)} />
              <line className="cursor" x1={cursorX} y1="0" x2={cursorX} y2={height} />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
