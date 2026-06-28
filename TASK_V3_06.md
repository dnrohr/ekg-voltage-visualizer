# TASK_V3_06.md - Chamber and Cutaway Anatomy Mode

## Status

Done

## Goal

Add an internal-anatomy view that helps learners inspect chambers, septum, valves, and wavefront timing.

## Depends On

- `TASK_V3_03.md`

## Deliverables

- Cutaway, clipping, or exploded mode for RA, RV, LA, and LV.
- Septal landmark visibility.
- Valve and chamber-volume cues synchronized with existing mechanical state.
- Layer controls that keep external and chamber modes understandable.

## Suggested Files

- `packages/cardio-render-3d/src/`
- `apps/web/src/main.tsx`
- `apps/web/src/styles.css`
- `docs/MECHANICAL_MODEL.md`
- `docs/ANATOMICAL_MESH_MODEL.md`
- `TASKS_V3.md`
- `TASK_V3_06.md`

## Exit Criteria

- Learners can distinguish external surface view from chamber/cutaway view.
- Wavefront and selected-lead overlays remain readable.
- `npm test`, `npm run typecheck`, `npm run build`, and browser smoke pass.

## Verification Notes

Completed:

- Added External, Cutaway, and Chambers anatomy modes to the 3D scene toolbar.
- Cutaway and Chambers modes lower the external mesh opacity while keeping wavefront shader bands, contours, selected-region picking, lead projection, and vector overlays readable.
- Internal modes automatically reveal RA, RV, LA, and LV chamber-volume cues synchronized to `SimulationState.mechanical.chamberVolumes`.
- Added chamber labels, an interventricular septum landmark, and a soft anterior cutaway plane cue.
- Documented the anatomy modes in `docs/ANATOMICAL_MESH_MODEL.md` and the synchronized chamber-volume behavior in `docs/MECHANICAL_MODEL.md`.

Verification:

- `npm test`
- `npm run typecheck`
- `npm run build`
- Browser smoke for External, Cutaway, and Chambers modes at `http://127.0.0.1:5187/`
