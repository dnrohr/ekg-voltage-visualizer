# TASK_V3_03.md - External Heart Mesh Renderer Foundation

## Status

Not started

## Goal

Add a V3 renderer path that displays a heart-shaped external mesh surface using the mesh field contract.

## Depends On

- `TASK_V3_02.md`

## Deliverables

- Renderer adapter from engine mesh field to Three.js geometry attributes.
- External-heart visual mode with chamber/region material distinctions.
- Selected-region highlighting and pointer picking.
- Preserved electrode, torso, lead-vector, and ECG synchronization overlays.
- Browser smoke checks for desktop and mobile framing.

## Suggested Files

- `packages/cardio-render-3d/src/`
- `apps/web/src/main.tsx`
- `apps/web/src/styles.css`
- `docs/ANATOMICAL_MESH_MODEL.md`
- `TASKS_V3.md`
- `TASK_V3_03.md`

## Exit Criteria

- The external heart mesh reads as the primary visual object.
- Existing V2 layer controls still work or have clear V3 replacements.
- `npm test`, `npm run typecheck`, `npm run build`, and browser smoke pass.

## Verification Notes

Pending.
