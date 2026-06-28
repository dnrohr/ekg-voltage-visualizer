# TASK_V3_01.md - Mesh Field and Level-Set Engine Contract

## Status

Done

## Goal

Add a durable engine-level contract for anatomical heart mesh fields and level-set wavefront values. This should support a future imported anatomical mesh while using the current V2 authored surface regions as the initial data source.

## Depends On

- `TASK_V3_00.md`
- Current V2 surface model in `packages/cardio-engine/src/surface.ts`

## Deliverables

- Types for renderable heart mesh vertices, faces, segments, and per-vertex electrical fields.
- A deterministic function that derives a mesh field from `HeartSurfaceModel`, `CardiacScenario`, and current time.
- Per-vertex activation time, repolarization time, tissue state, and level-set values:
  - `phiActivationMs = timeMs - activationTimeMs`
  - `phiRepolarizationMs = timeMs - repolarizationTimeMs`
- Mesh segments that preserve chamber and anatomical-region identity.
- Tests proving deterministic vertex/face counts, chamber coverage, timing propagation, and level-set signs around the wavefront.
- Documentation explaining how the contract bridges V2 patches to future anatomical assets.

## Suggested Files

- `packages/cardio-engine/src/types.ts`
- `packages/cardio-engine/src/surface.ts`
- `packages/cardio-engine/src/anatomicalMesh.ts`
- `packages/cardio-engine/src/index.ts`
- `packages/cardio-engine/test/simulation.test.ts`
- `docs/ANATOMICAL_MESH_MODEL.md`
- `TASKS_V3.md`
- `TASK_V3_01.md`

## Exit Criteria

- The new contract does not require renderer changes yet.
- Existing V2 behavior and tests remain unchanged.
- `npm test`, `npm run typecheck`, and `npm run build` pass.
- Docs clearly state that the initial mesh field is educational/coarse, not a patient-specific anatomical simulation.

## Verification Notes

Implemented `HeartMeshField`, `HeartMeshVertexField`, `HeartMeshFace`, and `HeartMeshSegment` types in `packages/cardio-engine/src/types.ts`. Added `buildHeartMeshField` in `packages/cardio-engine/src/anatomicalMesh.ts`, exported it from the engine, and derived the initial mesh field from the V2 educational heart surface.

Each vertex now carries chamber/region identity, activation/repolarization timing, tissue state, progress values, lead metadata, and level-set fields:

- `phiActivationMs = timeMs - activationTimeMs`
- `phiRepolarizationMs = timeMs - repolarizationTimeMs`

Added `docs/ANATOMICAL_MESH_MODEL.md` to document the V3 bridge from coarse authored patches to future licensed anatomical assets.

Verification:

- `npm test`
- `npm run typecheck`
- `npm run build`
