import {
  electrodeDefinitions,
  electrodeOrder,
  leadDefinitions,
  type ElectrodeName,
  type LeadName,
  type SimulationState
} from "@ekg/cardio-engine";

type HeartSchematicProps = {
  state: SimulationState;
  selectedLead: LeadName;
};

const lerp = (start: number, end: number, amount: number) =>
  start + (end - start) * Math.min(1, Math.max(0, amount));

const mapX = (x: number) => 180 + x * 118;
const mapY = (z: number) => 172 - z * 142;

function terminalWeight(lead: LeadName, terminal: "positiveTerminal" | "negativeTerminal", electrode: ElectrodeName): number {
  return leadDefinitions[lead][terminal].weights[electrode] ?? 0;
}

export function HeartSchematic({ state, selectedLead }: HeartSchematicProps) {
  const atrialGlow = state.phaseProgress.atrialDepolarization;
  const ventricularGlow = state.phaseProgress.ventricularDepolarization;
  const recoveryGlow = state.phaseProgress.ventricularRepolarization;
  const vectorLength = Math.min(92, Math.hypot(state.netVector.x, state.netVector.z) * 76);
  const vectorAngle = Math.atan2(-state.netVector.z, state.netVector.x);
  const vectorEndX = 180 + Math.cos(vectorAngle) * vectorLength;
  const vectorEndY = 186 + Math.sin(vectorAngle) * vectorLength;
  const qrsY = lerp(116, 248, ventricularGlow);
  const tY = lerp(248, 138, recoveryGlow);
  const selectedDefinition = leadDefinitions[selectedLead];

  return (
    <svg className="heart-schematic" viewBox="0 0 360 340" role="img" aria-label="2D heart activation schematic">
      <defs>
        <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#1f2937" />
        </marker>
      </defs>

      <rect x="22" y="18" width="316" height="298" rx="10" className="torso-panel" />
      <path className="torso-outline" d="M110 42 C78 78 64 130 68 204 C71 264 112 302 180 302 C248 302 289 264 292 204 C296 130 282 78 250 42" />

      <g className="electrode-layer" aria-hidden="true">
        {electrodeOrder.map((electrodeName) => {
          const electrode = electrodeDefinitions[electrodeName];
          const positiveWeight = terminalWeight(selectedLead, "positiveTerminal", electrodeName);
          const negativeWeight = terminalWeight(selectedLead, "negativeTerminal", electrodeName);
          const terminalClass =
            positiveWeight > 0
              ? "positive"
              : negativeWeight > 0
                ? "negative"
                : electrode.role === "ground"
                  ? "ground"
                  : "";
          const radius = positiveWeight > 0 || negativeWeight > 0 ? 8 : 5;

          return (
            <g
              className={`electrode-marker ${terminalClass}`}
              key={electrodeName}
              transform={`translate(${mapX(electrode.position.x)} ${mapY(electrode.position.z)})`}
            >
              <circle r={radius} />
              <text x="0" y={radius + 12}>{electrodeName}</text>
            </g>
          );
        })}
        <text className="lead-terminal-label positive" x="32" y="42">+ {selectedDefinition.positiveTerminal.label}</text>
        <text className="lead-terminal-label negative" x="32" y="60">- {selectedDefinition.negativeTerminal.label}</text>
      </g>

      <ellipse className="atrium right" cx="143" cy="112" rx="44" ry="38" />
      <ellipse className="atrium left" cx="213" cy="112" rx="44" ry="38" />
      <path className="ventricle right" d="M126 143 C88 188 111 260 175 286 C172 218 164 177 126 143 Z" />
      <path className="ventricle left" d="M226 143 C272 185 250 260 175 286 C184 214 189 174 226 143 Z" />
      <path className="septum" d="M175 142 C166 184 164 229 175 286" />

      <circle className="node sa" cx="127" cy="88" r={5 + atrialGlow * 6} />
      <circle className="node av" cx="174" cy="141" r={4} />
      <path className="conduction" d="M130 92 C145 112 157 128 173 141 C178 170 178 210 176 270" />

      {atrialGlow > 0.03 && (
        <circle className="wave atrial" cx={lerp(128, 218, atrialGlow)} cy={lerp(89, 121, atrialGlow)} r={22 + atrialGlow * 28} opacity={0.2 + atrialGlow * 0.42} />
      )}

      {ventricularGlow > 0.03 && (
        <ellipse className="wave ventricular" cx={lerp(172, 188, ventricularGlow)} cy={qrsY} rx={62} ry={18 + ventricularGlow * 24} opacity={0.2 + ventricularGlow * 0.48} />
      )}

      {recoveryGlow > 0.03 && (
        <ellipse className="wave recovery" cx={196} cy={tY} rx={48 + recoveryGlow * 18} ry={26} opacity={0.18 + recoveryGlow * 0.36} />
      )}

      <line className="net-vector" x1="180" y1="186" x2={vectorEndX} y2={vectorEndY} markerEnd="url(#arrow)" />
      <text className="schematic-label" x="34" y="300">{state.phaseLabel}</text>
    </svg>
  );
}
