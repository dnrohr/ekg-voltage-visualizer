# TASK_V4_08.md - Performance, Accessibility, and Export Update for Anatomy Modes

## Status

Not started

## Goal

Keep the V4 anatomical visuals usable during repeated study by updating performance, accessibility, keyboard, and export behavior.

## Depends On

- `TASK_V4_05.md`
- `TASK_V4_07.md`

## Deliverables

- Render/load budget notes for anatomical preview and hybrid overlay modes.
- Reduced-detail, reduced-motion, or mobile-safe behavior where appropriate.
- Keyboard-accessible controls for anatomical preview, overlay mode, opacity, and selected marker navigation.
- Export/snapshot payloads that include anatomy mode, overlay mode, asset id, and visibility settings.
- Documentation updates for V4 performance and accessibility decisions.

## Suggested Files

- `apps/web/src/main.tsx`
- `apps/web/src/styles.css`
- `packages/cardio-render-3d/src/`
- `packages/cardio-engine/src/`
- `docs/V3_PERFORMANCE_ACCESSIBILITY_EXPORT.md`
- `docs/VALIDATION.md`

## Exit Criteria

- New controls are keyboard reachable and visible in high-contrast/reduced-motion conditions.
- Snapshot/export output can reconstruct the selected V4 anatomy view state.
- Mobile behavior avoids unusable frame drops or clearly chooses reduced detail.
- Tests/typechecks/builds pass, and browser smoke covers core accessibility/export paths.

## Verification Notes

Pending.
