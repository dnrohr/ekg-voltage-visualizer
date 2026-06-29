# V4 Anatomical Asset QA

## NIH Whole-Heart Preview

- Source preview id: `nih-3d-3dpx-002636-whole-heart-preview`
- Runtime asset id: `nih-3d-3dpx-002636-whole-heart-optimized-v1`
- Source: NIH 3D entry `3DPX-002636`, "17 yo Female, Normal Heart"
- Source URL: `https://3d.nih.gov/entries/3DPX-002636`
- Source preview file: `apps/web/public/assets/nih-heart/ALM0006_Whole_NIH3D.glb`
- Optimized runtime file: `apps/web/public/assets/nih-heart/ALM0006_Whole_NIH3D.optimized.glb`
- Provenance manifest: `references/nih-heart-normal-female/manifest.preview.json`
- Retrieved: 2026-06-28
- Listed license: Public Domain / CC0
- Attribution required: no, but the app documentation keeps the NIH entry title and id for provenance.

## File And Geometry QA

- Source file size: 11,353,016 bytes.
- Source uploaded vertex count: 315,366.
- Source triangle count: 630,640.
- Optimized file size: 2,835,780 bytes.
- Optimized uploaded vertex count: 78,749.
- Optimized triangle count: 157,486.
- Optimized render vertex count: 472,458.
- Runtime format: GLB.
- Normals: not stored in the inspected GLBs; the renderer computes normals if a mesh child lacks them.
- UV coordinates: not present in the preview manifest.
- Textures: none bundled for this asset.
- Runtime transform: the renderer centers, scales, and offsets the source mesh into the teaching scene.

The optimized mesh is within the V4 acceptable preview range of 60,000 to 100,000 uploaded vertices. It is still a preview/reference layer, not a validated simulation mesh.

## Optimization Workflow

Run the repeatable local workflow with:

```bash
npm run optimize:nih-heart
```

The script uses glTF Transform v4.4.0 through `npx`:

1. inspect the unchanged NIH source preview GLB
2. weld duplicate/split vertices into a temporary GLB
3. simplify with `--ratio 0.25 --error 0.01`
4. remove the temporary welded file
5. inspect the optimized runtime GLB

The optimized derivative keeps the original source GLB in place and writes `apps/web/public/assets/nih-heart/ALM0006_Whole_NIH3D.optimized.glb`.

Visual comparison note: the optimized preview preserves the overall whole-heart silhouette and major surface folds needed for orientation, while fine trabecular/surface detail is softened. That tradeoff is acceptable for the translucent anatomical-reference role and should be revisited before any chamber segmentation work.

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
- study snapshot JSON includes optimized `anatomicalPreview.assetId`, `visible`, `opacity`, and the visual-reference role note
- failed GLB load displays the caption fallback state while preserving the procedural scene
