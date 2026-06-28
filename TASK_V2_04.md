# TASK_V2_04.md - Isochrone Contour Map Layer

## Status

Done

## Goal

Add activation-time bands and contour/isoline overlays that make depolarization sequence inspectable when playing or paused.

## Depends On

- `TASK_V2_03.md`

## Deliverables

- Isochrone band generation from authored region activation times.
- Thin contour/isoline visual layer at fixed millisecond intervals.
- Current-time contour highlight.
- Toggle between whole-heart, atrial, and ventricular contour scopes where feasible.
- Optional contour labels such as `20 ms`, `40 ms`, `60 ms`.

## Suggested Files

- `packages/cardio-engine/src/`
- `packages/cardio-render-3d/src/`
- `apps/web/src/`
- `docs/ACTIVATION_MODEL.md`
- `TASKS_V2.md`
- `TASK_V2_04.md`

## Exit Criteria

- The contour map is visually connected to the live wavefront.
- Pausing the animation leaves a useful activation-time map on screen.
- Layer toggling does not obscure ECG interpretation.
- Tests/typecheck/build pass.
- Browser smoke verifies contour rendering and no mobile overflow.

## Verification Notes

Implemented 20 ms isochrone band generation in `packages/cardio-engine/src/surface.ts`. `SimulationState` now includes a default ventricular map plus scoped maps for whole heart, atria, and ventricles. The 3D view renders contour rings, current-wavefront highlights, relative millisecond labels, and scope toggles.

Verification:

- `npm test` - 23 passing tests, including scoped map generation and current contour highlights.
- `npm run typecheck`
- `npm run build`
- Browser smoke at `http://127.0.0.1:5187`: verified contour scope controls, isochrone caption, surface legend, nonzero 3D canvas dimensions, and no mobile horizontal overflow.

Known simplification: contours are drawn around coarse authored patches rather than interpolated across a dense anatomical mesh.
