# TASKS_V3.md

Status index for V3 visual/anatomical-heart work derived from `ROADMAP_V3.md`.

## Operating Rules

1. Read `ROADMAP_V3.md`.
2. Pick the first task whose status is `Not started`.
3. Read that `TASK_V3_##.md` file completely before editing code.
4. Keep changes scoped to the selected task.
5. Run relevant tests, typechecks, build, and browser/visual checks when UI changed.
6. Update this index and the selected task file with verification notes.
7. Commit and push the completed task to `main`.
8. Reset context or compact when practical before continuing to the next task.

## Status Legend

- `Not started`: no implementation work has begun.
- `In progress`: implementation has begun but exit criteria are not all met.
- `Done`: exit criteria are met, tests/docs are complete, changes are committed and pushed.

## Task List

| Task | Status | Title | Depends on | File |
|---|---|---|---|---|
| V3-00 | Done | Roadmap and V3 task scaffold | V2 complete | `TASK_V3_00.md` |
| V3-01 | Done | Mesh field and level-set engine contract | V3-00 | `TASK_V3_01.md` |
| V3-02 | Done | Anatomical asset pipeline and provenance manifest | V3-01 | `TASK_V3_02.md` |
| V3-03 | Done | External heart mesh renderer foundation | V3-02 | `TASK_V3_03.md` |
| V3-04 | Not started | Shader-driven depolarization and repolarization wavefront | V3-03 | `TASK_V3_04.md` |
| V3-05 | Not started | Isochrone and level-set contour rendering | V3-04 | `TASK_V3_05.md` |
| V3-06 | Not started | Chamber/cutaway anatomy mode | V3-03 | `TASK_V3_06.md` |
| V3-07 | Not started | Lead contribution overlays on mesh | V3-04 | `TASK_V3_07.md` |
| V3-08 | Not started | Med-student inspection panels and explanations | V3-07 | `TASK_V3_08.md` |
| V3-09 | Not started | Scenario comparison viewer | V3-07 | `TASK_V3_09.md` |
| V3-10 | Not started | V3 guided lessons for propagation and leads | V3-08 | `TASK_V3_10.md` |
| V3-11 | Not started | Performance, accessibility, and export pass | V3-10 | `TASK_V3_11.md` |
| V3-12 | Not started | V3 validation audit and release handoff | V3-11 | `TASK_V3_12.md` |

## Current Next Task

V3-04 is next.

## Notes

- V3 should preserve the V1/V2 educational safety posture and avoid diagnostic claims.
- V3 should build from the current authored V2 surface model first, then allow imported anatomical assets once provenance and validation are in place.
- V3-00 created `ROADMAP_V3.md`, this index, and task files through V3-12.
- V3-01 added engine mesh-field and level-set types, `buildHeartMeshField`, tests for deterministic topology and wavefront `phi` values, and `docs/ANATOMICAL_MESH_MODEL.md`.
- V3-02 added an anatomical asset manifest contract, validator, example manifest, asset-pipeline docs, and tests for accepted/rejected mesh provenance.
- V3-03 threaded `heartMeshField` into `SimulationState`, added a Three.js mesh-field adapter in the 3D renderer, made the external mesh the primary heart surface, preserved region picking and overlays, and documented the renderer foundation.
