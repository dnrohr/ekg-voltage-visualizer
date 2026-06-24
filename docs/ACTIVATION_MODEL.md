# Activation Model

## Purpose

The 2D MVP uses a deterministic, synthetic electrical model for teaching timing and polarity. It is not a clinical ECG generator and does not solve cardiac electrophysiology or torso conduction.

The model is evaluated from:

```text
normal sinus rhythm scenario + normalized cardiac-cycle time
```

The same `0.0` to `1.0` cycle position drives the heart schematic, the ECG cursor, the generated lead voltages, and the selected-lead explanation.

## Timing

The initial scenario uses the Task 00 normal rhythm defaults:

| Event | Time |
|---|---:|
| Cycle length | 800 ms |
| P wave | 80-180 ms |
| PR segment | 180-300 ms |
| QRS complex | 300-390 ms |
| ST segment | 390-520 ms |
| T wave | 520-720 ms |
| Baseline | 720-800 ms |

## Source Approximation

The MVP uses the Level 1 vector model from `docs/CONCEPTUAL_MODEL.md`.

Each wave contributes an authored vector:

- atrial depolarization for the P wave
- septal depolarization early in QRS
- main ventricular depolarization at the QRS peak
- terminal ventricular depolarization near QRS end
- ventricular repolarization for the T wave

Smooth timing windows and Gaussian peaks scale these vectors over the cardiac cycle. The resulting net vector is projected onto each lead axis to produce a synthetic voltage.

## Lead Computation

The 12 displayed leads are generated from lead-axis projections in `packages/cardio-engine`.

This MVP preserves the educational polarity expectations from `docs/ECG_LEADS.md`:

- Lead II is strongly positive at the normal QRS peak.
- aVR is negative at the normal QRS peak.
- lateral precordial leads trend positive during QRS.
- the ST segment remains near baseline in the normal teaching model.

This is an introductory vector explanation. Task 02 is expected to add a more physically grounded electrode-potential model with Wilson central terminal and explicit body-surface potentials.

## Known Limitations

- Voltage units are display-scaled synthetic values, not calibrated clinical millivolts.
- Chest leads are simplified as lead-axis projections rather than computed from electrode potentials.
- The heart schematic shows phase and wavefront intuition, not anatomical propagation detail.
- The T wave is authored to preserve normal teaching polarity, not derived from regional action-potential duration differences.
- No diagnostic interpretation should be inferred from generated traces.
