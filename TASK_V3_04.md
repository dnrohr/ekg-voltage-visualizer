# TASK_V3_04.md - Shader-Driven Depolarization and Repolarization Wavefront

## Status

Done

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

Added shader-driven wavefront coloring in `packages/cardio-render-3d/src/TorsoScene3D.tsx`. The external mesh geometry now includes per-vertex `phiActivationMs` and `phiRepolarizationMs` attributes, and the renderer uses a custom `ShaderMaterial` to draw depolarization and repolarization wavefront bands from those values.

The initial tunable band widths are:

- depolarization: 18 ms
- repolarization: 26 ms

A standard Three.js material fallback remains available if the shader path cannot be used. The fallback preserves tissue-state color, selected-region highlighting, and region picking.

Verification:

- `npm test`
- `npm run typecheck`
- `npm run build`
- Browser smoke at `http://127.0.0.1:5187/`: canvas visible, shader-rendered anatomy panel loads without console errors, and mobile/desktop checks show no horizontal overflow.
