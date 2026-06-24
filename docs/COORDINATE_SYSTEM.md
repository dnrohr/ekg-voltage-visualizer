# Coordinate System

## Purpose

This coordinate convention gives future implementation tasks a shared spatial language for heart position, torso electrodes, lead axes, and source vectors. It is an educational convention, not a patient-specific anatomical coordinate system.

## Axes

Use a right-handed coordinate system:

| Axis | Positive Direction | Plain Meaning |
|---|---|---|
| `x` | Patient left | Right-to-left across the torso |
| `y` | Patient anterior | Back-to-front through the torso |
| `z` | Patient superior | Feet-to-head |

In a frontal view, `x` runs left on the screen toward the patient's left side and `z` runs upward. In a transverse chest view, `x` runs patient left and `y` runs anterior.

## Origin and Units

Use arbitrary normalized units for the early app:

```text
origin = approximate center of the torso at the level of the heart
torso width ~= 2.0 units
heart center ~= (0.0, 0.15, 0.0)
```

Implementation may later map these units to meters or centimeters for reference calculations. Early tasks should preserve relative geometry and sign conventions.

## Heart Orientation

Default simplified heart placement:

```text
heart center = (0.0, 0.15, 0.0)
apex direction = patient left, inferior, and anterior
apex vector ~= (0.55, 0.25, -0.65)
base direction = patient right, superior, and posterior
```

This supports the normal teaching expectation that ventricular depolarization often produces positive deflection in Lead II and negative deflection in aVR.

## Approximate Limb Electrode Positions

The first model may place limb electrodes on a normalized torso rather than distal limbs:

| Electrode | Approximate Position `(x, y, z)` | Meaning |
|---|---:|---|
| RA | `(-0.75, 0.15, 0.75)` | Right upper torso |
| LA | `(0.75, 0.15, 0.75)` | Left upper torso |
| RL | `(-0.55, 0.10, -0.85)` | Right lower torso, ground/reference display only |
| LL | `(0.55, 0.10, -0.85)` | Left lower torso |

RA, LA, and LL define the limb and augmented leads. RL is included for electrode placement completeness but is not used in the 12-lead voltage definitions.

## Approximate Precordial Electrode Positions

Precordial positions are schematic. They should preserve the anterior chest sweep from right sternal to left lateral:

| Electrode | Approximate Position `(x, y, z)` | Teaching Placement |
|---|---:|---|
| V1 | `(-0.22, 1.00, 0.18)` | Right sternal anterior chest |
| V2 | `(0.02, 1.00, 0.18)` | Left sternal anterior chest |
| V3 | `(0.28, 1.00, 0.10)` | Between V2 and V4 |
| V4 | `(0.52, 0.95, 0.00)` | Left anterior chest near apex line |
| V5 | `(0.78, 0.78, 0.00)` | Left anterolateral chest |
| V6 | `(0.95, 0.55, 0.00)` | Left lateral chest |

## Lead Axis Convention

For vector-mode explanations, define a lead axis as pointing from the negative reference toward the positive electrode or positive measurement direction.

Examples:

```text
Lead I axis: RA -> LA
Lead II axis: RA -> LL
Lead III axis: LA -> LL
aVR axis: average(LA, LL) -> RA
aVL axis: average(RA, LL) -> LA
aVF axis: average(RA, LA) -> LL
```

For V1 through V6, the simplified axis points from the Wilson central terminal region toward each chest electrode. Distributed-source explanations should take priority for chest leads when available.

## Known Limitations

- Torso and electrode locations are schematic.
- Limb electrodes are placed on a torso abstraction for visual clarity.
- Conductive tissue boundaries are not modeled.
- Electrode potentials are in normalized model units and are labeled as synthetic teaching values.
- The same coordinate convention should be revisited before any high-fidelity reference mode.
