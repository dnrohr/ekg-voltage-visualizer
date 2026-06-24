# ROADMAP.md — Cardiac Cycle / 12‑Lead ECG Visualizer

**Project goal:** Build an educational app that makes 12‑lead ECG voltages physically intuitive by relating measured body-surface potential differences to the propagation of depolarization and repolarization through cardiac muscle, then layering in contraction, valve motion, and eventually stylized blood movement.

**Working name:** `cardiac-cycle-visualizer`  
**Generated:** 2026-06-24  
**Primary audience:** learners who know the ECG tracing but do not yet have a physical intuition for why each lead deflects upward/downward during P, QRS, ST, and T.  
**Important non-goal:** This is **not** a diagnostic or clinical decision-support tool. It should be positioned as a physiology and signal-formation teaching simulator.

---

## 1. Product Thesis

The app should answer one question extremely well:

> At this instant in the cardiac cycle, what parts of the heart are electrically active, where is depolarization or repolarization propagating, and why do the 12 ECG leads measure the voltages they do?

The core experience should be a synchronized view of:

1. A heart model showing depolarization/repolarization propagation.
2. Electrode/lead geometry on a simplified torso.
3. Live 12‑lead ECG traces with a moving time cursor.
4. Explanatory overlays connecting cardiac electrical state to lead polarity and amplitude.
5. Optional mechanical layers: contraction, valve state, chamber volume, and stylized blood flow.

The app should favor **physically honest simplification** over visual realism. A beautiful false explanation would be worse than a simple, transparent approximation.

---

## 2. Conceptual Corrections and Teaching Commitments

### 2.1 What “voltage propagation” means here

In this roadmap, “voltage propagation” means the **propagation of depolarization/repolarization through the myocardium**, not propagation along ECG leads.

The ECG leads do not carry a wave through the body. They measure changing **potential differences** on the body surface created by the heart’s evolving electrical source distribution.

### 2.2 Main teaching model

The central teaching model should be:

```text
myocardial activation state over time
        ↓
electrical source distribution / dipoles inside the heart
        ↓
potentials induced at torso electrodes
        ↓
lead definitions: I, II, III, aVR, aVL, aVF, V1–V6
        ↓
12 ECG waveforms
```

This is more accurate than saying “lead II points this way, so the wave goes up,” but the lead-axis/vector explanation can still be used as an introductory overlay.

### 2.3 Lead explanation hierarchy

The app should support at least three explanation levels:

**Level 1 — Intuitive vector model**  
A moving net cardiac vector is projected onto each lead. This is easiest to understand and should be the first mental model shown.

**Level 2 — Coarse distributed dipole model**  
Multiple active heart regions contribute to potential at each electrode. This explains why chest leads are not merely limb-lead-like projections.

**Level 3 — Reference/high-fidelity mode**  
Precomputed or reference ECG traces and potential maps can be synchronized to the animation. This is for realism, not for first-principles computation inside the app.

---

## 3. Overall Feasibility

### 3.1 Feasibility summary

| Capability | Feasibility | Difficulty | Recommendation |
|---|---:|---:|---|
| 2D depolarization animation | Very high | Medium | Build first. |
| Synthetic 12‑lead ECG traces | High | Medium | Build with a vector/dipole hybrid model. |
| Interactive scrubber through P/QRS/T | Very high | Low–Medium | Core MVP feature. |
| Lead/electrode geometry visualization | High | Medium | Essential for intuition. |
| 3D heart model | High | Medium | Use public assets or procedural primitives initially. |
| 3D depolarization wavefront | High | Medium–High | Requires good data structures and shader/mesh design. |
| Valves opening/closing | High | Medium | Use phase-based animation. |
| Simplified contraction | Medium–High | Medium–High | Use authored animation curves, not mechanics simulation. |
| Stylized blood flow | Medium–High | High | Use particles/arrows/volumes, not CFD. |
| Full electrophysiology simulation | Low for MVP | Very high | Optional offline reference path only. |
| Full fluid dynamics | Low for MVP | Very high | Out of scope except as precomputed reference. |

