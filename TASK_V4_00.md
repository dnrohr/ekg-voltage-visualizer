# TASK_V4_00.md - Roadmap and V4 Task Scaffold

## Status

Done

## Goal

Create the V4 anatomical-fidelity and visual-honesty roadmap and task scaffold so future agents can continue without conversation context.

## Depends On

- Completed V3 roadmap and implementation artifacts.
- App-browser review of the NIH anatomical preview and top 2D diagram.
- User feedback that the current views still do not read clearly as a heart.

## Deliverables

- `ROADMAP_V4.md`
- `TASKS_V4.md`
- `TASK_V4_00.md` through `TASK_V4_09.md`
- Initial V4 status index with the next implementation task identified

## Suggested Files To Inspect

- `ROADMAP_V3.md`
- `TASKS_V3.md`
- `TASK_V3_12.md`
- `docs/V3_RELEASE_AUDIT.md`
- `docs/ASSET_PIPELINE.md`
- `docs/ANATOMICAL_MESH_MODEL.md`
- `README.md`

## Exit Criteria

- The roadmap explains why V4 exists after V3 and defines the visual-honesty standard.
- The roadmap covers anatomical asset QA, mesh optimization, anchors, region mapping, wavefront projection, 2D orientation sketch redesign, med-student explanations, performance/export, and release audit.
- Each task is granular enough for implementation/test/document/commit/push loops.
- Each task contains enough context for a fresh agent to start from the task file plus repository state.
- Planning artifacts are committed and pushed to `main`.

## Verification Notes

Generated `ROADMAP_V4.md`, `TASKS_V4.md`, and `TASK_V4_00.md` through `TASK_V4_09.md`. The roadmap centers anatomical credibility, explicit approximation boundaries, and the need to distinguish the real NIH mesh from authored teaching overlays.

Verification:

- Confirmed task files exist in the worktree.
- `git diff --check`
