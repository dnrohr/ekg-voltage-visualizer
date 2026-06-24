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