### 3.2 Recommended strategy

Do **not** begin by trying to simulate a real heart from scratch. Begin with a simplified educational engine, then add visual richness and optional reference data.

The project should evolve through four fidelity tiers:

1. **Schematic tier:** 2D heart diagram + activation timeline + generated ECGs.
2. **Geometric tier:** simplified 3D heart/torso/electrodes + coarse dipoles.
3. **Animated physiology tier:** valves, contraction, chamber phases, stylized flow.
4. **Reference-data tier:** synchronized real or high-fidelity precomputed examples.

---

## 4. Scope Boundaries

### 4.1 In scope

- Normal sinus rhythm teaching mode.
- 12‑lead lead formation.
- Depolarization and repolarization propagation as animated fields.
- P wave, PR interval, QRS complex, ST segment, T wave, and basic timing relationships.
- Limb leads, augmented limb leads, and precordial leads.
- Simplified torso/electrode geometry.
- Phase-based valve and contraction animations.
- Stylized blood flow suitable for education.
- Scenario library for selected pathologies after the normal model is stable.

### 4.2 Out of scope for the main app engine

- Diagnostic interpretation claims.
- Patient-specific simulation.
- Real-time bidomain/monodomain electrophysiology solving.
- Real-time torso conduction finite-element modeling.
- Real-time cardiac mechanics solving.
- Real-time computational fluid dynamics.
- Clinical validation.

### 4.3 Optional research/reference scope

High-fidelity tools such as openCARP, ECGSIM, and SimVascular can inform the project or provide offline references, but should not be dependencies of the interactive MVP.

---

## 5. Product Architecture

### 5.1 Recommended app platform

Start as a **web app / PWA**, not a native mobile app.

Recommended stack:

```text
React + TypeScript
Vite or Next.js
SVG/Canvas for 2D teaching views
Three.js / React Three Fiber for 3D views
Zustand or equivalent for timeline/UI state
Pure TypeScript simulation core
JSON scenario files
```

The core physiology/simulation engine should be independent of React and independent of the renderer.

### 5.2 Top-level modules

```text
/apps
  /web                 # Main interactive app
  /storybook           # Isolated components and visual states, optional

/packages
  /cardio-engine       # Timeline, activation, lead computation, scenario runtime
  /cardio-render-2d    # SVG/Canvas heart + ECG visualizations
  /cardio-render-3d    # Three.js/R3F heart, torso, electrodes, wavefronts
  /cardio-assets       # Models, textures, SVGs, scenario JSON, metadata
  /cardio-content      # Teaching copy, glossary, labels, explanations
  /cardio-validation   # Reference comparisons and waveform sanity checks
```

### 5.3 Core design rule

The simulation state should be reproducible from:

```text
scenario definition + normalized cardiac-cycle time
```

That means every visual element—heart activation, lead voltages, ECG cursor, valve state, chamber volume, and flow particles—can be scrubbed deterministically.

---

## 6. Simulation Model Roadmap

## 6.1 Time and cycle model

The app should use a normalized cardiac-cycle clock:

```ts
type CycleTime = number; // 0.0 to 1.0 within one cardiac cycle
```

Then map that to milliseconds using heart rate:

```ts
type ScenarioTiming = {
  bpm: number;
  cycleMs: number;
  pStartMs: number;
  qrsStartMs: number;
  tStartMs: number;
  tEndMs: number;
};
```

The same timeline should drive:

- Electrical activation.
- ECG trace generation.
- Explanatory labels.
- Valve state.
- Contraction state.
- Blood-flow state.

### 6.2 Electrical activation model

Use a coarse anatomical graph or mesh, not a full electrophysiology solver.

Minimum viable electrical model:

```ts
type HeartNode = {
  id: string;
  region: HeartRegion;
  position: Vec3;
  activationTimeMs: number;
  repolarizationTimeMs: number;
  massWeight: number;
  fiberDirection?: Vec3;
};
```

Each node contributes an electrical source over time. The source is strongest near the advancing wavefront.

Conceptually:

