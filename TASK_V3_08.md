# TASK_V3_08.md - Med-Student Inspection Panels and Explanations

## Status

Done

## Goal

Improve the learner-facing explanations around selected mesh regions, chambers, lead projections, and wavefront timing.

## Depends On

- `TASK_V3_07.md`

## Deliverables

- Inspection panel copy suitable for med-student learning.
- Region/chamber timing, tissue state, and selected-lead relationship.
- Clear distinction between depolarization, active/refractory tissue, repolarization, and recovery.
- Safety wording that avoids diagnosis or patient-specific claims.

## Suggested Files

- `apps/web/src/main.tsx`
- `packages/cardio-engine/src/regionInspection.ts`
- `docs/SAFETY_AND_SCOPE.md`
- `docs/GLOSSARY.md`
- `TASKS_V3.md`
- `TASK_V3_08.md`

## Exit Criteria

- Explanations help answer "why does this lead do that right now?"
- Copy remains concise enough for repeated study.
- `npm test`, `npm run typecheck`, `npm run build`, and browser smoke pass.

## Verification Notes

Completed:

- Extended selected-region inspection with med-student-focused fields for tissue-state meaning, wavefront timing, selected-lead relationship, contributor class, and educational safety wording.
- Updated the anatomy panel with concise Study focus, Electrical state, Wavefront timing, Contributor class, and safety-note blocks.
- Kept selected-region explanations synchronized with the current selected lead.
- Documented lead-region relationship and active/refractory/recovered tissue language in safety and glossary docs.
- Added deterministic engine tests for the new selected-lead explanation fields.

Verification:

- `npm test`
- `npm run typecheck`
- `npm run build`
- Browser smoke for selected-region study-focus copy at `http://127.0.0.1:5187/`
