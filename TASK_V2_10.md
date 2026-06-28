# TASK_V2_10.md - Heart-First Abnormal Scenario Extensions

## Status

Not started

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

Record scenarios added and validation results.
