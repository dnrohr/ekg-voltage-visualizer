# TASKS.md

Status index for agent handoffs. If the user says "Work on the next task", pick the first task whose status is `Not started`, read its task file completely, then update this index and the task file as work progresses.

## How to Use

1. Read `ROADMAP.md` for the full product intent if context is needed.
2. Read this file to find the next incomplete task.
3. Read the selected `TASK_##.md` file completely before editing code.
4. Keep changes scoped to that task's deliverables.
5. Test the task's behavior, update relevant documentation, commit the finished task, and push the branch.
6. Update the status row here and the status block in the task file before handing off.

## Status Legend

- `Not started`: No implementation work has begun.
- `In progress`: Work has started but is not ready for handoff/review.
- `Blocked`: Work cannot continue without user input or an external dependency.
- `Done`: Exit criteria are met, tests/docs are complete, changes are committed and pushed, and verification notes are recorded.

## Task List

| Task | Status | Title | Depends on | File |
|---|---|---|---|---|
| 00 | Done | Concept, safety, and scientific framing | None | `TASK_00.md` |
| 01 | Not started | 2D electrical MVP | 00 | `TASK_01.md` |
| 02 | Not started | Physically grounded lead/electrode model | 01 | `TASK_02.md` |
| 03 | Not started | Better anatomical electrical model | 02 | `TASK_03.md` |
| 04 | Not started | 3D anatomy and torso visualization | 03 | `TASK_04.md` |
| 05 | Not started | Cardiac phase, valves, and heart sounds | 03 | `TASK_05.md` |
| 06 | Not started | Simplified contraction animation | 05 | `TASK_06.md` |
| 07 | Not started | Stylized blood flow | 06 | `TASK_07.md` |
| 08 | Not started | Scenario library and comparative learning | 03 | `TASK_08.md` |
| 09 | Not started | Reference data and validation layer | 08 | `TASK_09.md` |
| 10 | Not started | Polish, accessibility, and distribution | 01 | `TASK_10.md` |

## Current Next Task

`TASK_01.md`

## Handoff Notes

- Keep the app explicitly educational and non-diagnostic.
- Favor deterministic state derived from `scenario definition + normalized cardiac-cycle time`.
- Build the explanatory engine before visual realism.
- Start with 2D electrical intuition; defer 3D, valves, contraction, and blood until the basic explanation works.
- Every completed task should leave the repo in a handoff-ready state: tested, documented, committed, and pushed.
- Task 00 completed on branch `codex/task-00-concept-safety-framing`; next task is the 2D electrical MVP.
