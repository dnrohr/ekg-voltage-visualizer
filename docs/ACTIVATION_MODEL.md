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

## Coarse Anatomical Model

The current model uses authored anatomical nodes rather than a real electrophysiology solver. Each node has:

- a region and role, such as `pacemaker`, `atria`, `av-delay`, `his-purkinje`, `septum`, `ventricle`, or `base`
- a normalized 3D position for the teaching schematic and electrode approximation
- an activation time
- a repolarization time
- a mass weight
- a source vector family used for the educational voltage calculation

At a given cycle time, each node is evaluated as one of:

- `resting`
- `depolarizing`
- `active`
- `repolarizing`
- `recovered`

Depolarizing nodes create depolarization source activity. Repolarizing ventricular nodes create repolarization source activity. The ECG signal is still synthetic, but it now comes from tissue state rather than a standalone waveform label.

## Normal Activation Sequence

The normal sinus rhythm scenario uses this authored path:

| Node | Activation | Repolarization | Teaching role |
|---|---:|---:|---|
| SA node | 80 ms | 210 ms | starts atrial activation |
| Right atrium | 96 ms | 235 ms | early atrial spread |
| Left atrium | 126 ms | 260 ms | later atrial spread |
| AV node | 185 ms | 300 ms | AV delay during PR segment |
| His bundle | 288 ms | 360 ms | rapid conduction before QRS |
| Septum | 306 ms | 590 ms | early left-to-right septal depolarization |
| Apical ventricles | 322 ms | 540 ms | Purkinje-like apical activation |
| Right ventricle | 336 ms | 560 ms | free-wall spread |
| Left ventricle | 348 ms | 610 ms | larger ventricular mass |
| Basal ventricles | 366 ms | 645 ms | terminal base activation |

Edges in the scenario describe the conceptual route: SA node to atria, atria to AV node, AV nodal delay to His bundle, septum, apex, free walls, and basal ventricles.

## Repolarization Assumptions

Repolarization is authored independently from depolarization. It is not implemented as the depolarization sequence simply running backward.

The teaching T wave comes from ventricular nodes entering `repolarizing` state at different times. Apical and right-ventricular regions recover earlier than left-ventricular and basal regions, while the repolarization vector is authored to preserve the expected normal teaching polarity in Lead II and lateral precordial leads.

This is a conceptual action-potential-duration model:

- regional recovery times are scenario parameters
- mass weighting makes the left ventricle contribute more than smaller regions
- recovery source polarity is tuned for ECG intuition, not derived from ion-channel kinetics

## Source Approximation

The voltage model still uses the educational source/electrode approximation from `docs/CONCEPTUAL_MODEL.md` and `docs/ECG_LEADS.md`.

Each active source family contributes an authored vector:

- atrial depolarization for the P wave
- septal depolarization early in QRS
- main ventricular depolarization through the QRS peak
- terminal ventricular depolarization near QRS end
- ventricular repolarization for the T wave

Tissue nodes scale these source families over the cardiac cycle. The resulting regional sources create approximate body-surface electrode potentials, and leads are computed from terminal voltage differences.

## Lead Computation

The 12 displayed leads are generated from explicit electrode potentials in `packages/cardio-engine`.

This MVP preserves the educational polarity expectations from `docs/ECG_LEADS.md`:

- Lead II is strongly positive at the normal QRS peak.
- aVR is negative at the normal QRS peak.
- lateral precordial leads trend positive during QRS.
- the ST segment remains near baseline in the normal teaching model.

This remains an introductory explanation. It teaches why a phase appears positive, negative, or near baseline in a selected lead; it does not predict patient-specific waveforms.

## Known Limitations

- Voltage units are display-scaled synthetic values, not calibrated clinical millivolts.
- Node timings are authored and coarse; there is no cellular propagation solver.
- The conduction graph is explanatory and does not model anisotropic fibers, conduction velocity fields, or ischemic tissue.
- Repolarization times approximate regional action-potential-duration differences but do not model ion channels.
- Torso conduction remains a simple educational potential approximation.
- No diagnostic interpretation should be inferred from generated traces.
