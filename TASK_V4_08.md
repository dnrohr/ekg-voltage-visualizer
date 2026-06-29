# TASK_V4_08.md - Performance, Accessibility, and Export Update for Anatomy Modes

## Status

Done

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

- Added V4 render/export metadata for optimized anatomical asset uploaded vertices, triangles, file size, overlay mode, and anatomy performance policy.
- Added keyboard shortcuts: `O` cycles overlay mode, `P` toggles anatomical preview visibility, `[` / `]` adjust preview opacity, and `K` / `Shift+K` cycle mapped anatomical marker regions.
- Added `aria-keyshortcuts` metadata to anatomical overlay controls, preview visibility checkbox, and preview opacity slider.
- Updated screenshot filenames to include anatomical overlay mode.
- Updated study snapshot payloads so V4 anatomy state can be reconstructed: asset id, preview visibility/opacity, optimized asset counts, `v3ViewState.anatomicalOverlayMode`, accessibility state, and render performance policy.
- Added renderer pixel-ratio budget: desktop cap 2, medium cap 1.5, mobile under 640 px cap 1, reduced-motion cap 1.
- Added `window.__scene3dRenderBudget` debug summary for smoke verification.
- Updated `docs/V3_PERFORMANCE_ACCESSIBILITY_EXPORT.md` and `docs/VALIDATION.md` with V4 performance, keyboard, accessibility, and export decisions.
- Ran `npm run typecheck` successfully.
- Ran `npm test` successfully: 34 engine tests passed.
- Ran `npm run build` successfully; Vite reported the existing large chunk warning.
- Chrome/Playwright smoke on fresh dev server `http://127.0.0.1:5193` confirmed keyboard overlay/preview/opacity/marker paths, high-contrast and reduced-motion classes, reduced-motion pixel cap 1, snapshot metadata, and mobile 390 px pixel cap 1.
