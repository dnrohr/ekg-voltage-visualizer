# TASK_V2_02.md - Educational Heart Surface Model

## Status

Done

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

Implemented `packages/cardio-engine/src/surface.ts` with a 10-region educational surface model covering RA, LA, RV, and LV. Regions include approximate vertices, activation-node links, base activation/repolarization times, source families, best-seen leads, and opposite leads.

Verification:

- `npm test` - 21 passing tests, including chamber coverage, surface timing order, arbitrary-time state evaluation, and scenario-specific delayed activation.
- `npm run typecheck`
- `npm run build`

Documentation updated in `docs/ACTIVATION_MODEL.md`.
