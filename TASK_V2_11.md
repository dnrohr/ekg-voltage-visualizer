# TASK_V2_11.md - V2 Polish, Performance, Accessibility, and Export

## Status

Done

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

Implemented:

- Disposed dynamic 3D objects before each synchronized redraw.
- Memoized 3D layer props and stabilized global keyboard handling during playback.
- Added `R`/`Shift+R` region cycling and `G`/`Shift+G` lesson cycling.
- Broadened high-contrast styling across V2 panels and controls.
- Added reduced-motion CSS suppression in addition to autoplay stopping.
- Added JSON study snapshot export alongside existing 3D PNG export.
- Confirmed PWA manifest, icon, theme color, standalone display, and viewport metadata.

Verification:

- `npm test`
- `npm run typecheck`
- `npm run build`
- Browser smoke desktop: keyboard lead/region/lesson cycling, high contrast, reduced motion, export controls, and 3D canvas.
- Browser smoke mobile: responsive layout without horizontal overflow; layer/lesson/export controls reachable.

Remaining limit:

- Short animation capture is not implemented; V2-11 exports still PNG and reproducible JSON study snapshots.
