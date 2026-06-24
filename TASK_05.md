# TASK_05.md - Cardiac Phase, Valves, and Heart Sounds

## Status

Done

## Goal

Add mechanical phase labels, valve open/closed animation, and S1/S2 timing markers tied to the electrical timeline.

## Depends On

- `TASK_03.md`

## Deliverables

- Cardiac phase state machine.
- Valve state model for mitral, tricuspid, aortic, and pulmonary valves.
- Valve open fraction and flow direction data.
- S1 and S2 markers aligned with valve closure.
- Pressure relationship labels.
- Mechanical timing relative to ECG events.
- Optional phonocardiogram track if it fits the implementation.

## Suggested Files

- `packages/cardio-engine/`
- `packages/cardio-render-2d/`
- `packages/cardio-render-3d/` if 3D exists
- `packages/cardio-content/`
- `docs/MECHANICAL_MODEL.md`
- `scenarios/normal-sinus-rhythm.json`
- `TASKS.md`
- `TASK_05.md`

## Implementation Notes

- Use phase-based animation and authored curves, not mechanics simulation.
- The teaching point is that electrical events precede mechanical events.
- Show AV valves open during filling, AV valves close at ventricular systole, semilunar valves open during ejection, and semilunar valves close at end ejection.

## Exit Criteria

- A learner can see valve timing in relation to QRS, T wave, and heart sounds.
- Valve state is deterministic from scenario plus cycle time.
- Tests or fixtures cover phase transitions and S1/S2 timing.
- Relevant documentation is updated for phase timing, valve assumptions, and heart sound markers.
- The finished task changes are committed, pushed, merged to `main`, and the task branch is retained.
- `TASKS.md` and this task file are updated with progress and verification notes.

## Required Closeout

- Run the relevant automated tests, type checks, lint checks, and app build if available.
- Manually verify valve timing, phase labels, and S1/S2 markers if UI exists.
- Update docs for cardiac phases, valve assumptions, pressure labels, and limitations.
- Commit the completed task with a focused commit message.
- Push the branch after the commit succeeds.
- Merge the finished task branch into `main` and push `main`.
- Do not delete the task branch after merging.

## Verification Notes

Implemented `evaluateMechanicalState` with deterministic phase labels, mitral/tricuspid/aortic/pulmonary valve open fractions, qualitative pressure labels, and S1/S2 markers derived from scenario timing. Normal timing places S1 42 ms after QRS onset and S2 22 ms before T-wave onset.

Verified with `npm test`, `npm run typecheck`, `npm run build`, and browser smoke checks at `http://127.0.0.1:5187`.
