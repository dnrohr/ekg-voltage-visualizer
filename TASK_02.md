# TASK_02.md - Physically Grounded Lead/Electrode Model

## Status

Not started

## Goal

Replace or augment the simple vector projection model with explicit electrode potentials and derived 12-lead ECG calculations.

## Depends On

- `TASK_01.md`

## Deliverables

- Torso/electrode coordinate system.
- Physical electrode positions for `RA`, `LA`, `RL`, `LL`, `V1` through `V6`.
- Wilson central terminal computation.
- Lead definitions for I, II, III, aVR, aVL, aVF, and V1-V6.
- Regional cardiac source/dipole representation.
- Approximate potential-at-electrode calculation.
- Visual indication of positive/negative/reference electrodes for selected lead.
- Contribution breakdown by heart region and source type.

## Suggested Files

- `packages/cardio-engine/`
- `packages/cardio-render-2d/`
- `docs/ECG_LEADS.md`
- `docs/CONCEPTUAL_MODEL.md`
- `scenarios/normal-sinus-rhythm.json`
- `TASKS.md`
- `TASK_02.md`

## Implementation Notes

- Use the didactic approximation from the roadmap:

```text
potential(electrode) ~= sum(source_strength * dot(source_moment, electrode_position - source_position) / distance^3)
```

- Treat this as educational, not clinically accurate torso conduction.
- Keep lead formation explicit in data/types rather than hardcoded waveform drawing.
- Separate physical electrodes from derived leads.

## Exit Criteria

- The app can explain that leads are constructed measurements from body-surface potentials.
- Limb leads, augmented leads, and precordial leads are computed from electrode potentials.
- Selected-lead UI shows positive/reference or positive/negative relationships.
- Tests cover lead definitions and Wilson central terminal behavior.
- Relevant documentation is updated for electrode geometry, lead equations, and model limitations.
- The finished task changes are committed, pushed, merged to `main`, and the task branch is retained.
- `TASKS.md` and this task file are updated with progress and verification notes.

## Required Closeout

- Run the relevant automated tests, type checks, lint checks, and app build if available.
- Manually verify selected-lead electrode/reference highlighting if UI exists.
- Update docs for lead definitions, electrode geometry, calibration assumptions, and limitations.
- Commit the completed task with a focused commit message.
- Push the branch after the commit succeeds.
- Merge the finished task branch into `main` and push `main`.
- Do not delete the task branch after merging.

## Verification Notes

Record tests/manual checks and any calibration assumptions.
