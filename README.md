# EKG Voltage Visualizer

An educational cardiac-cycle visualizer for making 12-lead EKG/ECG voltages feel physically grounded.

The goal is to help learners connect **myocardial depolarization and repolarization** to the changing voltage measurements seen in a 12-lead EKG. Rather than treating the tracing as an abstract waveform, the app shows what is happening in the heart, how that activity creates body-surface potentials, and why each lead deflects upward, downward, or remains nearly flat during the cardiac cycle.

> **Status:** planning / pre-MVP  
> **Scope:** educational physiology and signal-formation simulator  
> **Non-goal:** diagnostic interpretation or clinical decision support

## Core Idea

A 12-lead EKG does **not** show voltage traveling down the leads. The leads measure changing **potential differences** on the body surface. Those potential differences arise from electrical activation and recovery propagating through cardiac muscle.

The teaching model is:

```text
myocardial activation state over time
        |
        v
electrical source distribution / dipoles inside the heart
        |
        v
potentials induced at torso electrodes
        |
        v
lead definitions: I, II, III, aVR, aVL, aVF, V1-V6
        |
        v
12 EKG waveforms
```

The project should favor **physically honest simplification** over visual realism.

## First Target

The first useful version should be intentionally narrow:

- one normal sinus rhythm beat
- one stylized 2D heart schematic
- one animated depolarization/repolarization cycle
- one computed 12-lead display
- one synchronized timeline scrubber
- one selected-lead explanation panel

First success condition:

> A learner can scrub through a normal beat and understand why several leads go positive, negative, or flat during P, QRS, ST, and T.

The full roadmap is in [ROADMAP.md](./ROADMAP.md).

Foundational docs for the first implementation tasks:

- [docs/CONCEPTUAL_MODEL.md](./docs/CONCEPTUAL_MODEL.md) - product thesis, teaching chain, explanation levels, and initial normal timing model
- [docs/SAFETY_AND_SCOPE.md](./docs/SAFETY_AND_SCOPE.md) - educational scope, disclaimer language, and scientific framing rules
- [docs/GLOSSARY.md](./docs/GLOSSARY.md) - preferred terminology for concepts, UI copy, and future code comments
- [docs/COORDINATE_SYSTEM.md](./docs/COORDINATE_SYSTEM.md) - shared heart, torso, electrode, and lead-axis coordinate convention
- [docs/ECG_LEADS.md](./docs/ECG_LEADS.md) - electrode roles, lead formulas, Wilson central terminal, and polarity sanity checks
- [docs/ACTIVATION_MODEL.md](./docs/ACTIVATION_MODEL.md) - 2D MVP timing, vector source assumptions, and known model limitations
- [docs/MECHANICAL_MODEL.md](./docs/MECHANICAL_MODEL.md) - authored phase, valve, contraction, heart sound, and flow timing model
- [docs/VALIDATION.md](./docs/VALIDATION.md) - scenario schema, reference overlay, validation levels, and accessibility/distribution notes

## Running the 2D MVP

Install dependencies and run the local web app:

```bash
npm install
npm run dev
```

The app lives in `apps/web` and uses a pure TypeScript simulation engine in `packages/cardio-engine`. The first screen is the simulator: a stylized 2D heart schematic, generated 12-lead ECG traces, timeline controls, lead selection, and selected-lead explanation.

Useful checks:

```bash
npm test
npm run typecheck
npm run build
npm audit
```

## Intended Experience

The app should eventually show a synchronized view of:

1. a heart model showing depolarization and repolarization propagation
2. a simplified torso with EKG electrode placement
3. live 12-lead EKG traces with a moving time cursor
4. selected-lead explanations
5. optional mechanical layers: contraction, valve motion, chamber volume, and stylized blood flow

The key question the app should answer is:

> At this instant in the cardiac cycle, what tissue is electrically active, where is the activation/recovery wavefront, and why does this lead measure this voltage?

## Explanation Levels

### Level 1: Vector Model

A simplified net cardiac electrical vector is projected onto each lead axis. This is the most intuitive starting point.

### Level 2: Distributed Source Model

Multiple active heart regions contribute approximate dipoles. Electrode potentials are computed from these sources, then the 12 leads are derived from electrode differences and reference definitions.

### Level 3: Reference / High-Fidelity Mode

Real or precomputed EKG traces can be synchronized to the animation for comparison. This mode should clearly distinguish reference data from generated teaching signals.

## Feature Roadmap

### MVP

