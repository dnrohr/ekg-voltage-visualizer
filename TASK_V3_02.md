# TASK_V3_02.md - Anatomical Asset Pipeline and Provenance Manifest

## Status

Not started

## Goal

Define the asset pipeline required before using a realistic heart mesh in the app.

## Depends On

- `TASK_V3_01.md`

## Deliverables

- Asset provenance manifest format covering source, author, license, modification notes, and redistribution constraints.
- Accepted geometry formats and optimization targets.
- Validation notes for normals, scale, chamber segmentation, region ids, and missing metadata.
- Procedural fallback requirements for environments without bundled anatomy assets.
- Documentation updates in `docs/ASSET_PIPELINE.md`.

## Suggested Files

- `docs/ASSET_PIPELINE.md`
- `docs/ANATOMICAL_MESH_MODEL.md`
- optional `references/`
- optional validation script under a repo-appropriate scripts directory
- `TASKS_V3.md`
- `TASK_V3_02.md`

## Exit Criteria

- A future agent can import or reject an anatomical mesh using the documented criteria.
- No unlicensed third-party asset is added without provenance.
- `npm test`, `npm run typecheck`, and `npm run build` pass if code changes are made.

## Verification Notes

Pending.
