# TASK_V2_06.md - Region-To-Lead Inspection Mode

## Status

Done

## Goal

Support the inverse learning path from selected heart region to expected ECG signature.

## Depends On

- `TASK_V2_05.md`

## Deliverables

- Region hover/tap/click target model.
- Selected region panel with activation, recovery, and contraction timing.
- Best-seen leads and opposite leads for the region.
- Region contribution indicators on relevant ECG traces.
- Keyboard-accessible region selection fallback.

## Suggested Files

- `packages/cardio-engine/src/`
- `packages/cardio-render-3d/src/`
- `packages/cardio-render-2d/src/`
- `apps/web/src/`
- `docs/ECG_LEADS.md`
- `TASKS_V2.md`
- `TASK_V2_06.md`

## Exit Criteria

- A learner can select a region and see when it activates and which leads most strongly reflect it.
- Region-to-lead metadata is deterministic from scenario data.
- The mode works with mouse and a keyboard-accessible fallback.
- Tests/typecheck/build pass.
- Browser smoke verifies at least one LV, RV, septal, and atrial region.

## Verification Notes

Implemented deterministic region inspection with activation, recovery, contraction cue, current tissue state, best-seen leads, opposite leads, and ECG trace indicators.

Selection checks:

- LV: Left ventricular lateral wall shows I, aVL, V5, and V6 as best-seen leads.
- RV: Right ventricular free wall shows V1/V2/III visibility and opposite I/V6.
- Septal: Right-facing septum shows V1/V2 visibility and opposite V5/V6.
- Atrial: High right atrium shows II/aVF/V1 visibility and opposite aVR.

Accessibility notes:

- 3D surface markers can be selected by pointer.
- The region picker exposes every surface region as a keyboard-focusable button.
- ECG lead cards mark relevant traces and show dashed activation-time indicators for the selected region.

Verification:

- `npm test`
- `npm run typecheck`
- `npm run build`
- Browser smoke: region picker verified LV, RV, septal, and atrial selections; ECG indicators updated; 3D canvas remained visible.