```text
activation_time(node) determines when tissue depolarizes
repolarization_time(node) determines when tissue resets
wavefront = nodes whose activation/repolarization is currently changing
source contribution = direction × magnitude × tissue weight × phase curve
```

### 6.3 Depolarization propagation

The normal rhythm propagation model should include:

1. SA node initiation.
2. Right and left atrial spread.
3. AV nodal delay.
4. His bundle and bundle branches.
5. Septal activation.
6. Rapid ventricular endocardial/apical activation via Purkinje-like paths.
7. Ventricular spread toward epicardium and base.

This can be modeled with authored activation times rather than solved PDEs.

### 6.4 Repolarization propagation

Repolarization should not simply be “depolarization backward.” A useful educational model should encode the unintuitive fact that the T wave is often upright in leads where QRS is upright because repolarization sequence and polarity interact differently.

The model should include tunable regional action-potential duration:

```ts
type RepolarizationModel = {
  baseActionPotentialDurationMs: number;
  epicardialShorteningMs: number;
  endocardialLengtheningMs: number;
  apicalBasalGradientMs: number;
};
```

### 6.5 Electrical source model

The first version can use a net vector, but the more durable model should support multiple regional dipoles.

```ts
type ElectricalSource = {
  position: Vec3;
  moment: Vec3;
  strength: number;
  kind: "depolarization" | "repolarization";
  region: HeartRegion;
};
```

The educational rendering can show:

- A global net vector.
- Regional vectors.
- Wavefront surface.
- Active tissue color map.
- Optional body-surface potential map.

---

## 7. 12‑Lead ECG Model Roadmap

## 7.1 Lead definitions

The app should represent physical electrodes and derived leads explicitly.

Physical electrodes:

```ts
type ElectrodeName =
  | "RA" | "LA" | "RL" | "LL"
  | "V1" | "V2" | "V3" | "V4" | "V5" | "V6";
```

Derived leads:

```text
Lead I   = LA - RA
Lead II  = LL - RA
Lead III = LL - LA

aVR = RA - average(LA, LL)
aVL = LA - average(RA, LL)
aVF = LL - average(RA, LA)

Wilson central terminal = average(RA, LA, LL)
V1–V6 = Vn - Wilson central terminal
```

### 7.2 Potential-at-electrode model

For a physically grounded educational model, calculate an approximate potential at each electrode from the active cardiac sources.

A simple dipole-inspired approximation is sufficient:

```text
potential(electrode) ≈ Σ source_strength × dot(source_moment, electrode_position - source_position) / distance³
```

This should be treated as a didactic approximation, not an anatomically accurate torso conduction model.

### 7.3 Lead voltage computation

Once each physical electrode has a potential:

```ts
type ElectrodePotentials = Record<ElectrodeName, number>;
type LeadVoltages = Record<LeadName, number>;
```

Then the lead voltage definitions produce the 12 traces.

This architecture is better than hardcoding 12 waveforms, because learners can see how changing activation affects all leads.

### 7.4 Calibration and realism

The generated ECG should be calibrated visually rather than clinically:

- Use arbitrary internal units first.
- Scale to plausible millivolt ranges for display.
- Preserve polarity and relative timing as the main success criteria.
- Tune limb leads and precordial leads separately if needed.
- Allow “idealized” and “realistic/noisy” display modes.

---

## 8. Visual Design Roadmap

## 8.1 Initial 2D view

The first useful app does not need a 3D heart. It should start with a stylized 2D or 2.5D diagram.

Recommended first screen:

```text
┌──────────────────────────────────────────────┐
│ Heart schematic with activation wavefront     │
│ Net vector / regional vectors                 │
│ Torso/electrode mini-map                      │
├──────────────────────────────────────────────┤
│ I    II   III   aVR  aVL  aVF                │
│ V1   V2   V3    V4   V5   V6                 │
│ Live ECG traces with synchronized cursor      │
├──────────────────────────────────────────────┤
│ Timeline: P | PR | QRS | ST | T              │
│ Scrubber, play/pause, speed, phase labels     │
└──────────────────────────────────────────────┘
```

### 8.2 3D view

