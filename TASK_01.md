# TASK_01.md - 2D Electrical MVP

## Status

Done

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
- The finished task changes are committed, pushed, merged to `main`, and the task branch is retained.
- `TASKS.md` and this task file are updated with progress and verification notes.

## Required Closeout

- Run the relevant automated tests, type checks, lint checks, and app build if available.
- Manually verify the core simulator flow in the browser if a web app exists.
- Update README/docs for setup, usage, architecture, and known limitations introduced by this task.
- Commit the completed task with a focused commit message.
- Push the branch after the commit succeeds.
- Merge the finished task branch into `main` and push `main`.
- Do not delete the task branch after merging.

## Verification Notes

Implemented the first interactive web prototype:

- React/Vite app under `apps/web`.
- Pure TypeScript simulation core under `packages/cardio-engine`.
- SVG rendering components under `packages/cardio-render-2d`.
- Normal sinus rhythm scenario data under `scenarios/normal-sinus-rhythm.json`.
- Activation model notes in `docs/ACTIVATION_MODEL.md`.

Verification performed:

- `npm test`
- `npm run typecheck`
- `npm run build`
- `npm audit`
- Browser smoke test at `http://127.0.0.1:5186`: confirmed the app renders the 2D heart schematic, timeline controls, 12 ECG lead cards, QRS phase state, and selected-lead explanation.
- Browser interaction check: selecting `V1` updates the explanation heading, formula, and pressed ECG card state.

Known limitations:

- The MVP uses a simplified net-vector projection model, not explicit electrode potentials.
- Displayed voltages are synthetic teaching values, not calibrated diagnostic ECG measurements.
- Chest lead behavior is intentionally approximate until Task 02 adds the physically grounded lead/electrode model.
