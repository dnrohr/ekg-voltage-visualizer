# TASK_V4_02.md - Mesh Optimization and Decimation Workflow

## Status

Not started

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

Pending.
