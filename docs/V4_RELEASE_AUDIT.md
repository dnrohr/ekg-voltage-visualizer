# V4 Release Audit

V4 is complete as an anatomical-fidelity and visual-honesty release. It improves the visual credibility of the 3D and 2D heart views, adds an optimized NIH anatomical preview path, maps educational regions to approximate anatomical anchors, and gives learners controls for comparing procedural, anatomical, and hybrid overlays.

V4 remains an educational physiology and signal-formation simulator. It does not provide patient-specific anatomy, clinically validated chamber segmentation, diagnostic ECG interpretation, or a solved electrophysiology field on the NIH mesh.

## Release Scope

Supported V4 claims:

- The bundled NIH heart preview is provenance-tracked, optimized for runtime use, and identified in exports.
- Anatomical preview visibility, opacity, marker layer, and overlay mode are learner-controllable.
- Educational region anchors are normalized into the app coordinate system and rendered as approximate anatomical markers.
- Anatomical wavefront and isochrone overlays are projected from authored teaching timing onto approximate anchors.
- The top 2D heart graphic is an orientation sketch with an apex-forming LV and anterior RV wrap, not a literal slice.
- Learner-facing copy, safety docs, and export metadata distinguish real anatomical reference from procedural teaching overlays.

Unsupported claims:

- The NIH mesh is not segmented into clinically validated chambers or walls.
- Region anchors are approximate authored teaching coordinates, not measured anatomical annotations.
- The projected rings are not a numerical electrophysiology solve on the anatomical heart.
- The 2D sketch is hand-authored and is not derived from a patient or atlas projection.
- No cardiology, EP, radiology, anatomy educator, or accessibility expert review has been completed.

## Evidence Map

| Roadmap requirement | Evidence |
|---|---|
| Better anatomical asset strategy for the NIH heart preview | `references/nih-heart-normal-female/manifest.preview.json`, `apps/web/public/assets/nih-heart/ALM0006_Whole_NIH3D.optimized.glb`, `scripts/optimize-nih-heart.mjs`, `package.json` |
| Validated preview manifest and QA notes | `docs/ANATOMICAL_ASSET_QA_V4.md`, `references/nih-heart-normal-female/manifest.preview.json` |
| First pass chamber/region anchor mapping | `references/nih-heart-normal-female/anchors.v1.json`, `apps/web/src/main.tsx`, `apps/web/src/components/TorsoScene3D.tsx`, `docs/ANATOMICAL_MESH_MODEL.md` |
| Wavefront/isochrone overlay related to anatomy | `apps/web/src/components/TorsoScene3D.tsx`, `apps/web/src/main.tsx`, `docs/VALIDATION.md`, `docs/ANATOMICAL_MESH_MODEL.md` |
| Anatomically honest 2D orientation sketch | `apps/web/src/components/HeartSchematic.tsx`, `apps/web/src/styles.css`, `docs/ANATOMICAL_MESH_MODEL.md` |
| Controls comparing anatomical preview, teaching mesh, and hybrid overlay | `apps/web/src/main.tsx`, `apps/web/src/components/TorsoScene3D.tsx`, `apps/web/src/styles.css` |
| Performance safeguards and decimation plan | `scripts/optimize-nih-heart.mjs`, `docs/ANATOMICAL_ASSET_QA_V4.md`, `docs/V3_PERFORMANCE_ACCESSIBILITY_EXPORT.md`, `apps/web/src/components/TorsoScene3D.tsx` |
| Release audit of supported anatomical claims | `docs/V4_RELEASE_AUDIT.md`, `docs/SAFETY_AND_SCOPE.md`, `docs/VALIDATION.md`, `TASKS_V4.md` |

## Milestone Status

