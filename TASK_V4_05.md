# TASK_V4_05.md - Anatomical Wavefront and Isochrone Projection Prototype

## Status

Done

## Goal

Prototype a wavefront/isochrone overlay that visually relates to the anatomical heart instead of appearing as disconnected procedural patches.

## Depends On

- `TASK_V4_04.md`

## Deliverables

- A lightweight projection or interpolation path from existing activation/recovery timing to anatomical anchors or an overlay surface.
- Activation and recovery bands that hug, wrap, or clearly hover close to the anatomical heart.
- Isochrone contours or timing bands that remain synchronized with the cardiac-cycle scrubber.
- Controls to compare procedural, anatomical, and hybrid overlay modes.
- Documentation that the anatomical overlay is a teaching projection, not a solved electrophysiology field.

## Suggested Files

- `packages/cardio-engine/src/`
- `packages/cardio-render-3d/src/`
- `apps/web/src/main.tsx`
- `apps/web/src/styles.css`
- `docs/ANATOMICAL_MESH_MODEL.md`
- `docs/VALIDATION.md`

## Exit Criteria

- Scrubbing time shows a wavefront that visually tracks across the anatomical reference.
- Procedural teaching overlays remain available as fallback/debug views.
- Overlay labels and docs avoid implying clinical timing or patient-specific conduction.
- Browser smoke includes anatomical overlay and procedural fallback comparison.

## Verification Notes

- Added `AnatomicalOverlayMode` with `Procedural`, `Anatomical`, and `Hybrid` toolbar controls.
- Projected existing authored activation/recovery and isochrone timing onto normalized NIH anchors as hover rings near the anatomical reference mesh.
- `Procedural` keeps existing fallback/debug overlays and disables anatomical projection rings.
- `Anatomical` shows anchor-projected timing rings and suppresses older floating patch overlays.
- `Hybrid` shows both procedural and anatomical projections for comparison.
- Added `window.__nihAnatomicalProjection` smoke/debug summary with mode, projected anchor count, time, and isochrone scope.
- Saved view state, render profile, keyboard cycling (`O`), and study snapshots include anatomical overlay mode through `v3ViewState`.
- Updated `docs/ANATOMICAL_MESH_MODEL.md` and `docs/VALIDATION.md` to state that the overlay is an educational timing projection, not electrophysiology solved on the NIH mesh.
- Ran `npm run typecheck` successfully.
- Ran `npm test` successfully: 34 engine tests passed.
- Ran `npm run build` successfully; Vite reported the existing large chunk warning.
- Chrome/Playwright smoke on fresh dev server `http://127.0.0.1:5190` confirmed default hybrid projected 9 anchors at 340 ms, procedural mode projected 0 anchors, anatomical mode projected 9 anchors, scrubbing to 610 ms updated projection time and count, captions reported overlay comparison mode, and 390 px mobile overlay toggle did not overflow.
