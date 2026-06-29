# TASK_V4_03.md - Anatomical Coordinate Normalization and Anchor Contract

## Status

Not started

## Goal

Define a stable coordinate and anchor contract that lets educational regions map onto the anatomical heart without pretending the mesh has clinically validated segmentation.

## Depends On

- `TASK_V4_01.md`

## Deliverables

- TypeScript types or schema for anatomical anchors, chamber hints, region ids, confidence, and approximation notes.
- Documentation explaining how source GLB coordinates are normalized into the app scene.
- A first anchor metadata file for key landmarks such as apex, base, septal area, RV free-wall region, LV lateral wall, anterior wall, inferior wall, and atrial/great-vessel reference points.
- Optional debug overlay for axes, bounding box, and anchor points.
- Tests for deterministic anchor parsing and normalization.

## Suggested Files

- `packages/cardio-engine/src/`
- `packages/cardio-render-3d/src/`
- `references/nih-heart-normal-female/`
- `docs/ANATOMICAL_MESH_MODEL.md`
- `docs/ASSET_PIPELINE.md`

## Exit Criteria

- Anchor metadata can be loaded deterministically and transformed into the same coordinate space as the 3D scene.
- Each anchor includes approximation/confidence language.
- The code path does not require clinically segmented chamber meshes.
- Tests cover schema validation or normalization behavior.

## Verification Notes

Pending.
