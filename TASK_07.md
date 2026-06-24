# TASK_07.md - Stylized Blood Flow

## Status

Not started

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
- The finished task changes are committed and pushed.
- `TASKS.md` and this task file are updated with progress and verification notes.

## Required Closeout

- Run the relevant automated tests, type checks, lint checks, and app build if available.
- Manually verify flow timing, direction, and no-flow phases if UI exists.
- Update docs for flow phases, visual encoding, performance assumptions, and limitations.
- Commit the completed task with a focused commit message.
- Push the branch after the commit succeeds.

## Verification Notes

Record chosen flow style, checks, and performance notes.
