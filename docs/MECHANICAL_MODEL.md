# Mechanical Model

The mechanical layer is an authored teaching model tied to the same scenario clock as the ECG simulation. It is deterministic from `CardiacScenario` timing plus cycle time; it is not a pressure solver, finite-element model, or patient-specific hemodynamic simulation.

## Phase Timing

For the normal 800 ms teaching beat:

- Atrial systole begins near the P-wave peak and continues until S1.
- S1 is placed 42 ms after QRS onset, marking mitral and tricuspid closure.
- Isovolumetric contraction runs from S1 until semilunar opening, 24 ms after QRS end.
- Ventricular ejection runs until S2.
- S2 is placed 22 ms before T-wave onset, marking aortic and pulmonary closure.
- Isovolumetric relaxation runs until AV reopening, 18 ms after T-wave end.
- Rapid filling follows AV reopening, then diastasis fills the remaining cycle.

These offsets compress or expand with each scenario's authored electrical timing.

## Valves And Pressures

The model exposes four valve states:

- Mitral: left atrium to left ventricle, open when left atrial pressure is represented as greater than left ventricular pressure.
- Tricuspid: right atrium to right ventricle, open when right atrial pressure is represented as greater than right ventricular pressure.
- Aortic: left ventricle to aorta, open during ventricular ejection.
- Pulmonary: right ventricle to pulmonary artery, open during ventricular ejection.

Each valve has an `openFraction` from 0 to 1 and a pressure relationship label. The labels are qualitative and intended to orient learners, not to report numeric pressures.

## Contraction Curves

Contraction is represented by smooth authored curves:

- Atrial contraction follows atrial depolarization and peaks before S1.
- Ventricular contraction follows QRS with a 42 ms electromechanical delay.
- Ventricular volume falls during ejection and recovers during rapid filling.
- Wall thickening is a visual cue proportional to ventricular contraction.
- V2 local region contraction follows each surface region's activation time plus electromechanical delay.

The visual goal is timing clarity: electrical activation visibly precedes mechanical contraction.

## Region-Aware Contraction

Each evaluated surface region now has a mechanical companion state:

```text
contraction_onset_ms = region_activation_ms + electromechanical_delay_ms
local_contraction = pulse(time - contraction_onset_ms)
wall_deformation = local_contraction * chamber_scale
```

Atrial regions use a 55 ms teaching delay. Ventricular regions use the existing 42 ms delay. The 3D renderer uses local wall deformation to make mechanical regions subtly thicken after electrical activation. This is a synchronized teaching cue on the educational surface model, not a finite-element mesh simulation.

## Chamber Volume Cues

The mechanical state exposes RA, LA, RV, and LV volume fractions. The 3D renderer can show them as optional translucent chamber volumes. Ventricular volume remains high at QRS onset and falls during modeled ejection, avoiding the misleading impression that electrical depolarization instantly empties the ventricles.

## Flow Encoding

Flow is stylized:

- Venous return appears during diastasis.
- AV inflow appears during rapid filling.
- Atrial kick appears during atrial systole.
- Aortic and pulmonary ejection appear during ventricular ejection.
- Isovolumetric contraction and relaxation are explicit no-flow phases.

The flow arrows and SVG streams show direction and timing only. They do not model turbulence, pressure gradients, or volume conservation.

## Limitations

This layer is suitable for explaining phase relationships among P wave, QRS, T wave, valves, S1/S2, contraction, volume, and flow. It should not be used to infer murmurs, stenosis/regurgitation severity, ejection fraction, cardiac output, or clinical valve disease.
