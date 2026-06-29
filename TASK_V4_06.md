# TASK_V4_06.md - 2D Orientation Sketch Anatomical Redesign

## Status

Not started

## Goal

Replace the top 2D diagram with an anatomically honest orientation sketch that reads as a heart without pretending to be a literal chamber slice.

## Depends On

- `TASK_V4_03.md`

## Deliverables

- A redesigned 2D heart overview where the LV forms the dominant apex and the RV reads as an anterior/right-sided structure wrapping around the LV.
- Reduced misleading symmetry between ventricles.
- Clear atrial, septal, apex, and great-vessel orientation cues where useful.
- Existing electrodes, selected-lead vector, and timing overlays preserved or adapted.
- UI labeling that identifies the drawing as an orientation sketch.

## Suggested Files

- `packages/cardio-render-2d/src/`
- `apps/web/src/main.tsx`
- `apps/web/src/styles.css`
- `docs/ANATOMICAL_MESH_MODEL.md`

## Exit Criteria

- The sketch no longer suggests that the ventricles are two symmetric side-by-side blobs.
- LV, RV, septum, and apex orientation is visually plausible for med-student teaching.
- Lead/electrode overlays remain readable.
- Text and shapes do not overlap incoherently on desktop or mobile.
- Browser screenshots or smoke notes verify the top diagram at relevant widths.

## Verification Notes

Pending.
