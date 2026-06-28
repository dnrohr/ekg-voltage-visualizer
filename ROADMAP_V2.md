# ROADMAP_V2.md - Heart-First ECG Visualizer

## Source

This roadmap is derived from `V2_VISION.md`. V2 shifts the app from a mostly schematic ECG teaching tool into a heart-first visualizer where ECG traces behave like synchronized instrument readouts attached to a moving electrical/mechanical heart model.

## Product Thesis

The learner should be able to reason in both directions:

- Heart to ECG: a moving wavefront and net vector explain why each lead rises, falls, or stays flat.
- ECG to heart: a waveform feature can be traced back to vector direction, active tissue, recovery state, and mechanical timing.

The core teaching rule remains:

> Each ECG lead is a directional measurement of the heart's changing electrical field.

## V2 Minimum Useful App

The V2 minimum useful app should provide:

1. A 3D heart surface with region labels and per-region activation timing.
2. A moving ventricular depolarization wavefront.
3. Isochrone/contour lines and activation-time bands.
4. A transmembrane/electrical-state map distinct from activation time.
5. A prominent net electrical vector arrow.
6. Twelve synchronized ECG traces with a moving cursor.
7. Lead selection with positive-axis/probe visualization and projection markers.
8. Playback down to at least 20x slower than real time, plus millisecond stepping.
9. Mechanical contraction delayed after depolarization.
10. A teaching mode answering why the selected lead is positive, negative, biphasic, or flat.

## Architecture Direction

V2 should keep the existing workspace shape but make the simulation more data-driven:

- `packages/cardio-engine`: cardiac clock, mesh/region state, electrical maps, lead projection model, scenario transforms, validation.
- `packages/cardio-render-3d`: interactive heart surface, contour/wavefront/vector/probe/chamber layers.
- `packages/cardio-render-2d`: 12-lead panel, enlarged selected lead, cursor/projection markers.
- `apps/web`: orchestration, layout, layer toggles, lessons, keyboard controls, export.
- `docs/`: model assumptions, UI/lesson notes, validation boundaries.
- `scenarios/`: explicit scenario manifests and authored teaching variations.

## Design Principles

- The heart is the primary object; ECG traces are measurements from it.
- All visuals are recomputed from continuous cardiac time, not pre-rendered frames.
- Electrical activation, current tissue state, mechanical contraction, chamber volume, valve state, and flow are related but visually separable.
- Layer controls should let beginners simplify the view and advanced users inspect more.
- Every abnormal scenario should change the heart model first, then let the ECG follow.
- Clinical fidelity claims remain out of scope unless backed by explicit validation evidence.

## Milestone Plan

### Milestone A - Continuous V2 Foundation

Goal: make time, state, and task scaffolding ready for the V2 implementation loop.

- Generate this roadmap and V2 task files.
- Add a high-resolution cardiac clock model capable of real-time, 20x slowdown, scrub, and millisecond stepping.
- Preserve current V1 behavior while introducing V2 state in parallel.

### Milestone B - Surface Electrical Heart

Goal: represent the heart as inspectable surface regions with activation and recovery timing.

- Add a compact educational heart surface model with vertices/regions/chambers.
- Derive per-region activation time, repolarization time, current state, and contribution metadata.
- Render live activation wavefront and transmembrane/electrical-state map.
- Render isochrone bands/contours and current-time highlights.

### Milestone C - ECG As Probe Readout

Goal: connect selected leads to the heart visually and numerically.

- Enlarge selected lead trace.
- Show lead axis/probe, net vector projection, polarity, and contribution markers.
- Emphasize aligned/opposed/perpendicular leads during vector motion.
- Add "what is this lead seeing right now?" explanations.

### Milestone D - Region-To-Lead Inspection

Goal: support the inverse learning path from heart region to expected ECG signature.

- Region hover/tap/click inspection.
- Activation/contraction timing per selected region.
- Best-seen and opposite leads for each region.
- Region contribution overlays in ECG traces.

### Milestone E - Layered Learning Modes

Goal: make V2 usable as a guided learner experience, not only a freeform simulator.

- Layer toggles for electrical, mechanical, and ECG overlays.
- Probe-to-heart and heart-to-probe teaching modes.
- Guided lessons for lead direction, limb leads, precordial leads, QRS propagation, mechanical delay, and reconstructing the heart from traces.

### Milestone F - Scenario Extensions

Goal: extend simplified abnormal cases while preserving the rule "change the heart first; let the ECG follow."

- Bundle branch block refinements.
- Axis deviation refinements.
- Ventricular ectopic focus.
- Adjustable conduction delay.
- Reversed limb-lead teaching case.
- Scenario validation notes.

### Milestone G - Polish, Performance, And Distribution

Goal: make the V2 app dependable for repeated study and teaching.

- Responsive layout at common desktop/tablet/mobile sizes.
- Keyboard and accessible layer controls.
- Performance pass for continuous 3D updates.
- Exportable screenshots/animations where feasible.
- Documentation and validation audit.

## Task Breakdown

The individual task files are `TASK_V2_00.md` through `TASK_V2_12.md`. `TASKS_V2.md` is the status index and should be updated after each task.

## Completion Policy

Each V2 task should be handled as a small branch/commit unit:

1. Read the task file completely.
2. Keep implementation scoped to the task.
3. Run relevant tests, typechecks, and builds.
4. Perform browser or visual smoke checks when UI changed.
5. Update docs and the V2 task status.
6. Commit and push.
7. Continue to the next V2 task after context reset/compaction when practical.
