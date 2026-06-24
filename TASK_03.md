# TASK_03.md - Better Anatomical Electrical Model

## Status

Done

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
- The finished task changes are committed, pushed, merged to `main`, and the task branch is retained.
- `TASKS.md` and this task file are updated with progress and verification notes.

## Required Closeout

- Run the relevant automated tests, type checks, lint checks, and app build if available.
- Manually verify activation/repolarization playback and explanatory copy if UI exists.
- Update docs for anatomical timing, repolarization assumptions, scenario parameters, and limitations.
- Commit the completed task with a focused commit message.
- Push the branch after the commit succeeds.
- Merge the finished task branch into `main` and push `main`.
- Do not delete the task branch after merging.

## Verification Notes

Implemented a coarse authored anatomical activation model:

- Added heart activation nodes with region, role, position, activation time, repolarization time, mass weighting, and source family.
- Added a normal conduction path from SA node through atria, AV delay, His bundle, septum, apex, free walls, and basal ventricles.
- Evaluated each node as `resting`, `depolarizing`, `active`, `repolarizing`, or `recovered` from scenario data plus cycle time.
- Derived source strengths from tissue-node depolarization and ventricular repolarization activity.
- Added live tissue-state rendering to the 2D heart schematic and explanatory copy for phase-specific tissue behavior.
- Updated `docs/ACTIVATION_MODEL.md` and `scenarios/normal-sinus-rhythm.json` with the authored timing, recovery, and limitation assumptions.

Verification performed:

- `npm run typecheck`
- `npm test`
- `npm run build`
- Manual browser smoke test at `http://127.0.0.1:5180`: verified 10 tissue nodes render, 12 lead cards render, playback reaches T wave at 590 ms with 3 repolarizing tissue nodes, T-wave explanation appears, and no browser console errors were reported.

Physiology simplifications:

- Node timings and conduction edges are authored teaching data, not a propagation solver.
- Repolarization uses regional recovery times and an authored polarity vector; it does not model ion channels or patient-specific action potentials.
- Source strengths remain calibrated for educational polarity and timing rather than clinical amplitude accuracy.
