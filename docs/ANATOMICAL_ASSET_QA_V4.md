# V4 Anatomical Asset QA

## NIH Whole-Heart Preview

- Asset id: `nih-3d-3dpx-002636-whole-heart-preview`
- Source: NIH 3D entry `3DPX-002636`, "17 yo Female, Normal Heart"
- Source URL: `https://3d.nih.gov/entries/3DPX-002636`
- Runtime file: `apps/web/public/assets/nih-heart/ALM0006_Whole_NIH3D.glb`
- Provenance manifest: `references/nih-heart-normal-female/manifest.preview.json`
- Retrieved: 2026-06-28
- Listed license: Public Domain / CC0
- Attribution required: no, but the app documentation keeps the NIH entry title and id for provenance.

## File And Geometry QA

- File size: 11,353,016 bytes.
- Vertex count: 315,366.
- Face count: 630,640.
- Runtime format: GLB.
- Normals: present according to the preview manifest; the renderer recomputes normals if a mesh child lacks them.
- UV coordinates: not present in the preview manifest.
- Textures: none bundled for this asset.
- Runtime transform: the renderer centers, scales, and offsets the source mesh into the teaching scene.

The current mesh is above the V4 recommended interactive target of 60,000 to 100,000 vertices. It is acceptable only as a preview/reference layer while V4-02 defines and records an optimization path.

## Visual Review

The preview reads as a plausible whole-heart anatomical reference, but it is not yet segmented for simulation use. It should be visually interpreted as a translucent reference form behind or alongside the authored educational overlays.

Known limitations:

- No machine-readable RA, LA, RV, or LV chamber labels are bundled.
- No educational region ids are mapped to source vertices.
- Septum, valves, vessels, and chamber walls may be visible in the geometry, but they are not validated as labeled structures.
- The source coordinate system is normalized at runtime rather than treated as a physical patient-scale coordinate frame.
- The app does not project ECG voltage, tissue timing, or clinical measurements from this mesh.

## Usage Boundary

Allowed in the app:

- show/hide the preview as an anatomical reference
- adjust preview opacity
- compare the preview silhouette with procedural teaching overlays
- include the preview asset id and settings in study snapshots

Not supported:

- patient-specific anatomy
- clinically validated chamber segmentation
- diagnostic ECG interpretation
- electrophysiology simulation on the NIH mesh
- exact activation or recovery timing on the NIH geometry

If the GLB fails to load, the app must keep the procedural teaching mesh, ECG traces, lead vectors, region picker, and guided lessons available.

## V4-01 Browser Smoke Notes

Manual browser checks for V4-01 should confirm:

- desktop view exposes the NIH heart preview checkbox and opacity slider in the layer panel
- mobile width stacks the anatomical reference controls without text overlap
- toggling the preview off leaves the procedural teaching mesh and overlays visible
- opacity changes affect only the anatomical reference mesh
- study snapshot JSON includes `anatomicalPreview.assetId`, `visible`, `opacity`, and the visual-reference role note
- failed GLB load displays the caption fallback state while preserving the procedural scene
