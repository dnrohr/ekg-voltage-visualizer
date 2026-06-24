# TASK_06.md - Simplified Contraction Animation

## Status

Not started

## Goal

Show atrial and ventricular contraction/relaxation with phase-based animation curves tied to the electrical and valve timeline.

## Depends On

- `TASK_05.md`

## Deliverables

- Atrial contraction animation.
- Ventricular contraction animation.
- Chamber volume curves.
- Wall thickening and chamber shrinking visual cues.
- Electromechanical delay model.
- Optional pressure-volume loop overlay.
- Updated explanations distinguishing electrical activation from mechanical contraction.

## Suggested Files

- `packages/cardio-engine/`
- `packages/cardio-render-2d/`
- `packages/cardio-render-3d/` if 3D exists
- `packages/cardio-content/`
- `docs/MECHANICAL_MODEL.md`
- `scenarios/normal-sinus-rhythm.json`
- `TASKS.md`
- `TASK_06.md`

## Implementation Notes

- Do not implement finite-element cardiac mechanics.
- Use authored animation curves and deterministic state evaluation.
- Keep the visual cue educationally clear even if anatomically simplified.

## Exit Criteria

- The app visually separates electrical activation from delayed mechanical contraction.
- Chamber volume changes align with valve phase and ECG timing.
- Tests or fixtures cover contraction timing and electromechanical delay.
- Relevant documentation is updated for contraction curves, chamber-volume assumptions, and limitations.
- The finished task changes are committed and pushed.
- `TASKS.md` and this task file are updated with progress and verification notes.

## Required Closeout

- Run the relevant automated tests, type checks, lint checks, and app build if available.
- Manually verify contraction timing and chamber volume visuals if UI exists.
- Update docs for contraction curves, electromechanical delay, volume assumptions, and limitations.
- Commit the completed task with a focused commit message.
- Push the branch after the commit succeeds.

## Verification Notes

Record curve choices, checks, and known simplifications.
