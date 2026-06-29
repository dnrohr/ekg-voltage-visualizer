# TASKS_V4.md

Status index for V4 anatomical-fidelity and visual-honesty work derived from `ROADMAP_V4.md`.

## Operating Rules

1. Read `ROADMAP_V4.md`.
2. Pick the first task whose status is `Not started`.
3. Read that `TASK_V4_##.md` file completely before editing code.
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
| V4-00 | Done | Roadmap and V4 task scaffold | V3 complete | `TASK_V4_00.md` |
| V4-01 | Done | Anatomical asset QA and preview controls | V4-00 | `TASK_V4_01.md` |
| V4-02 | Done | Mesh optimization and decimation workflow | V4-01 | `TASK_V4_02.md` |
| V4-03 | Done | Anatomical coordinate normalization and anchor contract | V4-01 | `TASK_V4_03.md` |
| V4-04 | Not started | Chamber and region marker mapping on anatomical heart | V4-03 | `TASK_V4_04.md` |
| V4-05 | Not started | Anatomical wavefront and isochrone projection prototype | V4-04 | `TASK_V4_05.md` |
| V4-06 | Not started | 2D orientation sketch anatomical redesign | V4-03 | `TASK_V4_06.md` |
| V4-07 | Not started | Med-student anatomy explanations and lesson updates | V4-05, V4-06 | `TASK_V4_07.md` |
| V4-08 | Not started | Performance, accessibility, and export update for anatomy modes | V4-05, V4-07 | `TASK_V4_08.md` |
| V4-09 | Not started | V4 validation audit and release handoff | V4-08 | `TASK_V4_09.md` |

## Current Next Task

Continue with `TASK_V4_04.md`.

## Notes

- V4 preserves the V1/V2/V3 educational safety posture and avoids diagnostic claims.
- V4 focuses on visual credibility: anatomical reference, procedural teaching simulation, and hybrid overlays must be visibly and verbally distinct.
- V4-00 created `ROADMAP_V4.md`, this index, and task files through V4-09.
- V4-01 added reversible NIH anatomical preview controls, exported preview metadata, loader failure caption fallback, and V4 asset QA documentation. Verification: `npm run typecheck`, `npm test`, `npm run build`, Chrome/Playwright desktop/mobile smoke on `http://127.0.0.1:5188`, and snapshot export metadata smoke.
- V4-02 added optimized runtime GLB `ALM0006_Whole_NIH3D.optimized.glb` at 78,749 uploaded vertices / 2,835,780 bytes, repeatable `npm run optimize:nih-heart` workflow, renderer switch to optimized asset id `nih-3d-3dpx-002636-whole-heart-optimized-v1`, and source/optimized manifest plus docs. Verification: `npm run optimize:nih-heart`, `npm run typecheck`, `npm test`, `npm run build`, and Chrome/Playwright optimized-asset load smoke.
- V4-03 added the approximate anatomical anchor contract, NIH anchor metadata, deterministic normalization utilities, tests, and docs for source-to-scene coordinate mapping. Verification: `npm run typecheck`, `npm test`, `npm run build`, and Chrome/Playwright app-load smoke.
