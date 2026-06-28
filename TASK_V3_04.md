# TASK_V3_04.md - Shader-Driven Depolarization and Repolarization Wavefront

## Status

Not started

## Goal

Render smooth activation and recovery wavefronts from mesh field attributes instead of rebuilding markers or patch geometry per frame.

## Depends On

- `TASK_V3_03.md`

## Deliverables

- Mesh attributes for activation/repolarization timing available to the renderer.
- Material or shader path that colors resting, depolarizing, active, repolarizing, and recovered tissue.
- Tunable wavefront band width in milliseconds.
- Fallback material path if custom shader support is unavailable.
- Visual/browser verification that propagation is continuous and synchronized to ECG time.

## Suggested Files

- `packages/cardio-render-3d/src/`
- `packages/cardio-engine/src/anatomicalMesh.ts`
- `docs/ANATOMICAL_MESH_MODEL.md`
- `TASKS_V3.md`
- `TASK_V3_04.md`

## Exit Criteria

- Wavefront movement is visible at a glance.
- Pausing/scrubbing updates the mesh state deterministically.
- `npm test`, `npm run typecheck`, `npm run build`, and browser smoke pass.

## Verification Notes

Pending.
