# Anatomical Mesh Model

## Purpose

V3 introduces an engine-level mesh-field contract so the simulator can move from coarse V2 surface patches toward a realistic anatomical heart mesh without changing the teaching model every time the renderer improves.

The first implementation is still educational and coarse. It derives a triangulated mesh field from `educationalHeartSurface` in `packages/cardio-engine/src/surface.ts`. Future tasks can replace or augment that source with a licensed anatomical mesh once asset provenance and segmentation are defined.

## Mesh Field Contract

`buildHeartMeshField` in `packages/cardio-engine/src/anatomicalMesh.ts` returns a `HeartMeshField` with:

- vertices with position, normal, chamber, region id, anatomical label, timing, tissue state, and lead metadata
- triangular faces grouped by region
- segments that preserve chamber and anatomical-region identity
- current time in milliseconds
- source surface provenance

Each vertex carries level-set values:

```text
phiActivationMs = currentTimeMs - activationTimeMs
phiRepolarizationMs = currentTimeMs - repolarizationTimeMs
```

The current depolarization wavefront is near `phiActivationMs = 0`. Resting regions are negative, already activated regions are positive, and the renderer can use a narrow millisecond band around zero to draw an advancing wavefront.

## Why This Comes Before a Real Mesh

The current renderer can already draw coarse patches, but an anatomical renderer needs stable data before it needs better pixels. This contract lets V3 work proceed in layers:

1. Engine produces deterministic mesh fields from scenario time.
2. Renderer maps mesh fields to Three.js geometry attributes.
3. Shader materials color tissue from per-vertex activation/recovery fields.
4. Imported anatomy can replace the coarse authored source after licensing and segmentation are documented.

## Educational Boundary

The V3 mesh field is not a patient-specific electrophysiology model, finite-element model, torso-conduction solver, or diagnostic simulation. It is a teaching representation designed to make propagation order, chamber anatomy, ECG lead direction, and simplified regional contributions easier to inspect.

## Future Asset Requirements

A future anatomical mesh asset must provide or be mapped to:

- chamber labels: `RA`, `LA`, `RV`, `LV`
- anatomical region ids compatible with teaching overlays
- vertex positions and normals
- triangular or triangulatable faces
- asset source, author, license, modification notes, and redistribution constraints
- optimization notes for web delivery

Until those requirements are met, the coarse V2-derived mesh field remains the canonical source for V3 renderer development.
