# TASK_V3_06.md - Chamber and Cutaway Anatomy Mode

## Status

Not started

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

Pending.
