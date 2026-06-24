# TASK_09.md - Reference Data and Validation Layer

## Status

Not started

## Goal

Integrate real or high-fidelity reference material for comparison and validation while preserving the app's educational framing.

## Depends On

- `TASK_08.md`

## Deliverables

- Import pipeline for reference ECG signals.
- Signal normalization and display calibration.
- P/QRS/T annotation support.
- Reference-vs-generated comparison mode.
- Scenario links to evidence/reference notes.
- Clear labeling for synthetic, reference-derived, and high-fidelity precomputed waveforms.
- Validation reports or sanity checks for polarity, timing, and morphology plausibility.

## Suggested Files

- `packages/cardio-validation/`
- `packages/cardio-engine/`
- `apps/web/`
- `references/sources.md`
- `references/licenses.md`
- `docs/VALIDATION.md`
- `scenarios/`
- `TASKS.md`
- `TASK_09.md`

## Implementation Notes

- Public ECG datasets such as PTB-XL and LUDB may be useful, but license and attribution requirements must be tracked.
- The app should not imply that generated traces reproduce real patient data exactly.
- Prefer small, curated examples over large bundled datasets unless there is a clear need.

## Exit Criteria

- The app can compare a generated trace with a clearly labeled reference trace.
- Imported/reference data provenance is documented.
- Validation checks distinguish conceptual validity, polarity/timing validity, morphology plausibility, and reference agreement.
- Relevant documentation is updated for data sources, licenses, import behavior, and validation limits.
- The finished task changes are committed, pushed, merged to `main`, and the task branch is retained.
- `TASKS.md` and this task file are updated with progress and verification notes.

## Required Closeout

- Run the relevant automated tests, type checks, lint checks, validation checks, and app build if available.
- Manually verify generated-vs-reference comparison behavior if UI exists.
- Update docs for data sources, licenses, import pipeline, validation levels, and limitations.
- Commit the completed task with a focused commit message.
- Push the branch after the commit succeeds.
- Merge the finished task branch into `main` and push `main`.
- Do not delete the task branch after merging.

## Verification Notes

Record datasets/tools used, licenses, and validation results.
