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
const mapHeartX = (x: number) => 180 + x * 145;
const mapHeartY = (z: number) => 172 - z * 180;

function terminalWeight(lead: LeadName, terminal: "positiveTerminal" | "negativeTerminal", electrode: ElectrodeName): number {
  return leadDefinitions[lead][terminal].weights[electrode] ?? 0;
}

export function HeartSchematic({ state, selectedLead }: HeartSchematicProps) {
  const atrialGlow = state.phaseProgress.atrialDepolarization;
  const ventricularGlow = state.phaseProgress.ventricularDepolarization;
  const recoveryGlow = state.phaseProgress.ventricularRepolarization;
  const atrialScale = 1 - state.mechanical.chamber.atrialContraction * 0.08;
  const ventricularScale = 1 - state.mechanical.chamber.ventricularContraction * 0.11;
  const wallThickening = state.mechanical.chamber.wallThickening;
  const avValveOpen = state.mechanical.valves.mitral.openFraction;
  const semilunarOpen = state.mechanical.valves.aortic.openFraction;
  const flowIntensity = state.mechanical.flow.intensity;
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

      <g transform={`translate(178 112) scale(${atrialScale}) translate(-178 -112)`}>
        <ellipse className="atrium right" cx="143" cy="112" rx="44" ry="38" />
        <ellipse className="atrium left" cx="213" cy="112" rx="44" ry="38" />
      </g>
      <g transform={`translate(176 214) scale(${ventricularScale}) translate(-176 -214)`}>
        <path className="ventricle right" style={{ strokeWidth: 2 + wallThickening * 3 }} d="M126 143 C88 188 111 260 175 286 C172 218 164 177 126 143 Z" />
        <path className="ventricle left" style={{ strokeWidth: 2 + wallThickening * 3 }} d="M226 143 C272 185 250 260 175 286 C184 214 189 174 226 143 Z" />
      </g>
      <path className="septum" d="M175 142 C166 184 164 229 175 286" />

      <g className="valve-layer" aria-hidden="true">
        <line className="valve av" x1="134" y1="150" x2="165" y2="158" opacity={0.35 + avValveOpen * 0.65} />
        <line className="valve av" x1="195" y1="158" x2="226" y2="150" opacity={0.35 + avValveOpen * 0.65} />
        <line className="valve semilunar" x1="158" y1="134" x2="172" y2="118" opacity={0.35 + semilunarOpen * 0.65} />
        <line className="valve semilunar" x1="188" y1="118" x2="202" y2="134" opacity={0.35 + semilunarOpen * 0.65} />
        <text x="246" y="92" className="mechanical-mini-label">{state.mechanical.activeSound?.label ?? state.mechanical.phaseLabel}</text>
      </g>

      {flowIntensity > 0 && (
        <g className={`flow-layer ${state.mechanical.flow.region}`} opacity={0.22 + flowIntensity * 0.58} aria-hidden="true">
          {state.mechanical.flow.region === "aortic-ejection" || state.mechanical.flow.region === "pulmonary-ejection" ? (
            <>
              <path d="M160 146 C150 111 142 88 126 58" />
              <path d="M203 146 C215 108 227 84 250 58" />
            </>
          ) : (
            <>
              <path d="M120 90 C132 122 148 140 164 164" />
              <path d="M238 90 C222 122 206 140 190 164" />
            </>
          )}
        </g>
      )}

      <circle className="node sa" cx="127" cy="88" r={5 + atrialGlow * 6} />
      <circle className="node av" cx="174" cy="141" r={4} />
      <path className="conduction" d="M130 92 C145 112 157 128 173 141 C178 170 178 210 176 270" />

      <g className="activation-edges" aria-hidden="true">
        <path d="M119 78 C132 99 143 111 139 122 C150 127 159 133 174 129 C178 157 178 192 171 269 C151 239 141 219 142 208 M171 269 C197 231 215 211 221 215 M221 215 C219 183 213 164 206 165" />
      </g>

      <g className="tissue-node-layer">
        {state.tissueNodes.map((node) => {
          const x = mapHeartX(node.position.x);
          const y = mapHeartY(node.position.z);
          const isChanging = node.state === "depolarizing" || node.state === "repolarizing";

          return (
            <g className={`tissue-node ${node.state}`} key={node.id} transform={`translate(${x} ${y})`}>
              <circle r={isChanging ? 7 : 5} />
              <title>{`${node.label}: ${node.state}`}</title>
            </g>
          );
        })}
      </g>

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
      <text className="mechanical-label" x="34" y="318">{state.mechanical.phaseLabel}: {state.mechanical.flow.label}</text>
    </svg>
  );
}
