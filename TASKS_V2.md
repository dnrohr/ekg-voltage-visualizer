# TASKS_V2.md

Status index for V2 work derived from `V2_VISION.md` and `ROADMAP_V2.md`.

## Operating Rules

1. Read `ROADMAP_V2.md`.
2. Pick the first task whose status is `Not started`.
3. Read that `TASK_V2_##.md` file completely before editing code.
4. Keep changes scoped to the selected task.
5. Run relevant tests, typechecks, build, and browser/visual checks.
6. Update this index and the selected task file with verification notes.
7. Commit and push the completed task.
8. Reset context or compact when practical before continuing to the next task.

## Status Legend

- `Not started`: no implementation work has begun.
- `In progress`: implementation has begun but exit criteria are not all met.
- `Done`: exit criteria are met, tests/docs are complete, changes are committed and pushed.

## Task List

| Task | Status | Title | Depends on | File |
|---|---|---|---|---|
| V2-00 | Done | Roadmap and V2 task scaffold | `V2_VISION.md` | `TASK_V2_00.md` |
| V2-01 | Done | Continuous cardiac clock and precision playback | V2-00 | `TASK_V2_01.md` |
| V2-02 | Done | Educational heart surface model | V2-01 | `TASK_V2_02.md` |
| V2-03 | Done | Live activation and transmembrane maps | V2-02 | `TASK_V2_03.md` |
| V2-04 | Done | Isochrone contour map layer | V2-03 | `TASK_V2_04.md` |
| V2-05 | Done | Lead probe teaching mode | V2-03 | `TASK_V2_05.md` |
| V2-06 | Done | Region-to-lead inspection mode | V2-05 | `TASK_V2_06.md` |
| V2-07 | Done | Layer controls and learner modes | V2-06 | `TASK_V2_07.md` |
| V2-08 | Done | Mesh-aware mechanical contraction and chambers | V2-04 | `TASK_V2_08.md` |
| V2-09 | Done | Guided lessons and quizzes | V2-07 | `TASK_V2_09.md` |
| V2-10 | Done | Heart-first abnormal scenario extensions | V2-08 | `TASK_V2_10.md` |
| V2-11 | Done | V2 polish, performance, accessibility, and export | V2-10 | `TASK_V2_11.md` |
| V2-12 | Done | V2 validation audit and release handoff | V2-11 | `TASK_V2_12.md` |

## Current Next Task

All V2 tasks are complete.

## Notes

- V2-00 generated `ROADMAP_V2.md`, this index, and task files from `V2_VISION.md`.
- V2-01 added continuous millisecond clock helpers, 20x slowdown playback, millisecond/frame stepping, clock docs, tests, and UI controls.
- V2-02 added a 10-region educational heart surface model with RA/LA/RV/LV coverage, activation-node links, lead-sensitivity metadata, arbitrary-time evaluation, tests, and activation-model documentation.
- V2-03 added synchronized `SimulationState.surfaceRegions`, 3D activation-wave/electrical-state surface map modes, compact legend, tests, browser smoke, and documentation.
- V2-04 added 20 ms isochrone band generation, whole-heart/atria/ventricle scoped contour maps, current wavefront highlights, 3D contour rings/labels, tests, browser smoke, and documentation.
- V2-05 added the selected lead probe explanation model, enlarged synchronized trace, 3D projection arrow, alignment classification, region contribution readout, tests, browser smoke, and lead documentation.
- V2-06 added selected surface-region inspection, pointer selection in 3D, keyboard-accessible region selection, region timing and lead-signature panels, ECG trace indicators, tests, browser smoke, and documentation.
- V2-07 added learner mode presets, electrical/mechanical/ECG layer toggles, saved layer presets, renderer layer props, desktop/mobile browser smoke, and documentation.
- V2-08 added region-level electromechanical delay, local wall deformation cues, per-chamber volume fractions, translucent 3D chamber volumes, tests for delayed contraction/no premature QRS volume loss, browser smoke, and mechanical documentation.
- V2-09 added six live guided lessons, non-blocking lesson navigation, immediate quiz feedback, mode/time/lead/region synchronization, browser smoke, and lesson documentation.
- V2-10 added heart-first abnormal teaching scenarios for prolonged conduction delay, ventricular ectopic focus, and reversed arm leads; refined BBB notes; electrode-position overrides; scenario validation tests; browser smoke; and validation documentation.
- V2-11 added 3D dynamic-object disposal, stable keyboard handlers, region/lesson keyboard shortcuts, broader high-contrast and reduced-motion styling, JSON study snapshot export, desktop/mobile smoke, and polish/export documentation.
- V2-12 added the V2 release audit, README handoff updates, final verification evidence, and release limitations.
- V2 work should preserve the V1 educational disclaimer and avoid clinical diagnostic claims.
