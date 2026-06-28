# TASK_V2_06.md - Region-To-Lead Inspection Mode

## Status

Not started

## Goal

Support the inverse learning path from selected heart region to expected ECG signature.

## Depends On

- `TASK_V2_05.md`

## Deliverables

- Region hover/tap/click target model.
- Selected region panel with activation, recovery, and contraction timing.
- Best-seen leads and opposite leads for the region.
- Region contribution indicators on relevant ECG traces.
- Keyboard-accessible region selection fallback.

## Suggested Files

- `packages/cardio-engine/src/`
- `packages/cardio-render-3d/src/`
- `packages/cardio-render-2d/src/`
- `apps/web/src/`
- `docs/ECG_LEADS.md`
- `TASKS_V2.md`
- `TASK_V2_06.md`

## Exit Criteria

- A learner can select a region and see when it activates and which leads most strongly reflect it.
- Region-to-lead metadata is deterministic from scenario data.
- The mode works with mouse and a keyboard-accessible fallback.
- Tests/typecheck/build pass.
- Browser smoke verifies at least one LV, RV, septal, and atrial region.

## Verification Notes

Record region selection checks and accessibility notes.
