# TASK_04.md - 3D Anatomy and Torso Visualization

## Status

Not started

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

Record render checks, screenshots if useful, and asset license notes.
