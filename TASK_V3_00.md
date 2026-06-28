# TASK_V3_00.md - Roadmap and V3 Task Scaffold

## Status

Done

## Goal

Create the V3 visual/anatomical-heart roadmap and task scaffold so future agents can continue without conversation context.

## Depends On

- Completed V2 roadmap and implementation artifacts.
- `V2_VISION.md`
- Existing V2 docs and task conventions.

## Deliverables

- `ROADMAP_V3.md`
- `TASKS_V3.md`
- `TASK_V3_00.md` through `TASK_V3_12.md`
- Initial V3 status index with the next implementation task identified

## Suggested Files To Inspect

- `ROADMAP_V2.md`
- `TASKS_V2.md`
- `TASK_V2_00.md`
- `V2_VISION.md`
- `docs/ASSET_PIPELINE.md`
- `docs/ACTIVATION_MODEL.md`

## Exit Criteria

- The roadmap describes the anatomical external-heart, chamber/cutaway, wavefront, level-set, and lead-teaching direction.
- Each task is granular enough for implementation/test/document/commit/push loops.
- Each task contains enough context for a fresh agent to start from the task file plus repository state.
- Planning artifacts are committed and pushed to `main`.

## Verification Notes

Generated `ROADMAP_V3.md`, `TASKS_V3.md`, and `TASK_V3_00.md` through `TASK_V3_12.md`. The roadmap covers external anatomical heart rendering, chamber/cutaway mode, shader wavefronts, level-set contours, lead contribution overlays, scenario comparison, med-student lessons, performance/accessibility/export, and release audit expectations.

Verification:

- Confirmed task files exist in the worktree.
- `npm test`
- `npm run typecheck`
- `npm run build`
