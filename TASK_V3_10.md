# TASK_V3_10.md - V3 Guided Lessons for Propagation and Leads

## Status

Done

## Goal

Add guided lessons that use the V3 mesh, wavefront, lead overlays, and scenario comparison mode.

## Depends On

- `TASK_V3_08.md`

## Deliverables

- Guided lessons for normal QRS propagation, precordial lead views, limb lead axes, RBBB/LBBB-style delays, ectopic focus, and repolarization.
- Lesson steps that set time, lead, scenario, camera/mode, and selected region.
- Short quiz prompts with immediate educational feedback.

## Suggested Files

- `apps/web/src/main.tsx`
- `docs/V2_GUIDED_LESSONS.md` or a new V3 lesson doc
- `TASKS_V3.md`
- `TASK_V3_10.md`

## Exit Criteria

- Lessons use the V3 visuals rather than only text.
- Existing V2 lessons still work or are intentionally superseded.
- `npm test`, `npm run typecheck`, `npm run build`, and browser smoke pass.

## Verification Notes

Completed:

- Replaced the V2-oriented lesson set with seven V3 lessons covering normal QRS propagation, limb lead axes, precordial views, bundle-branch-delay comparison, ectopic focus, repolarization/T wave, and normal-vs-abnormal comparison.
- Extended lessons so each step sets scenario, comparison scenario, time, selected lead, selected region, learner mode, 3D camera preset, and anatomy mode.
- Added V3 mesh-focus prompts to the lesson card.
- Added lesson-controlled camera/anatomy props to `TorsoScene3D` while preserving manual toolbar controls.
- Documented the V3 lesson coverage and quiz rules in `docs/V3_GUIDED_LESSONS.md`.

Verification:

- `npm test`
- `npm run typecheck`
- `npm run build`
- Browser smoke for V3 lesson navigation, scenario switching, and 3D view preset application at `http://127.0.0.1:5187/`
