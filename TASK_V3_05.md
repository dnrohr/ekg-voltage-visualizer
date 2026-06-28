# TASK_V3_05.md - Isochrone and Level-Set Contour Rendering

## Status

Done

## Goal

Render activation-time contours and current level-set bands over the V3 mesh.

## Depends On

- `TASK_V3_04.md`

## Deliverables

- Contour rendering driven by per-vertex activation times.
- Current `phiActivationMs ~= 0` wavefront highlight.
- Optional contour labels or legend suitable for med-student use.
- Comparison against existing V2 isochrone map behavior.

## Suggested Files

- `packages/cardio-engine/src/anatomicalMesh.ts`
- `packages/cardio-render-3d/src/`
- `docs/ACTIVATION_MODEL.md`
- `docs/ANATOMICAL_MESH_MODEL.md`
- `TASKS_V3.md`
- `TASK_V3_05.md`

## Exit Criteria

- Contours remain readable in external and close-up views.
- The current contour aligns with the moving wavefront.
- `npm test`, `npm run typecheck`, `npm run build`, and browser smoke pass.

## Verification Notes

Added V3 mesh-surface contour rendering in `packages/cardio-render-3d/src/TorsoScene3D.tsx`. External mesh geometry now also carries `activationTimeMs` and `repolarizationTimeMs` attributes, and contour loops are drawn on `HeartMeshField` segment outlines using scoped `SimulationState.isochroneMaps`.

Current behavior:

- V3 contour loops are placed on the external mesh surface.
- Current wavefront/level-set contours render with stronger styling.
- Mesh contour labels appear for current bands and selected interval labels.
- Existing V2 contour rings remain as a secondary comparison/fallback layer.

Verification:

- `npm test`
- `npm run typecheck`
- `npm run build`
- Browser smoke at `http://127.0.0.1:5187/`: desktop/mobile canvas visible, contour caption updated, no console errors, and no mobile horizontal overflow.
