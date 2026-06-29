# Safety and Scope

## Non-Diagnostic Disclaimer

EKG Voltage Visualizer is an educational tool for learning cardiac electrical signal formation. It is not medical advice, not diagnostic software, and not clinical decision support.

The app does not analyze patient ECGs, estimate patient-specific risk, recommend treatment, or replace review by a qualified clinician.

## Required User-Facing Language

Use this language, or a close variant, anywhere the app could be mistaken for a clinical tool:

```text
This visualization is for education only. It uses simplified and synthetic models to explain how cardiac electrical activity can produce 12-lead ECG voltages. It is not medical advice, not diagnostic software, and not patient-specific modeling.
```

For generated traces:

```text
Synthetic teaching signal. Timing, polarity, and morphology are simplified for explanation and are not intended for diagnosis.
```

For reference traces, if added later:

```text
Reference ECG example. Labels and signals are provided for educational comparison only and are not clinical guidance.
```

## In Scope

- Normal sinus rhythm education.
- Simplified myocardial depolarization and repolarization timing.
- ECG lead formation from body-surface electrode potentials.
- Synthetic 12-lead teaching signals.
- Lead polarity and amplitude intuition.
- Progressive explanations from vector model to distributed source model.
- Later comparison with clearly labeled reference examples.

## Out of Scope

- Diagnostic interpretation.
- Patient-specific ECG upload or analysis.
- Treatment or triage recommendations.
- Clinical thresholds as product claims.
- Real-time bidomain, monodomain, finite-element torso conduction, cardiac mechanics, or blood-flow simulation.
- Claims of clinical validation.

## Scientific Framing Rules

- Say "lead voltage" or "lead measurement", not "voltage traveling down the lead".
- Say "body-surface potential difference", not "wire signal moving through the body".
- Identify synthetic, approximate, and reference-derived data clearly.
- Explain polarity through source distribution and lead definition.
- Prefer a simpler accurate explanation over a more realistic-looking misleading one.
- In selected-region inspection panels, frame "best-seen", "opposite", and "indirect" as educational lead relationships, not anatomical localization or diagnostic evidence.
- When describing tissue state, distinguish depolarizing wavefront, active/refractory tissue, repolarizing tissue, and recovered tissue without implying patient-specific electrophysiology.
- Label the 2D heart drawing as an orientation sketch, not a literal anatomical slice.
- Describe NIH heart anatomy as a visual reference. Do not imply chamber segmentation, patient-specific geometry, or timing solved on that mesh.
- Describe anatomical markers and hybrid overlays as approximate educational mapping from the authored model.

## Risk Notes

The largest product risk is teaching a vivid but false mental model. The most important mitigation is to keep the causal chain visible:

```text
myocardial activation state
-> electrical source distribution
-> body-surface electrode potentials
-> lead definitions
-> 12 ECG waveforms
```

Before public release, the app's terminology and educational claims should be reviewed by a cardiologist, electrophysiologist, cardiac physiology educator, or biomedical engineer familiar with ECG forward modeling.