The 3D view should eventually include:

- Semi-transparent torso.
- Electrode markers.
- Heart model inside torso.
- Active myocardium color map.
- Wavefront ring/surface.
- Lead selection overlay.
- Body-surface potential heatmap, optional.
- Slice/cutaway modes.

### 8.3 Lead-focused interaction

When a user selects a lead, the app should highlight:

- Positive electrode/reference.
- Negative electrode/reference.
- Current voltage value.
- Whether current active sources are driving it positive or negative.
- Which heart regions are contributing most to that lead at that instant.

Example explanation:

```text
At this moment, ventricular depolarization is moving generally inferiorly and leftward.
Lead II measures LL relative to RA, so this source distribution makes Lead II positive.
aVR sees the opposite relationship, so it deflects downward.
V1 is close to the right/anterior chest, so its QRS shape differs from the lateral chest leads.
```

### 8.4 Learner modes

The app should have progressive disclosure:

1. **Simple mode:** animation + 12 traces + plain-language labels.
2. **Vector mode:** net vector and lead-axis projections.
3. **Dipole mode:** regional sources and electrode potentials.
4. **Advanced mode:** activation times, source equations, reference traces, and parameter controls.

---

## 9. Asset Roadmap

## 9.1 No-assets starting point

Because there is no current 3D model, contraction model, or 2D drawing, the project should begin with procedural and schematic assets:

- SVG heart schematic.
- Procedural ellipsoid ventricles/atria.
- Simple torso outline.
- Programmatic electrode placement.
- Generated ECG grid and traces.

This avoids early dependence on anatomy asset cleanup.

### 9.2 2D asset path

Create clean vector diagrams first:

- Frontal heart schematic.
- Transverse chest/electrode schematic.
- Torso/electrode layout.
- Simplified conduction system overlay.
- Valve/chamber state diagrams.

These can be authored in Figma, Inkscape, Illustrator, or generated directly as SVG.

### 9.3 3D asset path

Longer-term, import or create:

- Heart mesh.
- Chamber-separated mesh.
- Valve plane markers.
- Torso shell.
- Electrode markers.
- Optional conduction-system curves.
- Optional simplified Purkinje network.

A practical 3D workflow:

```text
public/open anatomical source or procedural prototype
        ↓
Blender cleanup
        ↓
separate anatomical regions / vertex groups
        ↓
retopology / decimation for web
        ↓
glTF export
        ↓
React Three Fiber / Three.js rendering
```

### 9.4 Licensing

Every asset must have explicit license tracking. Medical/anatomical public assets are useful, but licenses differ. The asset pipeline should preserve:

- Source URL.
- License.
- Attribution text.
- Modifications made.
- Whether commercial use is allowed.

---

## 10. Mechanical Model Roadmap

## 10.1 Contraction philosophy

Do not solve cardiac mechanics in the interactive app. Use authored deformation curves tied to the electrical timeline.

The mechanical model should be educationally accurate at the phase level:

```text
QRS begins
  → ventricular depolarization
  → short electromechanical delay
  → ventricular contraction begins
  → AV valves close
  → pressure rises
  → semilunar valves open
  → ejection

T wave
  → ventricular repolarization
  → relaxation
  → semilunar valves close
  → ventricular pressure falls
  → AV valves open
  → filling resumes
```

### 10.2 Deformation model

Use animation curves for:

- Atrial contraction.
- Ventricular shortening.
- Ventricular wall thickening.
- Chamber volume reduction.
- Apex/base motion.
- Septal motion.

At the 3D stage, this can be implemented with:

- Mesh blend shapes.
- Vertex shader displacement.
- Bone/skeletal deformation.
- Procedural scaling per chamber.
- Region-based morph targets.

### 10.3 Valve model

Valve states should be driven by phase and pressure relationships, not by full fluid dynamics.

Valves:

- Tricuspid.
- Mitral.
- Pulmonary.
- Aortic.

Each valve should have:

```ts
type ValveState = {
  openFraction: number; // 0 closed, 1 open
  flowDirection: Vec3;
  label: string;
  soundEvent?: "S1" | "S2" | "murmur";
};
```

