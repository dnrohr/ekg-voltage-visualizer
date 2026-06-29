# TASK_V4_05.md - Anatomical Wavefront and Isochrone Projection Prototype

## Status

Not started

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

Pending.
