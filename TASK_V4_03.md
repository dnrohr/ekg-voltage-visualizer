# TASK_V4_03.md - Anatomical Coordinate Normalization and Anchor Contract

## Status

Done

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

- Added anatomical anchor contract types for anchor kind, chamber hints, educational region ids, confidence, approximation notes, coordinate normalization, and normalized scene positions.
- Added `references/nih-heart-normal-female/anchors.v1.json` with approximate landmarks for apex, base, septal area, RV free wall, LV lateral wall, anterior wall, inferior wall, atrial references, and great-vessel reference.
- Added `packages/cardio-engine/src/anatomicalAnchors.ts` with deterministic `normalizeAnatomicalPoint`, `normalizeAnatomicalAnchors`, `validateAnatomicalAnchorSet`, and NIH anchor exports.
- Normalization mirrors renderer placement: source-bounds center, max-dimension scale to `1.08`, then scene offset `{ x: 0.28, y: 0.02, z: 0.52 }`.
- Updated anatomical mesh, asset pipeline, and V4 QA docs with the anchor coordinate contract and visual-honesty boundary.
- Added tests for deterministic anchor validation and normalization against known educational region ids and required approximation notes.
- Ran `npm run typecheck` successfully.
- Ran `npm test` successfully: 34 engine tests passed.
- Ran `npm run build` successfully; Vite reported the existing large chunk warning.
- Chrome/Playwright smoke on `http://127.0.0.1:5188` confirmed the app still loads, the optimized NIH preview reports loaded, and one 3D canvas renders.
