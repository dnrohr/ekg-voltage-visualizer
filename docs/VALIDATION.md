# Scenario And Validation Notes

The app includes a curated scenario library in `packages/cardio-engine/src/scenarios.ts` and a compact manifest in `scenarios/scenario-library.json`.

## Scenario Schema

Each scenario contains:

- `id`, `name`, `description`, and `disclaimer`.
- `timing` for P wave, QRS, T wave, BPM, and cycle length.
- `waveVectors` for atrial, septal, main ventricular, terminal ventricular, and repolarization sources.
- `activationModel` nodes and edges for regional activation/recovery timing.
- Optional `category`, `whatChanged`, and `reference` notes for comparison and provenance.

`validateScenarioSchema` checks ordered P-QRS-T timing, positive BPM/cycle values, T-wave end within the cycle, and a minimum activation-node structure.

## Included Scenarios

- Normal sinus rhythm: baseline 75 bpm teaching beat.
- Sinus bradycardia: slower cycle with preserved vector direction.
- Sinus tachycardia: faster cycle with compressed intervals.
- Left axis deviation: leftward-superior ventricular vector.
- Right axis deviation: rightward-inferior ventricular vector.
- Right bundle branch block: delayed rightward terminal activation and widened QRS.
- Left bundle branch block: delayed leftward terminal activation and widened QRS.

The altered scenarios are intentionally selected for visual clarity. They are simplified vector/timing examples, not clinical diagnostic criteria.

## V2 Heart-First Scenario Checks

V2 abnormal teaching scenarios must alter heart, source, timing, or electrode inputs before the ECG is derived.

- Bundle branch block scenarios widen QRS timing by delaying authored ventricular activation nodes and terminal vectors.
- Axis deviation scenarios alter ventricular source vectors before limb-lead voltages are computed.
- Adjustable conduction delay moves AV-to-His timing later before ventricular activation begins.
- Ventricular ectopic focus starts early ventricular activation from the right ventricular free wall and broadens the generated QRS.
- Reversed arm leads swaps RA and LA electrode positions before electrode potentials and lead voltages are computed.

Validation tests cover ordered schemas, delayed conduction timing, ectopic surface activation order, reversed Lead I polarity, normal QRS polarity anchors, and baseline plausibility. These checks are educational sanity checks, not diagnostic performance metrics.

## V3 Scenario Comparison Viewer

V3-09 anchors the comparison workflow to the normal sinus rhythm scenario and compares it with the selected teaching scenario at the same normalized cardiac-cycle position. The viewer presents heart-state changes before ECG differences:

- normal and selected scenarios are shown in side-by-side cards
- active, depolarizing, and repolarizing region chips summarize what the heart model is doing now
- selected-lead voltage, polarity, delta, and QRS-end shift remain synchronized to the same cardiac-cycle position
- comparison copy explicitly labels the view as synthetic and educational, not diagnostic

This workflow is intended to help learners ask "what changed in the heart model before the lead changed?" It is not a clinical normal/abnormal classifier.

## V2 Polish Smoke Coverage

V2-11 verification includes desktop and mobile browser smoke checks for:

- Layer and lesson controls remaining keyboard-focusable native controls.
- Global keyboard shortcuts for playback, stepping, lead cycling, region cycling, and lesson cycling.
- High-contrast mode applying to major panels and selected controls.
- Reduced-motion mode stopping autoplay and suppressing CSS motion.
- 3D canvas PNG export and JSON study snapshot export controls.
- PWA metadata presence.

## Reference Overlay

Task 09 adds an authored synthetic reference envelope through `generateSyntheticReferenceTrace`. The overlay is labeled as `synthetic-reference` and is derived from the same teaching scenario with slight amplitude scaling.

No public patient ECG dataset is bundled. This avoids hidden licensing obligations and keeps the first validation layer small enough to audit. Future work may add curated PTB-XL, LUDB, or other examples only after license and attribution notes are recorded in `references/`.

## Validation Levels

`validateScenario` reports checks in four levels:

- Conceptual: event order and model consistency.
- Polarity/timing: expected lead polarity and key event timing.
- Morphology plausibility: broad checks such as QRS being larger than P wave.
- Reference agreement: sanity comparison against the authored reference envelope.

Checks return `pass` or `caution`. A caution means the scenario needs review, not that the app has produced a clinical abnormality.

## Accessibility And Distribution Checks

Task 10 added:

- Responsive desktop/mobile layouts.
- Keyboard playback controls: Space toggles playback, ArrowLeft/ArrowRight scrub, and `L` advances selected lead.
- Reduced-motion playback pause mode.
- High-contrast ECG grid mode.
- Saved view presets in local storage.
- 3D screenshot export.
- PWA manifest and icon.

The production build currently includes Three.js in the main bundle, so Vite reports a chunk-size warning. That is a performance note rather than a functional failure.

## V3 Release Verification

V3 release verification is summarized in `docs/V3_RELEASE_AUDIT.md`.

The final V3 browser smoke covers:

- V3 canvas load with no new browser runtime errors.
- Render-budget profile visibility.
- Keyboard paths for scenario, comparison scenario, selected lead, selected region, learner mode, V3 camera, anatomy mode, surface map, isochrone scope, and first nine layer controls.
- High-contrast and reduced-motion state reaching both the app shell and 3D scene.
- Desktop and 390 px mobile layouts without horizontal overflow.

The V3 release remains educational only. The validation evidence proves deterministic teaching behavior, synchronized UI state, accessibility/export coverage, and absence of obvious runtime/layout failures in smoke checks. It does not prove clinical diagnostic accuracy.
