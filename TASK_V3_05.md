# TASK_V3_05.md - Isochrone and Level-Set Contour Rendering

## Status

Not started

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

Pending.
