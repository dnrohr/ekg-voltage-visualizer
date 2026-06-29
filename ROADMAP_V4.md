# ROADMAP_V4.md - Anatomical Fidelity And Visual Honesty

## Source

This roadmap follows the completed V3 anatomical/wavefront work plus follow-up review in the app browser. V3 added a real NIH 3D heart preview and improved top schematic styling, but the result exposed a deeper issue: the app still mixes real anatomy, procedural teaching overlays, and stylized 2D shapes without a fully honest anatomical mapping.

The V4 goal is not "more decoration." The goal is for med students to trust what they are seeing: the heart should look plausibly like a heart, the ventricles should not be misleadingly shaped, and every visual layer should clearly distinguish anatomical reference, educational simulation, and unsupported clinical inference.

## Product Thesis

The learner should be able to point at the visual heart and say:

- This shape is anatomically plausible.
- This chamber or wall label is approximately where I expect it to be.
- This wavefront is a teaching overlay mapped onto anatomy, not a diagnostic reconstruction.
- This 2D schematic is an orientation sketch, not a fake slice or literal chamber cross-section.

## V4 Minimum Useful App

V4 should deliver:

1. A better anatomical asset strategy for the NIH heart preview.
2. A validated preview manifest and asset QA notes, even before full chamber segmentation exists.
3. A first pass at chamber/region anchor mapping from the educational model onto the anatomical mesh.
4. A wavefront/isochrone overlay that visually hugs or projects onto the anatomical heart instead of floating as unrelated procedural patches.
5. A top 2D orientation sketch whose ventricular geometry is anatomically honest enough for med-student teaching.
6. Clear controls that let learners compare "anatomical preview," "teaching mesh," and "hybrid overlay" views.
7. Performance safeguards for large mesh assets and a clear decimation plan.
8. A release audit that states exactly what anatomical claims are supported.

## Non-Goals

V4 must not claim:

- patient-specific anatomy
- clinically validated chamber segmentation
- electrophysiology simulation on the NIH mesh
- diagnostic ECG interpretation
- exact activation/recovery timing for human myocardium

The app may use real anatomy as a visual reference while keeping the authored educational simulation as the source of timing and ECG voltages.

## Architecture Direction

- `references/`: stores source/provenance manifests, asset QA notes, and any scripts or metadata generated during mesh inspection.
- `apps/web/public/assets/`: stores runtime-preview GLB assets that are license-cleared for bundling.
- `packages/cardio-engine`: remains the owner of educational timing, lead voltages, region ids, and validation reports.
- `packages/cardio-render-3d`: owns anatomical mesh loading, material treatment, mesh anchoring, overlay projection, and fallback behavior.
- `packages/cardio-render-2d`: owns the top orientation sketch and 2D trace/lead visuals.
- `docs/`: owns visual honesty, anatomical limitations, safety copy, asset provenance, QA, and release handoff.

## Visual Principles

- Anatomy should be credible before it is flashy.
- If a visual layer is approximate, label it as approximate.
- Avoid clean left/right ventricular splits that imply a literal frontal chamber slice.
- The RV should read as an anterior/right-sided structure wrapping around the LV, not as a symmetric wedge.
- The LV should read as the dominant apex-forming chamber.
- 2D views should be called orientation sketches unless they are derived from a real anatomical projection.
- 3D overlays should either sit on the anatomical mesh or be visibly separated as teaching overlays.
- Performance cost must stay visible when high-poly assets are used.

## Milestone Plan

### Milestone A - Asset QA And Preview Controls

Goal: make the current NIH preview explicit, inspectable, and reversible.

- Add an anatomical asset QA doc with source, license, file size, vertex count, visual limitations, and usage boundaries.
- Add UI state/controls for anatomical preview visibility and opacity.
- Ensure fallback behavior when the GLB fails to load.
- Browser-test desktop and mobile load behavior.

### Milestone B - Mesh Optimization Path

Goal: reduce the current 315k-vertex preview risk and establish a repeatable optimization process.

- Add or document a local conversion/decimation workflow.
- Produce an optimized runtime GLB target under 60k-100k vertices if feasible.
- Record before/after counts, file size, visual differences, and license continuity.
- Keep the original NIH source URL and preview manifest intact.

### Milestone C - Anatomical Anchors And Region Mapping

Goal: create the first honest bridge from educational regions to anatomical positions.

- Define chamber and region anchor metadata for the NIH mesh coordinate space.
- Map existing educational region ids to approximate anatomical anchor points.
- Show region markers on or near the anatomical heart.
- Keep "approximate educational mapping" language visible in docs and UI.

### Milestone D - Anatomical Wavefront Overlay

Goal: make wavefront/isochrone visuals relate to the anatomical heart.

- Project existing region timing fields onto anatomical anchors or a lightweight overlay surface.
- Render activation/recovery bands around the anatomical preview rather than as disconnected floating patches.
- Preserve the procedural teaching mesh as a fallback/debug view.
- Compare anatomical overlay and procedural overlay in browser smoke screenshots.

### Milestone E - 2D Orientation Sketch Redesign

Goal: replace the top diagram with an anatomically honest teaching sketch.

- Redraw the 2D heart overview so the LV forms the apex and the RV wraps anteriorly.
- Reduce or remove misleading chamber fill symmetry.
- Keep electrodes and selected-lead vector readable.
- Label the graphic as an orientation sketch, not a literal anatomical slice.
- Browser-test text/shape overlap at desktop and mobile widths.

### Milestone F - Med-Student Anatomy Explanations

Goal: make the anatomy useful, not just prettier.

- Add concise notes for RV/LV orientation, septum, apex, atria, great vessels, and what the selected lead sees.
- Explain what anatomical preview mode does and does not prove.
- Update guided lessons to reference the improved anatomical views where useful.
- Preserve non-diagnostic language.

### Milestone G - Performance, Accessibility, And Export Update

Goal: keep the improved anatomy practical for repeated study.

- Profile asset load time and render cost.
- Add reduced-detail behavior for mobile or reduced-motion mode.
- Ensure screenshot/study snapshot exports include anatomical preview settings and asset id.
- Verify keyboard operation for new anatomy controls.

### Milestone H - V4 Validation Audit And Release Handoff

Goal: audit visual fidelity, limitations, and release readiness.

- Create a V4 release audit with evidence mapping roadmap requirements to implementation files.
- Include screenshots or browser-smoke notes for the top schematic and 3D anatomical view.
- Document known limitations, deferred work, and expert-review needs.
- Mark all V4 tasks done or explicitly deferred with rationale.

## Task Breakdown

The individual task files are `TASK_V4_00.md` through `TASK_V4_09.md`. `TASKS_V4.md` is the status index and should be updated after each task.

## Completion Policy

Each V4 task should be handled as a small implementation unit:

1. Read `ROADMAP_V4.md`, `TASKS_V4.md`, and the selected task file completely.
2. Keep implementation scoped to the selected task.
3. Run relevant tests, typechecks, builds, and browser/visual checks when UI changes.
4. Update docs plus the selected task and `TASKS_V4.md` verification notes.
5. Commit and push to `main`.
6. Compact or reset context when practical before continuing to the next task.
