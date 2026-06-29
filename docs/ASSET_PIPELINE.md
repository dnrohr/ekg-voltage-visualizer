# Asset Pipeline

## Current 3D Asset Strategy

The Task 04 3D view uses procedural geometry generated at runtime with Three.js:

- transparent torso shell from an ellipsoid primitive
- simplified heart chambers from scaled ellipsoid primitives
- coarse surface patch meshes from the engine's authored heart-surface regions
- electrode markers from the engine's `electrodeDefinitions`
- tissue activation markers from the current `SimulationState`
- selected-lead overlays from the existing lead terminal definitions

No third-party anatomy meshes, textures, HDRIs, or reference images are bundled in the current app.

## Why Procedural First

Procedural geometry keeps the educational model inspectable and avoids early license or cleanup work. The first 3D goal is spatial intuition: heart position, electrode placement, selected lead relationship, and tissue state. It is not anatomical realism.

The renderer is deterministic from the same inputs as the 2D view:

```text
scenario definition + normalized cardiac-cycle time
```

The 3D package should not introduce independent physiology state.

## Coordinate Mapping

The engine coordinate convention remains the source of truth:

- `x`: patient left
- `y`: patient anterior
- `z`: patient superior

The Three.js scene maps this to:

```text
scene.x = model.x
scene.y = model.z
scene.z = model.y
```

This preserves superior/inferior as vertical in the rendered scene while keeping anterior/posterior as depth.

## Camera Presets

Task 04 ships four camera presets:

- frontal: torso and limb/chest electrode overview
- transverse: superior view for anterior chest electrode placement
- left lateral: side view for chest depth and lateral leads
- heart close-up: tissue-state and net-vector inspection

Camera controls are preset-based rather than free orbit controls so learners land in predictable views.

## Cutaway Mode

Cutaway mode hides the transparent torso shell while retaining electrodes, heart geometry, tissue nodes, lead overlays, and the net vector. This is intended for quick anatomy inspection, not as a surgical or anatomical slice.

## V3 Anatomical Mesh Intake Gate

V3 may use a realistic anatomical heart mesh only after an asset manifest passes review. The manifest format is typed as `AnatomicalAssetManifest` in `packages/cardio-engine/src/types.ts`, validated by `validateAnatomicalAssetManifest` in `packages/cardio-engine/src/assetManifest.ts`, and illustrated by `references/anatomical-heart-asset-manifest.example.json`.

The intake gate exists so the app does not accidentally bundle unclear or restricted anatomy assets. A mesh must be rejected until blocking validation errors are resolved.

## Experimental NIH Preview

The app includes one visual-only anatomical preview asset:

- Source: NIH 3D entry `3DPX-002636`, "17 yo Female, Normal Heart"
- Runtime file: `apps/web/public/assets/nih-heart/ALM0006_Whole_NIH3D.glb`
- Provenance: `references/nih-heart-normal-female/manifest.preview.json`
- License shown on NIH entry: Public Domain / CC0
- V4 QA notes: `docs/ANATOMICAL_ASSET_QA_V4.md`

This preview is intentionally not treated as a validated V3 simulation mesh. It is not chamber-labeled, not region-mapped, and exceeds the recommended vertex target. The renderer uses it as a translucent anatomical reference while the procedural educational mesh remains the source of wavefront timing, lead overlays, and selectable regions.

V4-01 makes the preview reversible in the learner UI. The anatomical reference can be hidden or faded independently, and study snapshot exports record the preview asset id plus visibility/opacity settings. A failed GLB load must leave the procedural teaching scene usable.

### Accepted Runtime Formats

- Source/original formats: `.glb`, `.gltf`, or `.obj`.
- Runtime optimized format: `.glb`.
- Textures, if used, should be web-sized and listed in the manifest.
- Geometry must be triangular or triangulatable.
- Vertex normals are required for anatomical lighting.

### Recommended Web Targets

- Target maximum vertices: 60,000 for the main interactive heart mesh.
- Hard review threshold: document a performance reason before exceeding 100,000 target vertices.
- Target maximum texture size: 2048 px on the longest side.
- Use mesh compression only when the runtime loader path is documented and browser-tested.

### Required Manifest Evidence

Before adding third-party assets, record all of the following in a manifest:

- source URL and title
- author or institution
- retrieval date
- license name and license URL
- attribution requirements
- whether commercial use is allowed
- whether redistribution is allowed
- whether the asset can be bundled in the repository
- modifications made
- original file format and optimized output format
- vertex and face counts
- normals and UV availability
- scale unit and coordinate system
- chamber segmentation coverage
- mapped anatomical region ids
- septum and valve availability
- optimization targets
- educational-use notes

### Segmentation Requirements

The minimum useful anatomical mesh must identify:

- right atrium (`RA`)
- left atrium (`LA`)
- right ventricle (`RV`)
- left ventricle (`LV`)
- septum availability
- anatomical region ids that can map to the existing educational surface regions

Valves are strongly preferred for V3 chamber/cutaway teaching. If valves are absent, the manifest must say so and the renderer must keep the procedural valve fallback.

### Automatic Rejection Conditions

Reject or quarantine the asset if:

- redistribution is disallowed but the asset is proposed for repository bundling
- license, source, author, or attribution text is missing
- optimized runtime format is not GLB
- normals are missing
- chamber labels do not cover all four chambers
- region ids are missing
- physical-scale assets omit a documented maximum dimension
- educational-use boundaries are missing

Warnings such as non-commercial limitations, missing septum, high vertex count, or large textures require explicit review before merge.

## Procedural Fallback

The V2/V3 procedural path remains mandatory even after an anatomical asset is approved. Environments without bundled assets, with failed manifest validation, or with unsupported rendering features must continue using:

- the authored educational heart surface
- mesh fields from `buildHeartMeshField`
- procedural chamber and valve cues
- synchronized ECG, lead, and wavefront state

The fallback is part of the product, not a temporary error state.

## Known Limitations

- The heart surface is a coarse authored patch mesh over a chamber schematic, not a realistic anatomical mesh.
- The torso is an ellipsoid shell and does not model tissue conductivity.
- Electrode locations are normalized teaching positions.
- Color maps are surface patch states, not volumetric myocardial activation.
- The selected lead overlay connects electrode/reference centers geometrically; it does not imply current travels along that line.