- scrubbable cardiac-cycle timeline
- 2D heart schematic
- animated depolarization and repolarization
- synthetic 12-lead EKG display
- lead selection
- polarity/amplitude explanation for selected leads
- normal sinus rhythm scenario

### Medium-Term Features

- explicit electrode positions: RA, LA, RL, LL, V1-V6
- derived lead formation: I, II, III, aVR, aVL, aVF, V1-V6
- Wilson central terminal visualization
- coarse regional dipole model
- 3D heart and torso view
- cardiac phase labels
- valve opening and closing
- S1/S2 timing markers
- simple contraction animation

### Reach Features

- stylized blood-flow particles or streamlines
- chamber volume and pressure overlays
- body-surface potential maps
- scenario library for axis deviation and bundle branch blocks
- reference EKG overlay mode
- exportable screenshots or animations
- PWA/mobile-friendly distribution

## Suggested Architecture

The simulation engine should be independent of the UI and renderer.

```text
ekg-voltage-visualizer/
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

Recommended initial stack:

- React
- TypeScript
- Vite or Next.js
- SVG/Canvas for the first 2D teaching view
- Three.js / React Three Fiber for later 3D views
- Zustand or equivalent for UI/timeline state
- JSON scenario files
- pure TypeScript simulation core

## Simulation Principles

The app should be deterministic from:

```text
scenario definition + normalized cardiac-cycle time
```

The same timeline should drive:

- electrical activation state
- repolarization state
- EKG traces
- selected-lead explanation
- valve state
- contraction state
- blood-flow state

The first simulation engine does not need to solve real cardiac electrophysiology. It should use authored activation and repolarization timing over a simplified anatomical model.

## Lead Model

The project should explicitly model the physical electrodes:

```text
RA, LA, RL, LL, V1, V2, V3, V4, V5, V6
```

Then derive the leads:

```text
Lead I   = LA - RA
Lead II  = LL - RA
Lead III = LL - LA

aVR = RA - average(LA, LL)
aVL = LA - average(RA, LL)
aVF = LL - average(RA, LA)

Wilson central terminal = average(RA, LA, LL)
V1-V6 = Vn - Wilson central terminal
```

A useful first approximation for electrode potential is a coarse dipole-inspired model:

```text
potential(electrode) ~= sum(source_strength * dot(source_moment, electrode_position - source_position) / distance^3)
```

This is a didactic approximation, not a clinically accurate torso-conduction model.

## Design Principles

The learner should always be able to answer:

- Where am I in the cardiac cycle?
- What tissue is active right now?
- Which lead am I looking at?
- What is that lead measuring?
- Why is the tracing going up, down, or flat?

Use progressive disclosure:

```text
EKG traces only
-> EKG + heart activation
-> EKG + heart + lead geometry
-> EKG + heart + source contributions
-> EKG + heart + mechanics
-> EKG + heart + mechanics + blood flow
```

## Non-Goals

Out of scope for the core interactive app:

- diagnostic interpretation
- patient-specific modeling
- real-time bidomain/monodomain electrophysiology
- real-time torso finite-element conduction
- real-time cardiac mechanics
- real-time computational fluid dynamics
- clinical validation claims

High-fidelity tools may be useful as references or offline data sources, but they should not be dependencies of the MVP.

## Development Philosophy

Build the explanatory engine before building visual realism.

Recommended order:

1. Make the 2D explanation work.
2. Make lead formation explicit and correct.
3. Add richer anatomical timing.
4. Add 3D visualization.
5. Add valves and contraction.
6. Add stylized blood flow.
7. Add scenarios and reference traces.

A simple accurate explanation is better than a beautiful misleading animation.

## References and Related Projects

Useful for grounding the project:

- ECGSIM: https://www.ecgsim.org/
- ECGSIM paper: https://pmc.ncbi.nlm.nih.gov/articles/PMC1768085/
- openCARP: https://opencarp.org/
- SimVascular: https://simvascular.github.io/
- PTB-XL 12-lead ECG dataset: https://physionet.org/content/ptb-xl/
- LUDB 12-lead ECG database with P/QRS/T annotations: https://physionet.org/content/ludb/
- NIH 3D models portal: https://3d.nih.gov/
- React Three Fiber documentation: https://r3f.docs.pmnd.rs/

## License

No license has been chosen yet.

Before adding third-party anatomical models, datasets, textures, or reference media, track:

- source URL
- license
- required attribution
- modifications made
- commercial-use restrictions

## Current Next Step

Build the physically grounded lead/electrode model from [TASK_02.md](./TASK_02.md).