| Milestone | Status | Notes |
|---|---|---|
| A - Asset QA and preview controls | Done | Preview controls, fallback caption, QA notes, and asset metadata are present. |
| B - Mesh optimization path | Done | Optimized GLB is 2,835,780 bytes with 78,749 uploaded vertices; source provenance remains documented. |
| C - Anatomical anchors and region mapping | Done | Approximate anchors and region markers are normalized and documented. |
| D - Anatomical wavefront overlay | Done | Procedural, anatomical, and hybrid modes are available, with debug summaries for projected anchors. |
| E - 2D orientation sketch redesign | Done | The sketch shows RV anterior wrap, LV apex formation, apex, and great vessel orientation labels. |
| F - Med-student anatomy explanations | Done | Anatomy notes, glossary, guided lesson copy, and safety scope were updated. |
| G - Performance, accessibility, and export update | Done | Pixel-ratio caps, reduced-motion handling, keyboard shortcuts, and export metadata are implemented. |
| H - Validation audit and handoff | Done | This audit records evidence, limitations, verification, and expert-review needs. |

## Verification

Final V4 command verification:

```bash
npm run typecheck
npm test
npm run build
```

Expected build note: Vite reports the existing large-chunk warning after minification. The warning is tracked as a future code-splitting and asset-loading improvement; it did not block V4 release.

Browser smoke coverage accumulated through V4:

- V4-01 through V4-03 loaded the NIH anatomical preview on desktop and mobile, verified preview metadata, and confirmed anchor normalization.
- V4-04 toggled anatomical markers, selected marker regions, and checked mobile marker layout.
- V4-05 switched procedural/anatomical/hybrid overlay modes, scrubbed timing, and confirmed projected anchor summaries.
- V4-06 checked the 2D orientation sketch at desktop and mobile widths for label/shape overlap.
- V4-07 opened anatomy notes and guided lesson copy, including selected-lead viewpoint explanations.
- V4-08 exercised keyboard shortcuts, snapshot export metadata, high-contrast/reduced-motion states, and mobile render-budget caps.
- V4-09 final smoke on `http://127.0.0.1:5194` checked anatomical 3D preview load, hybrid projection status, 2D orientation sketch labeling, and mobile layout.

Final V4-09 browser-smoke result:

- Desktop Chrome rendered the 3D canvas and loaded the NIH preview with `meshCount: 1`.
- Hybrid overlay debug reported `projectedAnchorCount: 9`, `scope: ventricles`, and `mode: hybrid` on initial load.
- Anatomical marker debug reported `count: 10` with selected-region synchronization.
- Keyboard overlay cycling changed the projection mode to `anatomical`.
- The 2D orientation sketch text was visible, including `LV apex-forming` and `RV anterior wrap`.
- Mobile width `390px` reported `overflowX: 0` and a render-budget `pixelRatioCap: 1`.

## Known Limitations And Deferred Work

- The optimized NIH preview is a visual reference, not a chamber-segmented teaching model.
- Anchors are approximate and should be reviewed against an anatomical atlas or expert annotations before stronger anatomical claims are made.
- The anatomical overlay uses authored timing projected onto anchors; it does not solve activation/recovery over the mesh.
- Marker labels are not occlusion-aware and do not yet snap to nearest mesh surface points.
- The 2D orientation sketch is credible for orientation, but not a precise anatomical projection.
- The runtime asset still adds meaningful render cost. Future work should add code splitting, progressive asset loading, and lower-detail fallback assets.
- Exported screenshots and snapshots include V4 anatomy settings, but there is no full reproducibility package for asset transforms and camera state.

## Expert Review Needs

Before presenting V4 as anatomically validated, the project needs review from:

- A cardiology or electrophysiology reviewer for wavefront/lead explanation language.
- An anatomy educator for chamber orientation, great vessel labeling, and med-student usefulness.
- A cardiac imaging or 3D anatomy reviewer for NIH mesh positioning and anchor placement.
- An accessibility reviewer for keyboard, contrast, motion, and dense visualization ergonomics.

## Handoff

V4 is ready for normal educational-app use under the existing safety scope. The next release should focus on one of two tracks:

1. Anatomical rigor: expert-reviewed anchors, mesh-adjacent labels, optional segmentation, and better projection math.
2. Runtime polish: code splitting, lazy 3D asset loading, mobile detail levels, and export reproducibility.
