# TASK_V2_07.md - Layer Controls and Learner Modes

## Status

Done

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

Implemented layer controls with three learner modes:

- Lead to heart: beginner default with wavefront, contours, vector, lead projection, contraction, valves, flow, phase labels, ECG grid, enlarged lead, labels, projection marker, and region highlights on.
- Heart to leads: emphasizes selected region, state map, chamber volume, and ECG contribution highlights while hiding lead projection, vector, flow, enlarged lead, and projection marker.
- Advanced: enables all electrical, mechanical, and ECG layers.

Layer groups:

- Electrical: wavefront, contours, state map, vector, lead projection.
- Mechanical: contraction, chamber volume, valve state, flow, phase labels.
- ECG: 12-lead grid, enlarged lead, labels, projection markers, contribution highlights.

Verification:

- `npm test`
- `npm run typecheck`
- `npm run build`
- Browser smoke desktop: mode buttons and toggles updated enlarged trace, ECG grid, region highlights, and 3D canvas.
- Browser smoke mobile: layer panel collapsed without horizontal overflow and checkboxes remained reachable.
