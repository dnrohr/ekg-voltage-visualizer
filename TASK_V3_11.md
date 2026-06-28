# TASK_V3_11.md - Performance, Accessibility, and Export Pass

## Status

Done

## Goal

Make the V3 visualizer dependable and usable across common devices and accessibility settings.

## Depends On

- `TASK_V3_10.md`

## Deliverables

- Render performance profiling and cleanup.
- Reduced-motion and high-contrast paths for V3 materials.
- Keyboard operation for V3 mode, layer, lead, scenario, and region controls.
- Exported screenshots/study snapshots that include V3 visual state.
- Desktop/mobile browser smoke checks.

## Suggested Files

- `apps/web/src/main.tsx`
- `apps/web/src/styles.css`
- `packages/cardio-render-3d/src/`
- `docs/V2_POLISH_ACCESSIBILITY_EXPORT.md` or a new V3 polish doc
- `TASKS_V3.md`
- `TASK_V3_11.md`

## Exit Criteria

- No obvious layout overlap or unusable controls on desktop/mobile smoke checks.
- V3 export captures the current visual state.
- `npm test`, `npm run typecheck`, `npm run build`, and browser smoke pass.

## Verification Notes

Completed.

- Added controlled V3 camera, anatomy, surface-map, and isochrone state so the app can save/export the exact current visual state.
- Added keyboard operation for scenario, comparison, learner mode, V3 camera/anatomy/surface/isochrone controls, and layer shortcuts.
- Added V3 high-contrast and reduced-motion paths for shader/fallback material choices and 3D UI styling.
- Added a V3 render-budget profile in the UI and study snapshot export.
- Added `docs/V3_PERFORMANCE_ACCESSIBILITY_EXPORT.md`.
- Verification: `npm test`, `npm run typecheck`, `npm run build`, and desktop/mobile browser smoke.
