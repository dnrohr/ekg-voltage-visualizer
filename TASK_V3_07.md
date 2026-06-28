# TASK_V3_07.md - Lead Contribution Overlays on Mesh

## Status

Done

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

Completed:

- Added deterministic selected-lead contributor classification: aligned, opposed, and weak.
- Extended selected-lead probe region data with contribution class, activation timing, and recovery timing.
- Added V3 mesh contributor halos and markers driven by the selected lead.
- Added enlarged selected-lead ECG trace contributor markers synchronized to regional activation times.
- Added a Mesh contributors layer control and documented the overlay in `docs/ECG_LEADS.md` and `docs/ANATOMICAL_MESH_MODEL.md`.

Verification:

- `npm test`
- `npm run typecheck`
- `npm run build`
- Browser smoke for selected-lead contributor overlays at `http://127.0.0.1:5187/`
