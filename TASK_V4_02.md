# TASK_V4_02.md - Mesh Optimization and Decimation Workflow

## Status

Done

## Goal

Establish a repeatable workflow for reducing the high-poly NIH preview into a runtime-friendly asset while preserving provenance and visual usefulness.

## Depends On

- `TASK_V4_01.md`

## Deliverables

- A documented local workflow or script for mesh inspection, decimation, and GLB export.
- Before/after mesh counts, file sizes, material notes, and visual comparison notes.
- An optimized runtime GLB target if feasible.
- Manifest updates that distinguish source, preview, and optimized runtime assets.
- Clear fallback or deferral notes if optimization cannot be completed with available local tools.

## Suggested Files

- `docs/ASSET_PIPELINE.md`
- `references/nih-heart-normal-female/manifest.preview.json`
- `apps/web/public/assets/`
- `scripts/`
- `package.json`

## Exit Criteria

- The optimized mesh target is under roughly 60k-100k vertices, or the task documents why that target was deferred.
- The source asset remains traceable and unmodified.
- The runtime app uses the optimized asset when available.
- The visual difference is acceptable for an educational preview.
- Relevant tests/typechecks/builds pass, and browser smoke confirms the optimized asset renders.

## Verification Notes

- Generated optimized runtime GLB `apps/web/public/assets/nih-heart/ALM0006_Whole_NIH3D.optimized.glb` from the unchanged NIH source preview GLB.
- Added repeatable workflow script `scripts/optimize-nih-heart.mjs` and npm entry `npm run optimize:nih-heart`.
- Optimization workflow uses glTF Transform v4.4.0: inspect source, weld to a temporary GLB, simplify with `--ratio 0.25 --error 0.01`, remove temp file, inspect optimized output.
- Before: 315,366 uploaded vertices, 630,640 triangles, 1,891,920 render vertices, 11,353,016 bytes, no materials/textures.
- After: 78,749 uploaded vertices, 157,486 triangles, 472,458 render vertices, 2,835,780 bytes, no materials/textures.
- Updated renderer runtime path to `/assets/nih-heart/ALM0006_Whole_NIH3D.optimized.glb` and runtime asset id to `nih-3d-3dpx-002636-whole-heart-optimized-v1`.
- Updated preview manifest, asset pipeline docs, anatomical mesh model docs, and V4 QA notes with source/optimized distinction, before/after counts, material notes, and visual comparison note.
- Ran `npm run optimize:nih-heart` successfully.
- Ran `npm run typecheck` successfully.
- Ran `npm test` successfully: 33 engine tests passed.
- Ran `npm run build` successfully; Vite reported the existing large chunk warning.
- Chrome/Playwright smoke on `http://127.0.0.1:5188` confirmed the app requested `ALM0006_Whole_NIH3D.optimized.glb`, HEAD returned `200` with content length `2835780`, the preview debug marker loaded one mesh, and the caption reported the anatomical reference mesh as loaded.
