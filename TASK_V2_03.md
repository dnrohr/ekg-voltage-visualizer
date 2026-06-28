# TASK_V2_03.md - Live Activation and Transmembrane Maps

## Status

Not started

## Goal

Render a live activation wavefront and current electrical/transmembrane state map on the heart surface.

## Depends On

- `TASK_V2_02.md`

## Deliverables

- Engine evaluation for surface region electrical state at time `t`.
- Distinct states for not activated, depolarizing, depolarized, repolarizing, and recovered.
- 3D surface color mode for live wavefront.
- 3D surface color mode for current electrical state.
- Legend and focused labels that do not clutter the view.
- Tests or fixtures covering state transitions.

## Suggested Files

- `packages/cardio-engine/src/`
- `packages/cardio-render-3d/src/`
- `apps/web/src/`
- `docs/ACTIVATION_MODEL.md`
- `TASKS_V2.md`
- `TASK_V2_03.md`

## Exit Criteria

- A learner can watch activation spread across authored heart regions.
- Activation time and current electrical state are visually distinguishable.
- Existing ECG traces remain synchronized.
- Tests/typecheck/build pass.
- Browser smoke confirms the 3D layer renders nonblank and updates while scrubbing.

## Verification Notes

Record visual checks, screenshots if useful, and known simplifications.
