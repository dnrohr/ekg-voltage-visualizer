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
| V2-05 | Not started | Lead probe teaching mode | V2-03 | `TASK_V2_05.md` |
| V2-06 | Not started | Region-to-lead inspection mode | V2-05 | `TASK_V2_06.md` |
| V2-07 | Not started | Layer controls and learner modes | V2-06 | `TASK_V2_07.md` |
| V2-08 | Not started | Mesh-aware mechanical contraction and chambers | V2-04 | `TASK_V2_08.md` |
| V2-09 | Not started | Guided lessons and quizzes | V2-07 | `TASK_V2_09.md` |
| V2-10 | Not started | Heart-first abnormal scenario extensions | V2-08 | `TASK_V2_10.md` |
| V2-11 | Not started | V2 polish, performance, accessibility, and export | V2-10 | `TASK_V2_11.md` |
| V2-12 | Not started | V2 validation audit and release handoff | V2-11 | `TASK_V2_12.md` |

## Current Next Task

`TASK_V2_05.md`

## Notes

- V2-00 generated `ROADMAP_V2.md`, this index, and task files from `V2_VISION.md`.
- V2-01 added continuous millisecond clock helpers, 20x slowdown playback, millisecond/frame stepping, clock docs, tests, and UI controls.
- V2-02 added a 10-region educational heart surface model with RA/LA/RV/LV coverage, activation-node links, lead-sensitivity metadata, arbitrary-time evaluation, tests, and activation-model documentation.
- V2-03 added synchronized `SimulationState.surfaceRegions`, 3D activation-wave/electrical-state surface map modes, compact legend, tests, browser smoke, and documentation.
- V2-04 added 20 ms isochrone band generation, whole-heart/atria/ventricle scoped contour maps, current wavefront highlights, 3D contour rings/labels, tests, browser smoke, and documentation.
- V2 work should preserve the V1 educational disclaimer and avoid clinical diagnostic claims.
