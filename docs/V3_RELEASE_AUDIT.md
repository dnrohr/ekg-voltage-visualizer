# V3 Release Audit

## Release State

V3 is complete as an educational anatomical-heart and wavefront upgrade. It is ready for handoff as a teaching simulator, not as a clinical or diagnostic product.

## Evidence Table

| Roadmap requirement | Evidence | Status |
|---|---|---|
| Heart mesh data contract that can support imported anatomy later | `packages/cardio-engine/src/types.ts`, `packages/cardio-engine/src/anatomicalMesh.ts`, `docs/ANATOMICAL_MESH_MODEL.md` | Done |
| Per-vertex activation/recovery fields from scenario clock | `buildHeartMeshField`, `evaluateScenario`, engine tests for deterministic timing and `phi` values | Done |
| Level-set representation of current wavefront | `phiActivationMs`, `phiRepolarizationMs`, V3 shader attributes, `docs/ANATOMICAL_MESH_MODEL.md` | Done |
| External heart surface mode with landmarks and region highlighting | `packages/cardio-render-3d/src/TorsoScene3D.tsx`, V3 external mesh path, selected-region picking | Done |
| Chamber/cutaway anatomy mode | External/Cutaway/Chambers controls, chamber-volume cues, septum landmark, cutaway plane, `docs/ANATOMICAL_MESH_MODEL.md` | Done |
| Shader-driven wavefront, isochrone bands, and electrical-state map | Shader material path, fallback material path, mesh contour loops, current level-set highlights | Done |
| Lead contribution overlays that illuminate selected-lead regions | `classifyRegionLeadContribution`, mesh contributor halos, enlarged-trace contribution markers, `docs/ECG_LEADS.md` | Done |
| Scenario comparison workflow | Normal-vs-selected comparison panel, synchronized active-region cards, selected-lead delta, `docs/VALIDATION.md` | Done |
| Guided lessons using V3 visuals | Seven V3 lessons for QRS propagation, lead axes, bundle delays, ectopic focus, repolarization, and comparison workflow, `docs/V3_GUIDED_LESSONS.md` | Done |
| Performance, accessibility, and export pass | Render-budget profile, keyboard shortcuts, high-contrast/reduced-motion scene paths, screenshot and JSON snapshot export, `docs/V3_PERFORMANCE_ACCESSIBILITY_EXPORT.md` | Done |
| Educational and non-diagnostic safety boundary | User-facing scenario disclaimers, comparison safety note, `docs/SAFETY_AND_SCOPE.md`, validation notes | Done |

## Task Completion

All V3 tasks are marked `Done` in `TASKS_V3.md` after this audit:

- V3-00 through V3-12: complete.
- No V3 task is deferred.

## Final Verification

Required release checks:

- `npm test`
- `npm run typecheck`
- `npm run build`
- Browser smoke at `http://127.0.0.1:5187/`

Browser smoke covers:

- 3D canvas loads without runtime errors.
- V3 render-budget profile appears.
- Scenario, comparison, lead, region, learner mode, camera, anatomy, surface-map, isochrone, and layer keyboard paths respond.
- High-contrast and reduced-motion state reach the app shell and V3 scene.
- Desktop and 390 px mobile viewports have no horizontal overflow.

## Known Limitations

- The V3 heart is still procedural and authored from the V2 surface model. The asset pipeline is ready for real anatomical meshes, but no third-party anatomical asset is bundled.
- The model is a deterministic educational forward model, not patient-specific electrophysiology, torso conduction, or clinical ECG interpretation.
- Scenario checks are sanity checks for timing, polarity, and authored behavior; they are not clinical validation metrics.
- Screenshot export captures the current 3D canvas. JSON study snapshots are the reproducible export for full V3 state.
- Short animation export remains deferred.
- The production build reports a Vite chunk-size warning because Three.js ships in the main bundle. This is a performance follow-up, not a release blocker.
- Public release should still get expert educational review from a cardiologist, electrophysiologist, cardiac physiology educator, or biomedical engineer.

## Handoff

Recommended next work after V3:

1. Add licensed anatomical mesh assets through the manifest pipeline.
2. Split the Three.js renderer bundle if load time becomes a product issue.
3. Add optional curated reference ECG examples only after source, license, and attribution review.
4. Consider animation export after the static screenshot and JSON snapshot workflow has been validated by learners.