Medium-goal success is reached when the app can show:

- AV valves open during filling.
- AV valves close at ventricular systole.
- Semilunar valves open during ejection.
- Semilunar valves close at the end of ejection.
- S1/S2 labels aligned with valve closure.

---

## 11. Blood Flow Roadmap

## 11.1 Recommended approach

Use stylized visual flow, not CFD.

Blood flow should be shown with:

- Particles.
- Streamlines.
- Arrows.
- Semi-transparent chamber fill volumes.
- Chamber volume graphs.
- Pressure/volume labels.

### 11.2 Flow states

Represent flow as a phase-driven state machine:

```ts
type FlowPhase =
  | "venous_return"
  | "atrial_filling"
  | "atrial_kick"
  | "isovolumetric_contraction"
  | "ventricular_ejection"
  | "isovolumetric_relaxation"
  | "rapid_ventricular_filling"
  | "diastasis";
```

### 11.3 Visual success criteria

Blood motion should help the learner understand timing:

- Blood flows into atria during venous return.
- Blood flows through AV valves during ventricular filling.
- Atrial contraction gives final ventricular filling.
- Blood does not visibly flow during isovolumetric phases.
- Blood exits through aortic/pulmonary valves during ejection.

Do not over-invest in realistic turbulence, vortices, or pressure fields until the electrical explanation is already excellent.

---

## 12. Scenario Roadmap

## 12.1 Scenario format

A scenario should be a data file, not hardcoded app behavior.

```ts
type CardiacScenario = {
  id: string;
  name: string;
  description: string;
  bpm: number;
  anatomyPreset: string;
  activationModel: ActivationModelConfig;
  repolarizationModel: RepolarizationModelConfig;
  mechanicalModel: MechanicalModelConfig;
  leadCalibration: LeadCalibrationConfig;
  teachingNotes: TeachingNote[];
  referenceSignals?: ReferenceSignalSet;
};
```

### 12.2 Initial scenario set

Start with a small, high-quality scenario library:

1. Normal sinus rhythm.
2. Sinus bradycardia/tachycardia by timing change only.
3. Left axis deviation / right axis deviation.
4. Right bundle branch block.
5. Left bundle branch block.
6. Anterior/lateral/inferior infarct patterns, eventually.
7. Ventricular ectopic beat, eventually.

The first pathological scenarios should be chosen for visual clarity, not diagnostic breadth.

### 12.3 Reference ECG integration

Reference ECGs can be used in two ways:

1. As background examples synchronized with idealized animations.
2. As validation material for generated traces.

The generated model should not be expected to reproduce real ECG morphology perfectly. The app should make clear when a waveform is synthetic versus reference-derived.

---

## 13. Data and Reference Sources

## 13.1 ECG data

Potential reference datasets:

- PTB‑XL: large public clinical 12‑lead ECG dataset with 10-second records and diagnostic metadata.
- LUDB: smaller 12‑lead ECG dataset with marked P/QRS/T boundaries and peaks.

Reference datasets are useful for waveform examples, but the teaching engine should not require machine learning.

### 13.2 Simulation references

Useful reference tools/projects:

- ECGSIM: interactive ECG teaching/research tool relating heart electrical activity to thorax potentials and PQRST/body-surface maps.
- openCARP: cardiac electrophysiology simulator for in-silico experiments.
- SimVascular: cardiovascular modeling and simulation environment for fluid/solid mechanics.

These should be studied for conceptual grounding and possibly used for offline inspiration or precomputed material.

### 13.3 Anatomy sources

Potential sources:

- NIH 3D / NIH 3D Heart Library.
- Open anatomical teaching models with compatible licenses.
- Custom procedural simplified models.

The first production-quality model may be custom-built because many public anatomical models are not optimized for interactive educational use.

---

## 14. Validation and Quality Roadmap

## 14.1 Scientific validation levels

The project should distinguish four levels of validity:

**Level A — Conceptual validity**  
The app explains the correct causal relationships: activation creates cardiac sources; sources create body-surface potentials; lead definitions produce ECG traces.

