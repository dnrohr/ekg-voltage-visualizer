# TASK_V3_09.md - Scenario Comparison Viewer

## Status

Done

## Goal

Add a workflow for comparing normal propagation against an abnormal teaching scenario.

## Depends On

- `TASK_V3_07.md`

## Deliverables

- Scenario comparison state in the app.
- Normal-vs-selected scenario visual comparison, either side-by-side or ghosted.
- ECG comparison cues that remain synchronized to the same cardiac time.
- Teaching copy focused on how the heart changed before the ECG changed.

## Suggested Files

- `apps/web/src/main.tsx`
- `apps/web/src/styles.css`
- `packages/cardio-engine/src/scenarios.ts`
- `docs/VALIDATION.md`
- `TASKS_V3.md`
- `TASK_V3_09.md`

## Exit Criteria

- A learner can compare normal and one abnormal scenario without losing orientation.
- Clinical limitations remain visible in docs/copy.
- `npm test`, `npm run typecheck`, `npm run build`, and browser smoke pass.

## Verification Notes

Completed:

- Added a normal sinus rhythm anchor for scenario comparison independent of the primary scenario selection.
- Added side-by-side normal and selected comparison cards synchronized to the same normalized cardiac-cycle time.
- Added active-region tissue chips, selected-lead polarity, selected-lead voltage delta, QRS-end shift, and a compact delta meter.
- Added teaching copy that emphasizes heart-model changes before ECG changes.
- Added non-diagnostic comparison wording and validation documentation.

Verification:

- `npm test`
- `npm run typecheck`
- `npm run build`
- Browser smoke for scenario comparison viewer at `http://127.0.0.1:5187/`
