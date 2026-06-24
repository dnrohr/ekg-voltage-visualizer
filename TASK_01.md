# TASK_01.md - 2D Electrical MVP

## Status

Not started

## Goal

Build the first interactive teaching prototype: one normal beat, one 2D heart schematic, one animated activation/recovery cycle, one computed 12-lead ECG display, one timeline scrubber, and one selected-lead explanation panel.

## Depends On

- `TASK_00.md`

## Deliverables

- Web app scaffold using the repo's chosen stack.
- Pure TypeScript simulation core that can evaluate a normal beat at normalized cycle time.
- 2D heart schematic with depolarization and repolarization phases.
- Synthetic P/QRS/T trace generation for 12 leads.
- ECG grid/traces with synchronized cursor.
- Scrubber, play/pause, and speed controls.
- Lead selection UI.
- Explanation panel for selected lead polarity and amplitude.
- Basic normal sinus rhythm scenario data.

## Suggested Files

- `apps/web/`
- `packages/cardio-engine/`
- `packages/cardio-render-2d/`
- `packages/cardio-content/`
- `scenarios/normal-sinus-rhythm.json`
- `docs/ACTIVATION_MODEL.md`
- `TASKS.md`
- `TASK_01.md`

## Implementation Notes

- Keep this task 2D. Do not begin 3D anatomy, valves, contraction, or blood flow.
- Use deterministic state from `scenario definition + normalized cardiac-cycle time`.
- It is acceptable for the first ECG model to use an intuitive net vector approximation.
- Prioritize correct timing, polarity, and scrubber synchronization over realistic ECG morphology.
- The first screen should be the usable simulator, not a landing page.

## Exit Criteria

- A learner can scrub through a normal beat and see P, QRS, ST, and T phases.
- At least several leads visibly go positive, negative, or flat for explainable reasons.
- Selecting a lead updates the explanation panel.
- The simulation can be evaluated independently of React/rendering.
- Basic tests or verification notes cover timeline determinism and lead display behavior.
- Relevant documentation is updated for setup, architecture, and model assumptions.
- The finished task changes are committed and pushed.
- `TASKS.md` and this task file are updated with progress and verification notes.

## Required Closeout

- Run the relevant automated tests, type checks, lint checks, and app build if available.
- Manually verify the core simulator flow in the browser if a web app exists.
- Update README/docs for setup, usage, architecture, and known limitations introduced by this task.
- Commit the completed task with a focused commit message.
- Push the branch after the commit succeeds.

## Verification Notes

Record commands run, screenshots/manual checks if applicable, and known limitations.
