# TASK_V4_01.md - Anatomical Asset QA and Preview Controls

## Status

Not started

## Goal

Turn the current NIH anatomical preview into an explicit, inspectable, reversible feature with documented provenance and clear learner controls.

## Depends On

- `TASK_V4_00.md`
- Current NIH heart preview asset and manifest from the V3 follow-up work.

## Deliverables

- Anatomical asset QA documentation covering source URL, license, required attribution, file size, mesh/material notes, visual limitations, and usage boundaries.
- UI controls for anatomical preview visibility and opacity, integrated with the existing 3D layer/control style.
- A learner-facing caption or state label that distinguishes anatomical reference mesh from the authored teaching simulation.
- A graceful loader failure state when the GLB cannot be fetched or parsed.
- Snapshot/export state that includes the anatomical preview setting and asset id when applicable.

## Suggested Files

- `references/nih-heart-normal-female/manifest.preview.json`
- `docs/ASSET_PIPELINE.md`
- `docs/ANATOMICAL_MESH_MODEL.md`
- `packages/cardio-render-3d/src/TorsoScene3D.tsx`
- `apps/web/src/main.tsx`
- `apps/web/src/styles.css`

## Exit Criteria

- A learner can turn the anatomical preview on/off and adjust its visibility without losing the procedural teaching model.
- The app makes it clear that the NIH mesh is an anatomical reference, not the source of the electrical simulation.
- Missing or failed asset loading does not break the simulator.
- QA documentation states what is known, unknown, and approximate about the asset.
- Desktop and mobile browser smoke checks cover the new controls and the fallback state if practical.

## Verification Notes

Pending.
