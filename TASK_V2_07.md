# TASK_V2_07.md - Layer Controls and Learner Modes

## Status

Not started

## Goal

Add coherent layer toggles and learner modes so users can simplify or deepen the visualization without losing orientation.

## Depends On

- `TASK_V2_06.md`

## Deliverables

- Electrical layer toggles: wavefront, contour, state map, vector, lead projection.
- Mechanical layer toggles: contraction, chamber volume, valve state, flow, phase labels.
- ECG layer toggles: 12-lead grid, enlarged lead, labels, projection markers, contribution highlights.
- Probe-to-heart teaching mode.
- Heart-to-probe teaching mode.
- Saved layer preset support.

## Suggested Files

- `apps/web/src/`
- `packages/cardio-render-2d/src/`
- `packages/cardio-render-3d/src/`
- `docs/`
- `TASKS_V2.md`
- `TASK_V2_07.md`

## Exit Criteria

- Layer controls are discoverable and keyboard-accessible.
- Beginner-friendly defaults avoid clutter.
- Modes preserve current time, selected lead, and selected region.
- Tests/typecheck/build pass.
- Browser smoke verifies toggles at desktop and mobile sizes.

## Verification Notes

Record layer defaults, tested toggles, and layout checks.
