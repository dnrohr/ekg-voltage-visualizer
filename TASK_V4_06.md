# TASK_V4_06.md - 2D Orientation Sketch Anatomical Redesign

## Status

Done

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

- Redesigned `HeartSchematic` as a 2D orientation sketch with LV as the dominant apex-forming chamber and RV as an anterior/right-sided wrap.
- Reduced symmetric side-by-side ventricular geometry and curved the septum toward the LV apex.
- Preserved electrodes, selected-lead vector, tissue nodes, activation/recovery overlays, valve/flow cues, and timing readout.
- Added orientation cue labels for RV anterior wrap, LV apex-forming chamber, apex, and great vessels.
- Added visible UI label: "Orientation sketch, not a literal chamber slice" and updated SVG aria label.
- Documented the V4 2D sketch boundary in `docs/ANATOMICAL_MESH_MODEL.md`.
- Ran `npm run typecheck` successfully.
- Ran `npm test` successfully: 34 engine tests passed.
- Ran `npm run build` successfully; Vite reported the existing large chunk warning.
- Chrome/Playwright smoke on fresh dev server `http://127.0.0.1:5191` confirmed desktop/mobile SVG bounds, orientation labels present, no horizontal overflow at 390 px, and orientation label text stays within viewport.
