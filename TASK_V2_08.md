# TASK_V2_08.md - Mesh-Aware Mechanical Contraction and Chambers

## Status

Not started

## Goal

Refine the mechanical model so contraction, chamber volume, valves, and flow can be tied to surface regions and activation timing.

## Depends On

- `TASK_V2_04.md`

## Deliverables

- Local contraction function using activation time plus electromechanical delay.
- Region-aware wall deformation cues.
- Translucent chamber volume cues for RA, LA, RV, and LV.
- Valve overlays tied to the existing phase model.
- Flow arrows that respect valve state and no-flow phases.
- Updated mechanical documentation.

## Suggested Files

- `packages/cardio-engine/src/`
- `packages/cardio-render-3d/src/`
- `packages/cardio-render-2d/src/`
- `docs/MECHANICAL_MODEL.md`
- `TASKS_V2.md`
- `TASK_V2_08.md`

## Exit Criteria

- Depolarization visibly precedes contraction at region level.
- Ventricular volume does not shrink at QRS onset before modeled tension/ejection timing.
- Valve and flow overlays remain optional and synchronized.
- Tests/typecheck/build pass.
- Browser smoke verifies contraction and no-flow phases.

## Verification Notes

Record delay values, chamber behavior, and visual checks.
