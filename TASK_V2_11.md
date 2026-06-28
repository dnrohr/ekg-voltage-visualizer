# TASK_V2_11.md - V2 Polish, Performance, Accessibility, and Export

## Status

Not started

## Goal

Make the V2 app dependable for repeated study, including responsive layout, continuous 3D performance, accessible controls, and export options.

## Depends On

- `TASK_V2_10.md`

## Deliverables

- Performance pass for continuous 3D updates and timeline scrubbing.
- Responsive layout at desktop, tablet, and mobile sizes.
- Keyboard-accessible controls for time, lead, region, layers, and lessons.
- Reduced-motion and high-contrast support for V2 layers.
- Exportable screenshots and, if feasible, short animation captures.
- PWA/distribution check.

## Suggested Files

- `apps/web/src/`
- `packages/cardio-render-3d/src/`
- `packages/cardio-render-2d/src/`
- `docs/VALIDATION.md`
- `TASKS_V2.md`
- `TASK_V2_11.md`

## Exit Criteria

- Common interactions remain smooth enough for teaching.
- Text and controls fit on common mobile and desktop viewports.
- Keyboard and reduced-motion paths work.
- Tests/typecheck/build pass.
- Browser smoke covers desktop and mobile.

## Verification Notes

Record performance observations, viewport checks, and remaining limits.
