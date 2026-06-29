# TASK_V4_04.md - Chamber and Region Marker Mapping on Anatomical Heart

## Status

Not started

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

Pending.
