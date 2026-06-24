# TASK_03.md - Better Anatomical Electrical Model

## Status

Not started

## Goal

Move from generic wave animation to a coarse anatomical activation model that represents normal conduction timing and regional repolarization differences.

## Depends On

- `TASK_02.md`

## Deliverables

- Coarse heart region graph or mesh data structure.
- Heart nodes with region, position, activation time, repolarization time, and mass weighting.
- Normal activation sequence: SA node, atrial spread, AV nodal delay, His/bundle branches, septum, Purkinje-like ventricular activation, epicardial/base spread.
- Repolarization model with regional action-potential duration differences.
- Tunable activation/repolarization parameters in scenario config.
- Rendered states for resting, depolarizing, active/refractory, repolarizing, and recovered tissue.
- Updated explanation copy for P wave, QRS, ST segment, and T wave.

## Suggested Files

- `packages/cardio-engine/`
- `packages/cardio-render-2d/`
- `packages/cardio-content/`
- `docs/ACTIVATION_MODEL.md`
- `scenarios/normal-sinus-rhythm.json`
- `TASKS.md`
- `TASK_03.md`

## Implementation Notes

- Use authored activation times, not a real electrophysiology solver.
- Repolarization should not be implemented as depolarization simply running backward.
- Preserve deterministic evaluation from scenario plus cycle time.
- Keep the model understandable and inspectable for learners.

## Exit Criteria

- The app can explain ECG phases in terms of cardiac tissue state, not only waveform labels.
- The T wave explanation accounts for sequence and polarity rather than a simplistic reverse wave.
- Tests or fixtures cover activation ordering and repolarization timing.
- Relevant documentation is updated for activation and repolarization assumptions.
- The finished task changes are committed and pushed.
- `TASKS.md` and this task file are updated with progress and verification notes.

## Required Closeout

- Run the relevant automated tests, type checks, lint checks, and app build if available.
- Manually verify activation/repolarization playback and explanatory copy if UI exists.
- Update docs for anatomical timing, repolarization assumptions, scenario parameters, and limitations.
- Commit the completed task with a focused commit message.
- Push the branch after the commit succeeds.

## Verification Notes

Record model assumptions, tests, and unresolved physiology simplifications.
