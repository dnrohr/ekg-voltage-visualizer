import {
  generateLeadTrace,
  leadOrder,
  type CardiacScenario,
  type LeadName,
  type LeadProbeExplanation,
  type ReferenceLeadTrace,
  type RegionLeadInspection,
  type SimulationState
} from "@ekg/cardio-engine";

type EcgLeadGridProps = {
  scenario: CardiacScenario;
  state: SimulationState;
  selectedLead: LeadName;
  onSelectLead: (lead: LeadName) => void;
  referenceTrace?: ReferenceLeadTrace;
  regionInspection?: RegionLeadInspection;
  showLabels?: boolean;
  showRegionIndicators?: boolean;
  highContrast?: boolean;
};

type SelectedLeadTraceProps = {
  scenario: CardiacScenario;
  state: SimulationState;
  selectedLead: LeadName;
  probe: LeadProbeExplanation;
  referenceTrace?: ReferenceLeadTrace;
  showLabels?: boolean;
  showProjectionMarker?: boolean;
  highContrast?: boolean;
};

const width = 220;
const height = 92;
const midline = height / 2;
const scaleY = 34;
const probeWidth = 500;
const probeHeight = 156;
const probeMidline = probeHeight / 2;
const probeScaleY = 52;

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

function largeTracePath(scenario: CardiacScenario, lead: LeadName): string {
  return generateLeadTrace(scenario, lead, 300)
    .map((sample, index) => {
      const x = sample.normalizedTime * probeWidth;
      const y = probeMidline - sample.voltage * probeScaleY;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function largeReferencePath(referenceTrace: ReferenceLeadTrace): string {
  return referenceTrace.samples
    .map((sample, index) => {
      const x = sample.normalizedTime * probeWidth;
      const y = probeMidline - sample.voltage * probeScaleY;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

export function SelectedLeadTrace({
  scenario,
  state,
  selectedLead,
  probe,
  referenceTrace,
  showLabels = true,
  showProjectionMarker = true,
  highContrast = false
}: SelectedLeadTraceProps) {
  const cursorX = state.normalizedTime * probeWidth;
  const markerY = Math.max(14, Math.min(probeHeight - 14, probeMidline - probe.markerVoltage * probeScaleY));
  const markerClass = probe.markerVoltage > 0.04 ? "positive" : probe.markerVoltage < -0.04 ? "negative" : "flat";

  return (
    <div className={`selected-lead-trace ${highContrast ? "high-contrast" : ""}`} aria-label={`${selectedLead} enlarged live trace`}>
      {showLabels && (
        <div className="selected-lead-trace-header">
          <span>{selectedLead}</span>
          <span>{probe.markerVoltage.toFixed(2)} mV</span>
        </div>
      )}
      <svg viewBox={`0 0 ${probeWidth} ${probeHeight}`} className="lead-probe-svg" role="img" aria-label={`${selectedLead} trace with current voltage marker`}>
        <path
          className="minor-grid"
          d="M 0 39 H 500 M 0 78 H 500 M 0 117 H 500 M 100 0 V 156 M 200 0 V 156 M 300 0 V 156 M 400 0 V 156"
        />
        <line className="baseline" x1="0" y1={probeMidline} x2={probeWidth} y2={probeMidline} />
        {referenceTrace?.lead === selectedLead && <path className="reference-trace" d={largeReferencePath(referenceTrace)} />}
        <path className="trace" d={largeTracePath(scenario, selectedLead)} />
        <line className="cursor" x1={cursorX} y1="0" x2={cursorX} y2={probeHeight} />
        {showProjectionMarker && (
          <>
            <line className={`projection-stem ${markerClass}`} x1={cursorX} y1={probeMidline} x2={cursorX} y2={markerY} />
            <circle className={`projection-marker ${markerClass}`} cx={cursorX} cy={markerY} r="8" />
            {showLabels && (
              <text className="projection-label" x={Math.min(probeWidth - 120, cursorX + 12)} y={Math.max(18, markerY - 10)}>
                projection {probe.markerVoltage.toFixed(2)} mV
              </text>
            )}
          </>
        )}
      </svg>
    </div>
  );
}

export function EcgLeadGrid({
  scenario,
  state,
  selectedLead,
  onSelectLead,
  referenceTrace,
  regionInspection,
  showLabels = true,
  showRegionIndicators = true,
  highContrast = false
}: EcgLeadGridProps) {
  const cursorX = state.normalizedTime * width;
  const regionActivationX = regionInspection && scenario.timing.cycleMs > 0
    ? (regionInspection.activationTimeMs / scenario.timing.cycleMs) * width
    : 0;

  return (
    <div className={`ecg-grid ${highContrast ? "high-contrast" : ""}`} aria-label="Synthetic 12 lead ECG grid">
      {leadOrder.map((lead) => {
        const isSelected = lead === selectedLead;
        const voltage = state.leadVoltages[lead];
        const indicator = showRegionIndicators ? regionInspection?.leadIndicators.find((item) => item.lead === lead) : undefined;
        const regionClass = indicator ? `region-${indicator.relationship}` : "";

        return (
          <button
            className={`lead-card ${isSelected ? "selected" : ""} ${regionClass}`}
            key={lead}
            onClick={() => onSelectLead(lead)}
            type="button"
            aria-pressed={isSelected}
          >
            {showLabels && (
              <span className="lead-header">
                <span>{lead}</span>
                <span>{indicator ? indicator.relationship : `${voltage.toFixed(2)} mV`}</span>
              </span>
            )}
            <svg viewBox={`0 0 ${width} ${height}`} className="lead-trace" aria-hidden="true">
              <path className="minor-grid" d="M 0 23 H 220 M 0 46 H 220 M 0 69 H 220 M 44 0 V 92 M 88 0 V 92 M 132 0 V 92 M 176 0 V 92" />
              <line className="baseline" x1="0" y1={midline} x2={width} y2={midline} />
              {referenceTrace?.lead === lead && <path className="reference-trace" d={referencePath(referenceTrace)} />}
              <path className="trace" d={tracePath(scenario, lead)} />
              {indicator && <line className={`region-activation-marker ${indicator.relationship}`} x1={regionActivationX} y1="0" x2={regionActivationX} y2={height} />}
              <line className="cursor" x1={cursorX} y1="0" x2={cursorX} y2={height} />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
