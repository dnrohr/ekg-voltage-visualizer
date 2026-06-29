# TASK_V4_04.md - Chamber and Region Marker Mapping on Anatomical Heart

## Status

Done

## Goal

Use the V4 anchor contract to show approximate educational chamber and region markers on or near the anatomical heart.

## Depends On

- `TASK_V4_03.md`

## Deliverables

- A marker or halo layer that places existing educational region ids near their anatomical anchors.
- Selection synchronization between existing region inspection UI and anatomical markers.
- UI copy that says the mapping is approximate and educational.
- A debug/teaching control to compare procedural region patches with anatomical markers.
- Documentation of which mappings are confident, approximate, or deferred.

## Suggested Files

- `packages/cardio-engine/src/`
- `packages/cardio-render-3d/src/TorsoScene3D.tsx`
- `apps/web/src/main.tsx`
- `apps/web/src/styles.css`
- `docs/ANATOMICAL_MESH_MODEL.md`

## Exit Criteria

- Selecting or cycling a region visibly highlights the related anatomical marker.
- The marker layer can be toggled independently from the NIH mesh and procedural teaching surface.
- Existing region overlays still work.
- Browser smoke covers selected-region marker behavior at desktop and mobile sizes.

## Verification Notes

- Added independent `anatomicalMarkers` 3D layer and app-layer checkbox labeled `Anatomical markers`.
- Rendered clickable approximate marker spheres/halos/labels from `normalizedNihAnatomicalAnchors`.
- Marker clicks reuse existing `regionId` selection plumbing so the selected-region inspector remains synchronized.
- Selected regions highlight related markers with a larger marker, halo, and label; unmapped markers remain visible as lower-emphasis anchors.
- 3D caption now states that anatomical markers are approximate educational anchor mappings, not segmented chamber labels.
- Added marker-layer debug summary on `window.__nihAnatomicalMarkers` for browser smoke checks.
- Documented current marker confidence and deferred limitations in `docs/ANATOMICAL_MESH_MODEL.md`.
- Ran `npm run typecheck` successfully.
- Ran `npm test` successfully: 34 engine tests passed.
- Ran `npm run build` successfully; Vite reported the existing large chunk warning.
- Chrome/Playwright smoke on fresh dev server `http://127.0.0.1:5189` confirmed 10 markers, default selected `lv-lateral` marker sync, independent marker toggle to count `0`, selecting `apical-ventricles` updated selected marker ids to `apex` and `inferior-wall`, caption included approximate-mapping language, and 390 px mobile layout did not overflow.
