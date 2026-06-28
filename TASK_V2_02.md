# TASK_V2_02.md - Educational Heart Surface Model

## Status

Not started

## Goal

Add a compact educational heart surface data model with regions, chambers, approximate vertices, activation times, recovery times, and lead-sensitivity metadata.

## Depends On

- `TASK_V2_01.md`

## Deliverables

- Surface/region types in the engine.
- Authored atrial and ventricular region dataset.
- Per-region activation and repolarization timing.
- Chamber labels for RA, LA, RV, and LV.
- Region-to-lead sensitivity metadata.
- Tests validating timing order and region coverage.

## Suggested Files

- `packages/cardio-engine/src/`
- `scenarios/`
- `docs/ACTIVATION_MODEL.md`
- `docs/VALIDATION.md`
- `TASKS_V2.md`
- `TASK_V2_02.md`

## Exit Criteria

- Each authored region can report activation time, recovery time, chamber, and likely visible leads.
- Region data can be evaluated at arbitrary cardiac time.
- Tests/typecheck/build pass.
- Documentation explains educational simplifications.

## Verification Notes

Record region list, timing assumptions, and validation checks.
