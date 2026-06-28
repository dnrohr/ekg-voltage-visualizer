# TASK_V2_10.md - Heart-First Abnormal Scenario Extensions

## Status

Done

## Goal

Extend simplified abnormal scenarios by changing activation timing, origin, direction, or electrode configuration first, then deriving ECG changes from the altered heart/probe model.

## Depends On

- `TASK_V2_08.md`

## Deliverables

- Refined bundle branch block scenarios using surface activation delays.
- Axis deviation scenarios tied to vector and region changes.
- Ventricular ectopic focus scenario.
- Adjustable conduction delay teaching scenario.
- Reversed limb leads teaching scenario.
- Scenario notes explaining what changed physically.

## Suggested Files

- `packages/cardio-engine/src/`
- `scenarios/`
- `apps/web/src/`
- `docs/VALIDATION.md`
- `TASKS_V2.md`
- `TASK_V2_10.md`

## Exit Criteria

- Each scenario changes heart/source/electrode data before ECG output.
- The UI explains altered physical activation and observed ECG differences.
- Scenario validation checks cover timing, polarity, and plausibility.
- Tests/typecheck/build pass.
- Browser smoke verifies scenario switching and comparison behavior.

## Verification Notes

Implemented and verified:

- Refined bundle branch block notes around altered activation timing.
- Existing left/right axis deviation scenarios remain vector-first teaching scenarios.
- `prolonged-av-conduction`: delayed AV-to-His timing before ventricular activation.
- `ventricular-ectopic-focus`: early right ventricular free-wall activation with widened generated QRS.
- `reversed-arm-leads`: RA/LA electrode positions swapped before electrode potentials and lead voltages are computed.

Validation:

- Schema validation covers all curated scenarios.
- Tests verify delayed conduction timing, ectopic region activation order, and reversed Lead I polarity.

Verification:

- `npm test`
- `npm run typecheck`
- `npm run build`
- Browser smoke: scenario picker and comparison picker both include new scenarios; switching to ventricular ectopic focus and comparing reversed arm leads updates the comparison panel.
