# TASK_V2_05.md - Lead Probe Teaching Mode

## Status

Not started

## Goal

Build the central teaching mode for the question: "What is this lead seeing right now?"

## Depends On

- `TASK_V2_03.md`

## Deliverables

- Enlarged selected lead trace.
- Selected lead positive-axis/probe visualization in 3D.
- Current net vector projection marker on the selected trace.
- Lead alignment classification: toward, away, sideways, or mixed.
- Region contribution summary tied to the selected lead and current time.
- Time-specific explanation text for selected lead polarity.

## Suggested Files

- `packages/cardio-engine/src/`
- `packages/cardio-render-2d/src/`
- `packages/cardio-render-3d/src/`
- `apps/web/src/`
- `docs/ECG_LEADS.md`
- `TASKS_V2.md`
- `TASK_V2_05.md`

## Exit Criteria

- Selecting II, V1, V5/V6, or aVR gives a clear directional explanation.
- The enlarged trace and 3D probe remain synchronized with the same time cursor.
- Projection values agree with generated lead voltage polarity.
- Tests/typecheck/build pass.
- Browser smoke verifies lead selection and explanation updates.

## Verification Notes

Record checked leads and projection behavior.
