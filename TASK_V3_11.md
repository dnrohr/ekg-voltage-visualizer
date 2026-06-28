# TASK_V3_11.md - Performance, Accessibility, and Export Pass

## Status

Not started

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

Pending.
