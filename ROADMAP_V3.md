# ROADMAP_V3.md - Anatomical Visual Heart And Wavefront Upgrade

## Source

This roadmap follows the V2 implementation and the visual upgrade direction captured after reviewing `V2_VISION.md`: the app should become a med-student-oriented anatomical heart viewer where external surfaces, chambers, activation wavefronts, lead projections, and ECG traces explain each other.

## Product Thesis

The learner should feel that the ECG is a measurement taken from a living 3D heart, not a trace with decorative anatomy beside it.

V3 should make these questions visually answerable:

- Where is the depolarization or repolarization wavefront right now?
- Which chamber or wall is active, refractory, recovering, or resting?
- What would I see from the outside of the heart versus inside a chamber/cutaway?
- Why does the selected ECG lead deflect up, down, become biphasic, or flatten?
- How does a scenario such as bundle branch block, ectopic focus, or axis shift change the heart first and the ECG second?

## V3 Minimum Useful App

The V3 minimum useful app should provide:

1. A heart mesh data contract that can support imported anatomy later without changing the simulator API.
2. Per-vertex activation and recovery fields derived from the existing scenario clock.
3. A level-set representation of the current wavefront: `phi(vertex, time) = time - activationTime(vertex)`.
4. A visually credible external-heart surface mode with chamber and region landmarks.
5. A chamber/cutaway mode that shows RA, RV, LA, LV cavities and septal anatomy.
6. Shader-driven wavefront coloring, isochrone bands, and electrical-state maps.
7. Lead contribution overlays that illuminate regions shaping a selected ECG lead.
8. A scenario comparison workflow that helps students compare normal and abnormal propagation.
9. Documentation that clearly separates educational visualization from diagnostic simulation.

## Architecture Direction

- `packages/cardio-engine`: owns mesh metadata, segmentation, activation/recovery fields, level-set values, scenario-derived timing, and validation.
- `packages/cardio-render-3d`: owns mesh loading/rendering, shader materials, clipping/cutaway controls, chamber visibility, and region picking.
- `packages/cardio-render-2d`: owns synchronized ECG traces, selected-lead markers, and region/lead contribution indicators.
- `apps/web`: owns learner modes, layout, scenario comparison state, control orchestration, and export workflows.
- `docs/`: owns asset licensing, model assumptions, validation boundaries, and med-student teaching notes.
- `references/` or a future asset directory: stores only assets with recorded source, license, provenance, and optimization notes.

## Rendering Principles

- Prefer real mesh assets for anatomy once licensing/provenance is settled.
- Use data attributes and shaders for wavefront animation rather than rebuilding geometry per frame.
- Keep external, cutaway, chamber, and electrical-map modes visually distinct.
- Make the current wavefront visible at a glance before the learner reads labels.
- Keep ECG lead overlays synchronized to exactly the same simulation state as the 3D view.
- Let users simplify layers quickly; advanced overlays should not be mandatory to understand the default view.

## Level-Set Model

Each renderable mesh vertex should eventually expose:

- position
- normal
- chamber id
- anatomical region id
- activation time
- repolarization time
- current tissue state
- `phiActivationMs = currentTimeMs - activationTimeMs`
- `phiRepolarizationMs = currentTimeMs - repolarizationTimeMs`
- lead sensitivity or region contribution metadata

The renderer can use these fields to show a narrow depolarization band where `phiActivationMs` is near zero, a repolarization band where `phiRepolarizationMs` is near zero, and isochrone contours from activation-time intervals.

## Milestone Plan

### Milestone A - Mesh Field Foundation

Goal: define a durable anatomical mesh and level-set contract without requiring a final imported heart asset yet.

- Add mesh, vertex, face, segment, and field types.
- Derive an initial mesh field from the V2 authored surface regions.
- Add tests proving timing, segmentation, and level-set values are deterministic.
- Document how this bridges V2 patch surfaces to V3 anatomical assets.

### Milestone B - Anatomical Asset Pipeline

Goal: make real heart geometry possible without licensing ambiguity or renderer rewrites.

- Define accepted mesh formats and optimization targets.
- Add provenance/license manifest requirements.
- Add a local import/validation script for geometry, normals, chamber labels, and region metadata.
- Keep a procedural fallback for contributors without the asset.

### Milestone C - External Heart Surface Renderer

Goal: replace the current schematic surface emphasis with a heart-shaped external surface.

- Add a V3 external-heart rendering path.
- Render mesh segmentation, subtle anatomical material, landmarks, and selected region highlighting.
- Preserve electrode, lead vector, and ECG synchronization overlays.
- Browser-test desktop and mobile framing.

### Milestone D - Shader Wavefront And Isochrones

Goal: make propagation smooth and visually continuous.

- Move activation coloring into a shader/material layer driven by per-vertex fields.
- Render depolarization and repolarization bands with tunable width.
- Render isochrone contours from activation-time intervals.
- Keep a fallback material for browsers or tests where custom shaders fail.

### Milestone E - Chamber And Cutaway Modes

Goal: help students understand internal anatomy and timing.

- Add clipping plane controls or an exploded/cutaway mode.
- Show RA, RV, LA, LV cavities and septum.
- Show valves and chamber-volume cues without diagnostic claims.
- Keep current wavefront and selected lead overlays readable in cutaway mode.

### Milestone F - Lead Contribution Teaching Overlays

Goal: make ECG interpretation visually causal.

- Highlight mesh regions that contribute to the selected lead at the current time.
- Distinguish aligned, opposed, and weak/perpendicular contributors.
- Link waveform cursor features to active mesh regions.
- Add concise med-student explanations.

### Milestone G - Scenario Comparison And Lessons

Goal: make abnormalities learnable by comparing propagation, not memorizing trace shapes.

- Add normal-vs-scenario comparison controls.
- Show side-by-side or ghosted activation wavefronts.
- Add lessons for normal QRS, RBBB, LBBB, ectopic focus, axis shifts, and repolarization.
- Preserve safety language and avoid diagnostic templates.

### Milestone H - Performance, Accessibility, And Release

Goal: make the V3 viewer dependable for repeated study.

- Profile shader/render performance.
- Add reduced-motion and high-contrast visual paths.
- Verify responsive layout and keyboard operation.
- Export screenshots/study snapshots with V3 layer state.
- Produce a V3 release audit.

## Task Breakdown

The individual task files are `TASK_V3_00.md` through `TASK_V3_12.md`. `TASKS_V3.md` is the status index and should be updated after each task.

## Completion Policy

Each V3 task should be handled as a small implementation unit:

1. Read `ROADMAP_V3.md`, `TASKS_V3.md`, and the selected task file completely.
2. Keep implementation scoped to the selected task.
3. Run relevant tests, typechecks, builds, and browser/visual checks when UI changes.
4. Update docs plus the selected task and `TASKS_V3.md` verification notes.
5. Commit and push to `main`.
6. Compact or reset context when practical before continuing to the next task.