**Level B — Polarity/timing validity**  
Major deflections occur at plausible times and with plausible polarities in normal sinus rhythm.

**Level C — Morphology plausibility**  
Generated ECG waveforms resemble normal 12‑lead morphology well enough for education.

**Level D — Reference agreement**  
Generated or precomputed examples can be compared to real or high-fidelity reference signals.

The MVP should target Levels A and B. Later releases can pursue C and D.

### 14.2 Testing strategy

The engine should be heavily testable without rendering.

Important test categories:

- Lead definition tests.
- Electrode potential tests.
- Timeline determinism tests.
- Scenario schema validation.
- Waveform polarity sanity tests.
- ECG rendering scale tests.
- Scrubber synchronization tests.
- Animation state tests.

### 14.3 Expert review

Before public release, have the content reviewed by at least one of:

- Cardiologist.
- Electrophysiologist.
- Cardiac physiology educator.
- Biomedical engineer familiar with ECG forward modeling.

The review should focus on misconceptions, not clinical completeness.

---

## 15. Milestone Roadmap

These milestones are intentionally **not** broken down into individual implementation tickets. Each milestone describes a coherent project stage and expected outcome.

---

## Milestone 0 — Concept, Safety, and Scientific Framing

### Goal

Define exactly what the app teaches, what it does not teach, and how it avoids clinical overclaiming.

### Outcomes

- Product statement.
- Educational scope statement.
- Non-diagnostic disclaimer language.
- Glossary of key terms.
- Explanation hierarchy: vector → dipole → reference/high-fidelity.
- Initial normal sinus rhythm timeline.
- Lead definitions and coordinate convention chosen.

### Exit criteria

The project has a stable conceptual foundation and avoids the major misconception that ECG voltages are waves traveling along leads.

---

## Milestone 1 — 2D Electrical MVP

### Goal

Build the first interactive visual explanation of myocardial activation and 12‑lead ECG formation.

### Outcomes

- 2D heart schematic.
- Scrubbable cardiac-cycle timeline.
- Animated depolarization/repolarization phases.
- Synthetic P/QRS/T generation.
- 12 ECG traces.
- Lead selection and polarity explanation.
- Net vector overlay.

### Exit criteria

A learner can scrub through a normal beat and understand why several leads go up or down during P, QRS, and T.

---

## Milestone 2 — Physically Grounded Lead/Electrode Model

### Goal

Replace or augment the simple lead-vector projection model with a coarse distributed source model and explicit electrode potentials.

### Outcomes

- Torso/electrode coordinate system.
- RA/LA/RL/LL/V1–V6 electrode positions.
- Wilson central terminal.
- Limb leads, augmented leads, and precordial leads computed from electrode potentials.
- Regional cardiac dipoles.
- Approximate potential-at-electrode calculation.
- Visual contribution breakdown by heart region and source type.

### Exit criteria

The app can show that leads are constructed measurements from body-surface potentials, while still keeping the explanation intuitive.

---

## Milestone 3 — Better Anatomical Electrical Model

### Goal

Move from generic wave animation to a coarse anatomical activation model.

### Outcomes

- Region graph or coarse heart mesh.
- SA node / atrial / AV node / His-Purkinje / ventricular region timing.
- Normal ventricular activation sequence.
- Repolarization model with regional action-potential duration differences.
- Tunable activation parameters.
- Animation that can show wavefronts, active tissue, recovered tissue, and refractory tissue.

### Exit criteria

The app can explain normal P wave, QRS complex, ST segment, and T wave in terms of cardiac tissue state, not just waveform labels.

---

## Milestone 4 — 3D Anatomy and Torso Visualization

### Goal

Add a 3D view that improves spatial intuition without compromising the core explanation.

### Outcomes

- 3D torso shell.
- 3D heart model, initially simplified.
- Electrode placement on torso.
- 3D activation color map.
- Lead/electrode overlays.
- Camera presets: frontal, transverse chest, left lateral, heart close-up.
- Optional cutaway mode.

### Exit criteria

