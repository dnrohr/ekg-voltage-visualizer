# TASK_V4_07.md - Med-Student Anatomy Explanations and Lesson Updates

## Status

Done

## Goal

Make the improved anatomy pedagogically useful by adding concise explanations that help med students interpret the 3D and 2D views honestly.

## Depends On

- `TASK_V4_05.md`
- `TASK_V4_06.md`

## Deliverables

- Concise UI explanations for RV/LV orientation, septum, apex, atria, great vessels, and selected-lead viewpoint.
- Guided lesson updates that reference anatomical preview, hybrid wavefront, and orientation-sketch modes.
- Copy that distinguishes visual reference anatomy from the authored electrical model.
- Optional quiz or check-for-understanding prompts tied to chamber orientation and lead perspective.
- Documentation updates for terminology and safety boundaries.

## Suggested Files

- `packages/cardio-content/src/`
- `apps/web/src/main.tsx`
- `apps/web/src/styles.css`
- `docs/V3_GUIDED_LESSONS.md`
- `docs/GLOSSARY.md`
- `docs/SAFETY_AND_SCOPE.md`

## Exit Criteria

- Learners get practical anatomy context without opening developer docs.
- Guided lessons mention the improved anatomy only where it supports the learning objective.
- Copy avoids diagnostic claims and avoids overstating anatomical accuracy.
- Relevant tests/builds pass, and browser smoke checks the lesson/explanation UI.

## Verification Notes

- Added concise learner-facing anatomy notes for RV/LV orientation, septum, apex, atria, great vessels, and selected-lead viewpoint.
- Updated guided lesson copy to reference hybrid anatomical overlay, anatomical markers, cutaway/chamber anatomy, recovery rings, and the 2D orientation sketch where relevant.
- Copy explicitly distinguishes NIH reference anatomy from authored electrical timing and avoids diagnostic claims.
- Updated glossary with anatomical marker, anatomical overlay, hybrid overlay, and orientation sketch terms.
- Updated safety/scope rules for orientation sketch, NIH visual reference, anatomical markers, and hybrid overlays.
- Added V4 anatomy addendum to guided lesson docs.
- Ran `npm run typecheck` successfully.
- Ran `npm test` successfully: 34 engine tests passed.
- Ran `npm run build` successfully; Vite reported the existing large chunk warning.
- Chrome/Playwright smoke on fresh dev server `http://127.0.0.1:5192` confirmed six anatomy notes, selected-lead viewpoint note for Lead II, updated normal-QRS lesson copy, updated precordial lesson mesh focus, and 390 px mobile notes layout without overflow.
