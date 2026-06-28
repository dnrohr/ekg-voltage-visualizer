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

## Provenance Manifest

Every imported anatomical mesh must have an `AnatomicalAssetManifest`. The validator checks the source/license record, runtime file format, geometry counts, normals, chamber segmentation, redistribution rules, and educational-use notes before an asset can be treated as usable.

Use `references/anatomical-heart-asset-manifest.example.json` as the template. The example is a schema-style placeholder, not a bundled asset.

Blocking issues mean the asset must not be bundled or loaded as the primary V3 anatomy. Warning issues require an explicit review note in the task file or release audit.

## V3 External Mesh Renderer Foundation

The first V3 renderer path consumes `SimulationState.heartMeshField` in `packages/cardio-render-3d/src/TorsoScene3D.tsx`. It adapts `HeartMeshField` segments and triangular faces into Three.js `BufferGeometry` objects, preserving `regionId` on each mesh for pointer selection.

Current behavior:

- the external heart surface is generated from the V2-derived mesh field
- chambers receive distinct anatomical teaching colors
- depolarizing/repolarizing regions can override chamber color with electrical-state colors
- selected regions keep the existing region inspection workflow
- the older V2 patch overlay is retained only as a lightweight wavefront/selection cue
- electrodes, lead projection, net vector, contours, valve cues, flow cues, and ECG synchronization remain driven by the same `SimulationState`

This is still a coarse educational surface. Its purpose is to prove the renderer contract before importing a licensed anatomical mesh.

## Shader Wavefront Rendering

V3-04 adds shader-driven coloring for the external mesh surface. The renderer writes per-vertex `phiActivationMs` and `phiRepolarizationMs` attributes into each Three.js geometry. A custom `ShaderMaterial` then colors the surface from those level-set values:

- `phiActivationMs` near zero becomes the depolarization wavefront band
- `phiRepolarizationMs` near zero becomes the repolarization wavefront band
- positive activation and negative repolarization values indicate active/depolarized tissue
- positive repolarization values indicate recovered tissue
- negative activation values indicate not-yet-activated tissue

The first tunable band widths are:

- depolarization wavefront: 18 ms
- repolarization wavefront: 26 ms

If the custom shader path is unavailable, the renderer falls back to a standard Three.js material colored by the region's evaluated tissue state. The fallback is less continuous, but it preserves the teaching state and selected-region behavior.
