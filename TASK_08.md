# TASK_08.md - Scenario Library and Comparative Learning

## Status

Done

## Goal

Add curated scenarios that demonstrate how changes in activation timing and direction affect 12-lead ECG morphology.

## Depends On

- `TASK_03.md`

## Deliverables

- Stable scenario schema.
- Normal sinus rhythm baseline scenario.
- Sinus bradycardia and tachycardia scenarios by timing changes.
- Left axis deviation and right axis deviation scenarios.
- Right bundle branch block and left bundle branch block scenarios.
- Selected infarct/ischemia scenarios later if the model can support them responsibly.
- Scenario picker.
- Side-by-side comparison mode.
- "What changed?" explanations.

## Suggested Files

- `scenarios/`
- `packages/cardio-engine/`
- `packages/cardio-content/`
- `apps/web/`
- `docs/ACTIVATION_MODEL.md`
- `docs/VALIDATION.md`
- `TASKS.md`
- `TASK_08.md`

## Implementation Notes

- Choose early pathology scenarios for visual clarity, not diagnostic breadth.
- Keep all scenarios educational and clearly simplified.
- Make the scenario data explicit rather than hiding behavior in component code.
- Generated examples should not claim clinical diagnostic fidelity.

## Exit Criteria

- A user can compare normal sinus rhythm with at least one altered activation scenario.
- The app explains what changed in activation and how that changed lead voltages.
- Scenario schema validation exists.
- Relevant documentation is updated for scenario schema, scenario assumptions, and limitations.
- The finished task changes are committed, pushed, merged to `main`, and the task branch is retained.
- `TASKS.md` and this task file are updated with progress and verification notes.

## Required Closeout

- Run the relevant automated tests, type checks, lint checks, scenario validation, and app build if available.
- Manually verify scenario selection and comparison behavior if UI exists.
- Update docs for scenario schema, added scenarios, educational assumptions, and limitations.
- Commit the completed task with a focused commit message.
- Push the branch after the commit succeeds.
- Merge the finished task branch into `main` and push `main`.
- Do not delete the task branch after merging.

## Verification Notes

Added a typed scenario library with normal sinus rhythm, sinus bradycardia, sinus tachycardia, left/right axis deviation, and right/left bundle branch block teaching scenarios. Added scenario picker, side-by-side comparison metrics, and "What changed?" explanations.

`validateScenarioSchema` covers all curated scenarios. Verified with `npm test`, `npm run typecheck`, `npm run build`, and browser interaction smoke checks for scenario switching.