The app can visually connect heart position, electrode position, lead construction, and ECG traces in one synchronized scene.

---

## Milestone 5 — Cardiac Phase, Valves, and Heart Sounds

### Goal

Add the medium-goal layer: valves opening/closing and cardiac mechanical phases.

### Outcomes

- Cardiac phase state machine.
- Valve open/closed animation for mitral, tricuspid, aortic, and pulmonary valves.
- S1/S2 markers.
- Pressure relationship labels.
- Mechanical timing relative to ECG events.
- Optional phonocardiogram track.

### Exit criteria

A learner can see how electrical events precede mechanical events, and how valve timing relates to QRS/T and heart sounds.

---

## Milestone 6 — Simplified Contraction Animation

### Goal

Show chamber contraction and relaxation as phase-based animation.

### Outcomes

- Atrial contraction.
- Ventricular contraction.
- Chamber volume curves.
- Wall thickening / chamber shrinking visual cues.
- Electromechanical delay.
- Optional pressure-volume loop overlay.

### Exit criteria

The app can show the difference between electrical activation and mechanical contraction without needing a true finite-element mechanics model.

---

## Milestone 7 — Stylized Blood Flow

### Goal

Add the reach-goal visual layer: blood movement through chambers and valves.

### Outcomes

- Particle or streamline flow system.
- Venous return into atria.
- AV valve inflow into ventricles.
- Atrial kick.
- Ejection through aortic and pulmonary valves.
- No-flow visualization during isovolumetric phases.
- Oxygenated/deoxygenated color distinction, if desired.

### Exit criteria

The app can show the relationship between electrical activation, contraction, valve opening, and directional blood movement through the heart.

---

## Milestone 8 — Scenario Library and Comparative Learning

### Goal

Add curated scenarios that demonstrate how changes in activation produce changes in ECG morphology.

### Outcomes

- Scenario schema stabilized.
- Normal sinus rhythm baseline.
- Axis deviation scenarios.
- Bundle branch block scenarios.
- Selected ischemia/infarct scenarios, later.
- Side-by-side comparison mode.
- “What changed?” explanation cards.

### Exit criteria

The app can teach not only the normal ECG, but also how altered propagation changes the 12‑lead pattern.

---

## Milestone 9 — Reference Data and Validation Layer

### Goal

Integrate real or high-fidelity reference material while preserving the educational nature of the app.

### Outcomes

- Import pipeline for reference ECG signals.
- Signal normalization and display calibration.
- P/QRS/T annotation support.
- Reference-vs-generated comparison mode.
- Links from scenarios to evidence/reference notes.
- Optional offline generated examples from high-fidelity tools.

### Exit criteria

The app can show clearly when a waveform is synthetic, reference-derived, or high-fidelity precomputed.

---

## Milestone 10 — Polish, Accessibility, and Distribution

### Goal

Make the app feel good enough to use repeatedly as a learning environment.

### Outcomes

- Responsive layout.
- Keyboard controls.
- Accessible color palettes.
- Reduced-motion mode.
- High-contrast ECG grid mode.
- Saved view presets.
- Exportable screenshots/animations.
- PWA install support.
- Optional native wrapper after the web experience is stable.

### Exit criteria

The app is useful, understandable, and polished enough for real learners to use without guidance.

---

## 16. User Experience Principles

### 16.1 The learner should feel oriented

The visual system should always answer:

- Where am I in the cardiac cycle?
- What tissue is active?
- Which lead am I looking at?
- Why is that lead positive, negative, or flat right now?

### 16.2 The learner should feel agency

Interaction should be centered around:

- Scrubbing time.
- Selecting a lead.
- Selecting a heart region.
- Turning layers on/off.
- Comparing normal vs altered activation.

### 16.3 The learner should not be overwhelmed

Do not show every layer at once. Use progressive disclosure:

```text
ECG only
→ ECG + heart activation
→ ECG + heart + lead geometry
→ ECG + heart + source contributions
→ ECG + heart + mechanics + blood flow
```

---

## 17. Risks and Mitigations

## 17.1 Scientific misconception risk

