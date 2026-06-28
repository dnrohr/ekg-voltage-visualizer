# V2 Release Audit

This audit checks the V2 implementation against `V2_VISION.md`, `ROADMAP_V2.md`, and `TASK_V2_00.md` through `TASK_V2_12.md`.

## Minimum Useful App Evidence

| Requirement | Evidence |
|---|---|
| 3D heart surface with region labels and per-region activation timing | `packages/cardio-engine/src/surface.ts`, `SimulationState.surfaceRegions`, selectable region panel in `apps/web/src/main.tsx`, 3D surface markers in `packages/cardio-render-3d/src/TorsoScene3D.tsx` |
| Moving ventricular depolarization wavefront | Surface state evaluation in `evaluateHeartSurface`, 3D wavefront mode in `TorsoScene3D`, synchronized by `evaluateScenario` time |
| Isochrone/contour lines and activation-time bands | `generateIsochroneMap`, `SimulationState.isochroneMaps`, 3D contour rings and scope controls |
| Transmembrane/electrical-state map distinct from activation time | `HeartSurfaceRegionState.state`, electrical-state surface mode, docs in `docs/ACTIVATION_MODEL.md` |
| Prominent net electrical vector arrow | `state.netVector` in `packages/cardio-engine/src/simulation.ts`, 3D vector layer in `TorsoScene3D` |
| Twelve synchronized ECG traces with moving cursor | `EcgLeadGrid`, `generateLeadTrace`, shared `clock.normalizedTime` cursor |
| Lead selection with positive-axis/probe visualization and projection markers | `explainLeadProbe`, `SelectedLeadTrace`, 3D lead projection layer |
| Playback down to at least 20x slower plus millisecond stepping | `playbackSpeeds` includes `0.05`, `millisecondStepMs`, `frameStepMs`, transport controls in `apps/web/src/main.tsx` |
| Mechanical contraction delayed after depolarization | `evaluateMechanicalState`, `regionMechanics`, tests for delayed local contraction and QRS-onset volume preservation |
| Teaching mode explaining selected lead polarity | Lead probe panel, alignment classification, region contribution summary, guided lessons |

## V2 Task Completion Evidence

All task files `TASK_V2_00.md` through `TASK_V2_11.md` are marked `Done` in `TASKS_V2.md`. `TASK_V2_12.md` records this final audit and handoff.

## Validation Evidence

- Engine tests cover clock behavior, lead definitions, normal polarity anchors, surface timing, isochrone maps, lead probe polarity, region inspection, mechanical delay, abnormal scenarios, and scenario schemas.
- Browser smoke covers lead probe, region selection, layer controls, mechanical no-flow/chamber volume, guided lessons, abnormal scenario switching, desktop/mobile responsive layout, keyboard shortcuts, high contrast, reduced motion, export controls, and PWA metadata.
- Documentation covers assumptions and limits in `docs/SAFETY_AND_SCOPE.md`, `docs/ACTIVATION_MODEL.md`, `docs/ECG_LEADS.md`, `docs/MECHANICAL_MODEL.md`, `docs/VALIDATION.md`, `docs/V2_LAYER_CONTROLS.md`, `docs/V2_GUIDED_LESSONS.md`, and `docs/V2_POLISH_ACCESSIBILITY_EXPORT.md`.

## Known Limits

- The heart is an authored educational surface model, not a patient-specific anatomical mesh.
- ECG generation uses approximate regional dipoles and lead/electrode definitions, not a validated torso-conduction solver.
- 3D isochrone contours are coarse region rings rather than true interpolated mesh isolines.
- Export supports 3D PNG screenshots and JSON study snapshots; short animation capture is deferred.
- Abnormal scenarios are synthetic teaching cases and must not be treated as diagnostic templates.

## Final Verification Commands

```bash
npm test
npm run typecheck
npm run build
```

Final browser verification was performed at desktop and mobile viewport sizes against the local Vite app.
