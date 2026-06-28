# ECG Leads

## Key Principle

An ECG lead is a defined voltage measurement. It is not the same thing as an electrode, and it is not a path that a voltage wave travels along.

The app should compute or explain leads in two stages:

```text
cardiac source distribution -> electrode potentials -> lead voltages
```

## Physical Electrodes

The initial 12-lead model uses these physical electrodes:

```text
RA, LA, RL, LL, V1, V2, V3, V4, V5, V6
```

RA, LA, and LL are used for limb leads, augmented limb leads, and the Wilson central terminal. RL is shown as part of electrode placement but is not used to compute the displayed 12 leads.

## Lead Voltage Definitions

Let each electrode name represent its body-surface potential at a given time.

```text
Lead I   = LA - RA
Lead II  = LL - RA
Lead III = LL - LA

aVR = RA - average(LA, LL)
aVL = LA - average(RA, LL)
aVF = LL - average(RA, LA)

Wilson central terminal = average(RA, LA, LL)

V1 = V1 electrode - Wilson central terminal
V2 = V2 electrode - Wilson central terminal
V3 = V3 electrode - Wilson central terminal
V4 = V4 electrode - Wilson central terminal
V5 = V5 electrode - Wilson central terminal
V6 = V6 electrode - Wilson central terminal
```

These definitions are implemented as pure deterministic functions in the engine. The current app keeps source modeling and lead construction separate: regional cardiac sources first create electrode potentials, then each displayed lead is derived from those potentials with the formulas above.

## Electrode Potential Approximation

For the first distributed-source model, a dipole-inspired approximation is enough:

```text
potential(electrode) ~= sum(
  source_strength
  * dot(source_moment, electrode_position - source_position)
  / distance^3
)
```

This is a teaching approximation. It does not model realistic torso conduction, tissue conductivity, body shape, or patient-specific anatomy.

The Task 02 implementation uses five regional sources for the normal teaching beat:

| Source | Region | Source Type |
|---|---|---|
| Atrial depolarization | Right-to-left atria | Depolarization |
| Septal depolarization | Interventricular septum | Depolarization |
| Main ventricular depolarization | Left ventricular free wall | Depolarization |
| Terminal ventricular depolarization | Basal ventricles | Depolarization |
| Ventricular repolarization | Recovering ventricular muscle | Repolarization |

Each source has a schematic position, a moment vector, and a time-varying strength. The app can show a selected lead's current contribution breakdown by these source regions. These values are calibrated for explanatory polarity and timing, not for clinical millivolt accuracy.

## Lead Probe Teaching Mode

V2 adds a selected-lead probe that answers "what is this lead seeing right now?" for the current millisecond of the teaching beat. The engine projects the current net vector onto the selected lead's positive axis and pairs that projection with the lead voltage that was computed from electrode potentials. The enlarged trace shows the same time cursor as the 12-lead grid, plus a projection marker whose sign and magnitude match the selected lead's current displayed voltage.

The probe classifies the current view as:

| Alignment | Meaning |
|---|---|
| toward | The dominant vector points toward the lead's positive side and the lead reads positive. |
| away | The dominant vector points away from the lead's positive side and the lead reads negative. |
| sideways | The dominant vector is close to perpendicular or the voltage is near baseline. |
| mixed | Active regions pull in competing directions and partly cancel. |

The region contribution list is a simplified surface-region summary. It uses each active region's current tissue state plus its lead metadata (`bestSeenLeads`, `oppositeLeads`, or indirect) to explain why that lead is rising, falling, or staying small. It is a teaching aid tied to the surface model, not an inverse solution from a real ECG.

## Lead Families

### Limb Leads

Lead I, Lead II, and Lead III compare pairs of limb electrode potentials. They are useful for the first vector explanation because their axes are easy to draw in the frontal plane.

### Augmented Limb Leads

aVR, aVL, and aVF compare one limb electrode to the average of the other two. They should be shown as derived measurements, not as separate physical electrode pairs.

### Precordial Leads

V1 through V6 compare each chest electrode to the Wilson central terminal. They are strongly affected by chest electrode position and local source geometry, so distributed-source explanations should eventually be preferred over a single frontal vector explanation.

## Initial Normal Polarity Expectations

The first normal sinus rhythm scenario should roughly preserve these teaching expectations:

| Feature | Expected Simplified Pattern |
|---|---|
| P wave | Usually positive in I, II, aVF; negative in aVR |
| QRS | Usually positive in I, II, aVF, V4-V6; negative or small in aVR; variable progression V1-V3 |
| ST segment | Near baseline in the normal teaching model |
| T wave | Often positive in leads with positive QRS, especially I, II, and V4-V6 |

These are educational sanity checks, not diagnostic criteria.

## Display and Labeling Rules

- Label generated waveforms as synthetic teaching signals.
- Prefer "positive electrode", "negative reference", and "computed voltage" over vague phrases.
- When selecting a lead, show both its formula and the current explanation.
- In lead probe mode, keep the enlarged trace, 3D probe arrow, projection marker, and text explanation synchronized to the same selected lead and timestamp.
- Keep Wilson central terminal visible in explanations of V1 through V6.
- Make it clear that lead axes are explanatory aids, while electrode potentials are the modeled measurements.
- When a lead is selected, highlight its positive electrode or terminal and its negative/reference terminal. For precordial leads, show RA, LA, and LL as the Wilson central terminal contributors rather than implying a hidden physical electrode.