**Risk:** The app teaches a visually appealing but false model.  
**Mitigation:** Label approximations, use an explanation hierarchy, and seek expert review.

## 17.2 Asset complexity risk

**Risk:** 3D heart assets consume months before the core educational engine works.  
**Mitigation:** Start with procedural and 2D assets. Treat 3D anatomy as a later layer.

## 17.3 Over-simulation risk

**Risk:** The project tries to become openCARP + SimVascular + educational UI all at once.  
**Mitigation:** Keep the interactive engine simple. Use high-fidelity tools only offline or as references.

## 17.4 Clinical-overclaim risk

**Risk:** Users interpret the app as diagnostic.  
**Mitigation:** Clear language: educational, simplified, not medical advice, not patient-specific.

## 17.5 ECG realism risk

**Risk:** Generated traces look too synthetic or conflict with what learners expect.  
**Mitigation:** Separate generated mode from reference mode. Tune morphology after polarity/timing are correct.

---

## 18. Key Design Decisions to Defer

These should not block early progress:

- Exact final 3D heart asset source.
- Whether to ship native mobile or only PWA.
- Whether to use shader-based or mesh-based activation rendering.
- Whether reference ECG data is bundled or user-loaded.
- Whether high-fidelity simulations are included as precomputed scenario files.
- Whether blood flow uses particles, ribbons, volume morphs, or a combination.
- Whether the app eventually supports quizzes or lesson plans.

---

## 19. Suggested Repository Shape

```text
cardiac-cycle-visualizer/
  README.md
  ROADMAP.md
  docs/
    CONCEPTUAL_MODEL.md
    ECG_LEADS.md
    ACTIVATION_MODEL.md
    MECHANICAL_MODEL.md
    ASSET_PIPELINE.md
    VALIDATION.md
  apps/
    web/
  packages/
    cardio-engine/
    cardio-render-2d/
    cardio-render-3d/
    cardio-assets/
    cardio-content/
    cardio-validation/
  scenarios/
    normal-sinus-rhythm.json
    axis-left.json
    axis-right.json
    rbbb.json
    lbbb.json
  references/
    sources.md
    licenses.md
```

---

## 20. First Build Recommendation

The first build should be ruthlessly focused:

```text
One normal beat.
One 2D heart schematic.
One moving activation wave.
One computed 12‑lead display.
One scrubber.
One selected-lead explanation panel.
```

Do not start with 3D anatomy, valves, contraction, or blood.

The first meaningful success is when the app can show:

> “The ventricular depolarization wavefront is here. These active regions create this approximate source vector/distribution. Lead II is positive because of how its measurement is defined relative to the current source distribution. aVR is negative for the opposite reason. The chest leads differ because their electrodes sit over different parts of the thorax.”

Once that is clear, every later layer—3D, valves, contraction, blood—will make the app richer without changing its foundation.

---

## 21. Reference Links

These sources are useful for project grounding, not as dependencies for the MVP.

- ECGSIM — interactive ECG simulation relating heart electrical activity to thorax potentials and PQRST/body-surface maps: https://www.ecgsim.org/
- ECGSIM paper — “ECGSIM: an interactive tool for studying the genesis of QRST waveforms”: https://pmc.ncbi.nlm.nih.gov/articles/PMC1768085/
- openCARP — open cardiac electrophysiology simulator: https://opencarp.org/
- openCARP documentation: https://opencarp.org/documentation
- SimVascular — open-source cardiovascular modeling/simulation tools: https://simvascular.github.io/
- SimVascular cardiac geometric modeling: https://simvascular.github.io/documentation/simcardio.html
- PTB‑XL 12‑lead ECG dataset: https://physionet.org/content/ptb-xl/
- LUDB 12‑lead ECG database with P/QRS/T annotations: https://physionet.org/content/ludb/
- NIH 3D models portal: https://3d.nih.gov/
- NIH 3D Heart Library: https://3d.nih.gov/collections/heart-library
- React Three Fiber loading models documentation: https://r3f.docs.pmnd.rs/tutorials/loading-models
