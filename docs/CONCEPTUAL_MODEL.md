# Conceptual Model

## Product Statement

EKG Voltage Visualizer is an educational physiology and signal-formation simulator. It helps learners connect myocardial depolarization and repolarization to the body-surface potential differences that become the 12-lead ECG.

The app should make one idea clear: ECG leads do not show electrical waves traveling along wires. Leads are defined voltage measurements between electrodes or references. Those voltages change because cardiac tissue changes electrical state over time.

## Teaching Chain

All explanations should preserve this causal chain:

```text
myocardial activation state
-> electrical source distribution
-> body-surface electrode potentials
-> lead definitions
-> 12 ECG waveforms
```

If a visual layer cannot be explained through this chain, it should be treated as decorative or deferred.

## Educational Scope

The app teaches:

- How normal myocardial activation and recovery produce changing electrical sources.
- How simplified cardiac vectors and regional dipoles relate to ECG polarity.
- How electrodes sample body-surface potentials.
- How limb, augmented limb, and precordial leads are mathematically derived.
- Why P wave, QRS complex, ST segment, and T wave timing correspond to cardiac electrical state.
- Why lead polarity depends on the relationship between source direction, electrode geometry, and lead definition.

The app does not teach:

- Patient diagnosis.
- Treatment decisions.
- Personalized anatomy or pathology modeling.
- Full cardiac electrophysiology, torso conduction, mechanics, or fluid simulation.
- Clinical-grade ECG interpretation.

## Explanation Hierarchy

### Level 1: Vector Model

The app may show a single net cardiac electrical vector and project it onto each lead axis. This is the simplest mental model and should be used first when explaining polarity.

Use this level to answer:

- Is the main source direction generally toward or away from the lead's positive side?
- Why does this lead deflect upward, downward, or nearly flat?
- Why do different limb leads see different polarities from the same event?

Limitations:

- It compresses many tissue regions into one arrow.
- It can make chest leads seem simpler than they are.
- It does not explain local electrode proximity well.

### Level 2: Distributed Dipole Model

The app may model multiple active cardiac regions as approximate electrical sources. Each source contributes to potentials at physical electrodes. The 12 leads are then computed from electrode potentials.

Use this level to answer:

- Which heart regions contribute most to a lead at this time?
- Why can precordial leads differ strongly from limb leads?
- How does changing activation timing affect several leads at once?

Limitations:

- It is still a simplified educational approximation.
- It does not solve torso conduction with patient-specific anatomy.
- It should not imply clinical accuracy.

### Level 3: Reference / High-Fidelity Mode

The app may synchronize generated visuals with reference ECG traces, annotated datasets, or precomputed high-fidelity examples. This level is for comparison and realism, not for claiming the interactive model is a diagnostic simulator.

Use this level to answer:

- How does the teaching signal compare with a real or reference ECG?
- Which waveform details are idealized?
- Which features are synthetic, reference-derived, or precomputed?

Limitations:

- Reference data may include clinical labels that are outside the app's core purpose.
- Precomputed examples must be clearly labeled.
- Dataset use requires licensing and attribution review.

## Initial Normal Sinus Rhythm Timing Model

The first normal beat should use a single deterministic cycle. Timing values are educational defaults, not clinical thresholds.

| Event | Approximate Time in 800 ms Cycle | Teaching Meaning |
|---|---:|---|
| Cycle start | 0 ms | Resting baseline before atrial activation |
| P wave start | 80 ms | Atrial depolarization begins |
| P wave peak | 130 ms | Atrial activation source is strongest |
| P wave end | 180 ms | Atrial depolarization completes |
| PR segment | 180-300 ms | AV nodal delay and conduction system transit |
| QRS start | 300 ms | Ventricular depolarization begins |
| QRS peak | 340 ms | Ventricular activation source is strongest |
| QRS end | 390 ms | Ventricles are broadly depolarized |
| ST segment | 390-520 ms | Ventricles remain depolarized with little net change |
| T wave start | 520 ms | Ventricular repolarization begins |
| T wave peak | 610 ms | Repolarization source is strongest |
| T wave end | 720 ms | Ventricular recovery completes |
| Baseline | 720-800 ms | Resting interval before next beat |

Default heart rate:

```text
bpm = 75
cycleMs = 800
```

The normalized app clock should map `0.0` to cycle start and `1.0` to the end of the same beat.

## Design Assumptions

- The MVP should target conceptual validity and polarity/timing validity before waveform morphology.
- Generated ECGs should be labeled as synthetic teaching signals.
- High-fidelity tools and datasets may guide validation, but they should not be required for the first interactive engine.
- Later 3D, valve, contraction, and blood-flow layers must remain synchronized to the same cardiac-cycle timebase.

## Open Questions

- Exact waveform calibration should be deferred until the 2D electrical MVP exists.
- Expert review is needed before public educational release.
- Reference dataset selection and licensing should be handled in a later validation task.
