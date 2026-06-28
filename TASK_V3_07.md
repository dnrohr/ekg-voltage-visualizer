# TASK_V3_07.md - Lead Contribution Overlays on Mesh

## Status

Not started

## Goal

Make selected ECG lead behavior causally visible on the V3 mesh.

## Depends On

- `TASK_V3_04.md`

## Deliverables

- Mesh-region highlighting for contributors to the selected lead at current time.
- Visual distinction for aligned, opposed, and weak/perpendicular contributors.
- Synchronized ECG trace markers for highlighted contributors.
- Tests for deterministic lead-contribution classification where feasible.

## Suggested Files

- `packages/cardio-engine/src/probe.ts`
- `packages/cardio-engine/src/anatomicalMesh.ts`
- `packages/cardio-render-3d/src/`
- `packages/cardio-render-2d/src/`
- `docs/ECG_LEADS.md`
- `TASKS_V3.md`
- `TASK_V3_07.md`

## Exit Criteria

- Selecting a lead visibly changes mesh emphasis in a way that matches lead explanation text.
- Existing region-to-lead teaching still works.
- `npm test`, `npm run typecheck`, `npm run build`, and browser smoke pass.

## Verification Notes

Pending.
