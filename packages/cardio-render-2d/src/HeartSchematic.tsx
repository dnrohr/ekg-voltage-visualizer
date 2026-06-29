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
  const phaseHeadline = state.phaseLabel.split(":")[0];

  return (
    <svg className="heart-schematic" viewBox="0 0 360 340" role="img" aria-label="2D heart activation schematic">
      <defs>
        <linearGradient id="heartWallGradient" x1="96" y1="84" x2="260" y2="286" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f3aaa1" />
          <stop offset="0.46" stopColor="#d96b61" />
          <stop offset="1" stopColor="#9f403b" />
        </linearGradient>
        <linearGradient id="rightHeartGradient" x1="104" y1="118" x2="188" y2="268" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#8bd4cf" />
          <stop offset="1" stopColor="#2f9289" />
        </linearGradient>
        <linearGradient id="leftHeartGradient" x1="190" y1="116" x2="252" y2="278" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f2a69a" />
          <stop offset="1" stopColor="#c94a43" />
        </linearGradient>
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

      <rect x="20" y="18" width="320" height="300" rx="10" className="torso-panel" />
      <path className="torso-outline" d="M109 40 C78 78 65 130 69 202 C72 260 113 301 180 301 C247 301 288 260 291 202 C295 130 282 78 251 40" />
      <path className="thorax-midline" d="M180 48 C175 104 175 168 180 292" />

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

      <g className="anatomical-heart" aria-hidden="true">
        <path className="heart-shadow" d="M114 118 C104 152 100 201 123 238 C141 267 169 287 184 292 C215 280 249 250 258 205 C266 164 244 127 214 112 C198 89 163 84 144 106 C132 104 120 109 114 118 Z" />
        <path className="great-vessel aorta" d="M177 103 C180 62 225 62 230 96 C234 121 210 131 198 145" />
        <path className="great-vessel pulmonary" d="M168 117 C138 100 116 104 99 126" />
        <path className="great-vessel vena-cava" d="M137 77 C141 99 143 118 142 142" />
        <g transform={`translate(178 124) scale(${atrialScale}) translate(-178 -124)`}>
          <path className="atrium right" d="M121 116 C119 88 148 78 168 96 C178 108 175 138 153 149 C135 157 122 142 121 116 Z" />
          <path className="atrium left" d="M193 96 C217 77 249 92 251 124 C252 151 226 166 204 150 C185 136 176 111 193 96 Z" />
        </g>
        <g transform={`translate(181 214) scale(${ventricularScale}) translate(-181 -214)`}>
          <path className="ventricle right" style={{ strokeWidth: 1.7 + wallThickening * 2.2 }} d="M137 143 C102 174 107 229 142 258 C157 271 174 282 186 288 C178 231 174 180 137 143 Z" />
          <path className="ventricle left" style={{ strokeWidth: 1.9 + wallThickening * 2.6 }} d="M211 143 C251 168 263 222 232 260 C217 278 198 288 186 292 C192 229 187 178 211 143 Z" />
          <path className="heart-body" d="M128 140 C112 166 104 205 119 237 C134 269 170 290 187 296 C215 282 247 253 255 211 C263 169 240 137 212 127 C198 116 177 115 164 128 C152 125 139 130 128 140 Z" />
        </g>
        <path className="septum" d="M176 142 C170 187 172 236 186 292" />
      </g>

      <g className="valve-layer" aria-hidden="true">
        <line className="valve av" x1="134" y1="150" x2="165" y2="158" opacity={0.35 + avValveOpen * 0.65} />
        <line className="valve av" x1="195" y1="158" x2="226" y2="150" opacity={0.35 + avValveOpen * 0.65} />
        <line className="valve semilunar" x1="158" y1="134" x2="172" y2="118" opacity={0.35 + semilunarOpen * 0.65} />
        <line className="valve semilunar" x1="188" y1="118" x2="202" y2="134" opacity={0.35 + semilunarOpen * 0.65} />
        <text x="238" y="82" className="mechanical-mini-label">{state.mechanical.activeSound?.label ?? state.mechanical.phaseLabel}</text>
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
      <path className="conduction" d="M130 92 C145 112 157 128 173 141 C178 170 180 210 186 270" />

      <g className="activation-edges" aria-hidden="true">
        <path d="M121 86 C136 105 148 117 144 128 C154 132 164 136 176 132 C180 159 181 197 184 270 C162 242 150 221 150 208 M184 270 C205 236 219 211 226 216 M226 216 C223 184 215 164 205 162" />
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
      <g className="schematic-status" transform="translate(222 52)">
        <rect x="0" y="0" width="104" height="42" rx="8" />
        <text x="10" y="17">{phaseHeadline}</text>
        <text x="10" y="32">{state.mechanical.activeSound?.label ?? state.mechanical.flow.label}</text>
      </g>
    </svg>
  );
}
