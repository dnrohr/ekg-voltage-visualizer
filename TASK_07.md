# TASK_07.md - Stylized Blood Flow

## Status

Done

## Goal

Add stylized blood movement through chambers and valves to show timing relationships among electrical activation, contraction, valve state, and flow.

## Depends On

- `TASK_06.md`

## Deliverables

- Flow phase state machine.
- Particle, streamline, arrow, or volume-based flow visualization.
- Venous return into atria.
- AV valve inflow into ventricles.
- Atrial kick visualization.
- Ejection through aortic and pulmonary valves.
- No-flow visualization during isovolumetric contraction and relaxation.
- Optional oxygenated/deoxygenated color distinction.

## Suggested Files

- `packages/cardio-engine/`
- `packages/cardio-render-2d/`
- `packages/cardio-render-3d/` if 3D exists
- `packages/cardio-content/`
- `docs/MECHANICAL_MODEL.md`
- `TASKS.md`
- `TASK_07.md`

## Implementation Notes

- Use stylized flow, not computational fluid dynamics.
- Prioritize timing clarity over realistic turbulence or pressure fields.
- Flow state should be derived from the same deterministic timeline and phase model.

## Exit Criteria

- The learner can see when and where blood moves during the cycle.
- Flow stops during isovolumetric phases.
- Flow direction matches valve state and cardiac phase.
- Visual checks confirm flow does not obscure the core ECG explanation.
- Relevant documentation is updated for flow phases, visual style, performance, and limitations.
- The finished task changes are committed, pushed, merged to `main`, and the task branch is retained.
- `TASKS.md` and this task file are updated with progress and verification notes.

## Required Closeout

- Run the relevant automated tests, type checks, lint checks, and app build if available.
- Manually verify flow timing, direction, and no-flow phases if UI exists.
- Update docs for flow phases, visual encoding, performance assumptions, and limitations.
- Commit the completed task with a focused commit message.
- Push the branch after the commit succeeds.
- Merge the finished task branch into `main` and push `main`.
- Do not delete the task branch after merging.

## Verification Notes

Implemented stylized SVG and 3D flow cues for venous return, AV inflow, atrial kick, and ventricular ejection. Isovolumetric contraction and relaxation explicitly return `no-flow` with zero intensity.

Verified no-flow phases with `npm test`; browser smoke checks confirmed the flow cues and controls do not create horizontal overflow at desktop or mobile viewport sizes.
