# TASK_04.md - 3D Anatomy and Torso Visualization

## Status

Done

## Goal

Add a synchronized 3D view that improves spatial intuition for heart position, electrode placement, lead construction, and activation state.

## Depends On

- `TASK_03.md`

## Deliverables

- 3D torso shell, initially simplified or procedural.
- 3D heart model, initially simplified or procedural.
- Electrode markers on torso.
- 3D activation/repolarization color map.
- Lead/electrode overlays in 3D.
- Camera presets: frontal, transverse chest, left lateral, and heart close-up.
- Optional cutaway mode if feasible within scope.
- Asset license tracking for any third-party models/textures.

## Suggested Files

- `packages/cardio-render-3d/`
- `packages/cardio-assets/`
- `apps/web/`
- `docs/ASSET_PIPELINE.md`
- `references/licenses.md`
- `references/sources.md`
- `TASKS.md`
- `TASK_04.md`

## Implementation Notes

- Start with procedural primitives if no suitable licensed asset exists.
- Do not let 3D asset work disrupt the 2D MVP or engine architecture.
- Use Three.js or React Three Fiber.
- Keep 3D state driven by the same deterministic simulation state as the 2D view.

## Exit Criteria

- The user can view heart, torso, electrodes, activation state, and selected lead relationship in a synchronized 3D scene.
- Camera presets work without disorienting the learner.
- Asset sources and licenses are documented.
- Visual verification confirms the 3D scene renders correctly on desktop and mobile-sized viewports.
- Relevant documentation is updated for assets, controls, and rendering assumptions.
- The finished task changes are committed, pushed, merged to `main`, and the task branch is retained.
- `TASKS.md` and this task file are updated with progress and verification notes.

## Required Closeout

- Run the relevant automated tests, type checks, lint checks, and app build if available.
- Verify the 3D view in desktop and mobile-sized browser viewports.
- Update docs for asset sources, licenses, camera controls, rendering assumptions, and limitations.
- Commit the completed task with a focused commit message.
- Push the branch after the commit succeeds.
- Merge the finished task branch into `main` and push `main`.
- Do not delete the task branch after merging.

## Verification Notes

Implemented a synchronized procedural 3D anatomy view:

- Added `@ekg/cardio-render-3d` with a Three.js renderer driven directly by `SimulationState`.
- Rendered a transparent torso shell, simplified heart chambers, electrode markers, tissue-state markers, selected-lead overlay, and net-vector arrow.
- Added camera presets for frontal, transverse, left lateral, and heart close-up views.
- Added cutaway mode that hides the torso shell while keeping electrodes, heart, tissue states, and lead geometry visible.
- Integrated the 3D panel into the web app without changing the engine's deterministic state model.
- Added `docs/ASSET_PIPELINE.md`, `references/licenses.md`, and `references/sources.md`.

Asset and license notes:

- No third-party anatomy meshes, textures, images, or HDRIs are bundled.
- 3D anatomy is generated procedurally at runtime from project code and engine data.
- Three.js is used as a rendering library dependency, not as an anatomy asset source.

Verification performed:

- `npm run typecheck`
- `npm test`
- `npm run build`
- Manual browser verification at `http://127.0.0.1:5181/` with Playwright/Chromium:
  - Desktop viewport `1440x1100`: 3D canvas rendered at `1370x520`, nonblank screenshot output, four camera presets present, heart close-up preset worked, cutaway toggled, and no console errors.
  - Mobile viewport `390x900`: 3D canvas rendered at `336x300`, nonblank screenshot output, four camera presets present, heart close-up preset worked, cutaway toggled, and no console errors.

Known simplifications:

- The torso is a transparent ellipsoid shell, not a realistic anatomical mesh.
- The heart is a procedural chamber schematic.
- Activation color is shown as tissue-node markers rather than a continuous volumetric myocardial color map.
- The selected lead overlay is a geometric teaching aid; it does not imply electrical current travels along the ECG lead line.
