# TASK_V2_09.md - Guided Lessons and Quizzes

## Status

Not started

## Goal

Add a structured learning sequence that guides users from lead direction basics to reconstructing heart activity from ECG traces.

## Depends On

- `TASK_V2_07.md`

## Deliverables

- Lesson 1: lead as directional view.
- Lesson 2: limb leads.
- Lesson 3: precordial leads and R-wave progression.
- Lesson 4: normal ventricular depolarization.
- Lesson 5: mechanical delay.
- Lesson 6: reconstructing heart activity from leads.
- Lightweight quiz prompts with immediate feedback.

## Suggested Files

- `apps/web/src/`
- `packages/cardio-content/` if introduced
- `docs/`
- `TASKS_V2.md`
- `TASK_V2_09.md`

## Exit Criteria

- Lessons use existing simulation state rather than static screenshots.
- Lesson controls do not block free exploration.
- Quiz feedback remains educational and non-clinical.
- Tests/typecheck/build pass.
- Browser smoke verifies lesson navigation and at least one quiz prompt.

## Verification Notes

Record lesson coverage and UX checks.
