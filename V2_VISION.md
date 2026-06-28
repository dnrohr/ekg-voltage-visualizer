# ECG Heart Visualizer App Description

## Core Concept

This app is an interactive cardiac-cycle visualizer designed to help a learner connect the **12-lead ECG** to the actual physical and electrical events occurring in the heart.

The central idea is:

> **ECG output → electrical vector/projection → depolarization/repolarization wavefront → mechanical contraction → chamber/valve behavior**

Rather than teaching the ECG as a set of isolated squiggles, the app shows how each lead’s waveform arises from changing electrical activity across the atria and ventricles. The user should be able to look at a trace in lead II, V1, V5, aVF, etc., and understand what part of the heart that trace is “seeing,” why the deflection goes up or down, and how that corresponds to depolarization traveling through cardiac muscle.

The app is not intended to be a full clinical electrophysiology simulator. Its purpose is educational: to make ECG interpretation physically grounded, spatial, and intuitive.

---

## Primary Learning Goal

The user should develop the ability to reason in both directions:

1. **From heart to ECG**

   * “The ventricular depolarization wave is traveling leftward and downward, so lead II sees a strong positive deflection.”
   * “The septum activates left-to-right, so V1 sees a small initial positive component while lateral leads may see a small negative component.”

2. **From ECG to heart**

   * “This negative deflection means the dominant electrical vector is moving away from this lead.”
   * “This broad QRS means ventricular activation is delayed or taking an abnormal route.”
   * “This ST/T-wave change corresponds to a different phase of recovery, not the initial depolarization wave.”

The app should repeatedly reinforce:

> **Each ECG lead is a directional measurement of the heart’s changing electrical field.**

---

## Main Visualization

The main screen centers on a 3D heart model with a synchronized ECG panel.

The heart view shows:

* The depolarization wave traveling across cardiac muscle.
* A contour/isochrone map of activation time.
* Current transmembrane activity or activation state.
* A voltage-gradient/vector arrow showing the dominant electrical direction at the current time.
* Mostly accurate contraction timing, with atrial and ventricular motion delayed appropriately after depolarization.
* Optional translucent chambers showing filling, squeezing, and relaxation.
* Optional valve-state overlays.

The ECG panel shows:

* All 12 leads.
* A moving time cursor synchronized with the heart animation.
* Highlighted leads corresponding to selected viewing directions.
* Optional overlays showing which part of the heart is contributing most strongly at the current moment.

The app should feel like the ECG traces are not separate charts, but **instrument readouts attached to the moving heart.**

---

## Simulation Clock and Time Control

Everything in the app is driven by a single cardiac-cycle time variable, measured in milliseconds.

The user can:

* Play the cardiac cycle in real time.
* Slow the animation down to at least **20× slower than real time**.
* Scrub manually through the cycle.
* Step frame-by-frame or millisecond-by-millisecond.
* Pause at any point and inspect the heart, vector, contours, and ECG traces.

At 20× slowdown, a 1-second cardiac cycle becomes roughly 20 seconds long. The animation must therefore remain visually meaningful when slowed down. It cannot rely on brief flashes or coarse animation steps. The depolarization wave, contour lines, vector arrow, chamber motion, and ECG cursor should all interpolate smoothly.

A good design principle:

> **The animation should be generated from continuous cardiac time, not from pre-rendered frames.**

That way, every visual state can be recomputed accurately for any time `t`.

---

## Depolarization Propagation

The heart surface should show depolarization spreading across the myocardium as a visible wavefront.

Each point or vertex on the heart mesh has an associated activation time:

```text
activation_time_ms(vertex)
```

At any current time `t`, the app can classify each region as:

* Not yet activated.
* Currently depolarizing.
* Depolarized.
* Recovering/repolarizing.
* Returned toward resting state.

The depolarization wave should be shown with a moving color boundary across the heart surface. The user should be able to watch activation begin in the conduction system, spread through the septum, move through the ventricular walls, and complete at the later-activated regions.

The visualization should support multiple display modes:

### 1. Live Activation Wave

Shows the current advancing wavefront.

This is best for understanding the temporal sequence:

* Septal activation.
* Early ventricular activation.
* Bulk left/right ventricular activation.
* Late basal or posterolateral activation.

### 2. Isochrone / Contour Map

Shows contour lines of equal activation time.

This is similar to the ECGSIM-style view: a map of when each region depolarizes. Closely spaced contours indicate faster apparent spatial change; widely spaced contours indicate slower progression.

This should be tightly connected to the live wave. The user should understand that the live depolarization wave is essentially moving across the activation-time contour map.

### 3. Voltage / Transmembrane Potential Map

Shows the current electrical state of the tissue, not merely the time at which it activates.

This helps distinguish:

* Activation time.
* Current depolarized state.
* Repolarization.
* Recovery.

This is important because the ECG is not only a map of “where activation has arrived.” It is the result of changing electrical gradients over time.

---

## Contour Map Behavior

The contour map should be one of the app’s primary teaching tools.

It should support:

* Colored activation-time bands.
* Thin contour/isoline curves at fixed millisecond intervals.
* A moving highlight at the current time.
* Optional labels, such as `20 ms`, `40 ms`, `60 ms`.
* Toggle between atrial, ventricular, or whole-heart activation maps.
* A “show only current wavefront” mode for simplicity.

When the user pauses the animation, they should be able to hover over or tap a region and see:

```text
Region: LV lateral wall
Activation time: 58 ms after QRS onset
Current state: depolarized
Contributes strongly to: V5, V6, lead I
```

This would directly support the goal of relating physical cardiac regions to lead outputs.

---

## ECG Leads and “Probe” Outputs

The app should carefully distinguish between **electrodes** and **leads** while still using an intuitive probe metaphor.

Physical ECG electrodes are placed on the body. The 12 leads are directional voltage measurements derived from those electrodes. Some are direct bipolar leads, some are augmented limb leads, and the precordial leads are chest leads referenced against a calculated central terminal.

For teaching, the app can represent each lead as a **virtual viewing probe** or **measurement axis** around the heart.

Each lead should have:

* A spatial direction.
* A waveform trace.
* A projected component of the heart’s electrical vector.
* A visual relationship to the heart model.

The user should be able to select a lead and see:

* Where the corresponding electrode/viewpoint is located.
* The lead’s positive direction.
* Whether the current cardiac vector points toward or away from it.
* Which regions of the heart are most visible from that lead.
* Why the current ECG trace is positive, negative, biphasic, or flat.

The core teaching rule:

> **A lead goes positive when the dominant depolarization vector points toward its positive pole, and negative when it points away.**

That rule should be animated, not merely stated.

---

## 12-Lead ECG Panel

The ECG panel should show the standard leads:

* I
* II
* III
* aVR
* aVL
* aVF
* V1
* V2
* V3
* V4
* V5
* V6

Each trace should be synchronized with the same time cursor.

When the time cursor moves through the QRS complex, the user should see:

* The depolarization wave moving through the ventricles.
* The main vector arrow changing direction and magnitude.
* Each lead’s trace rising or falling according to its projection of that vector.
* The contour map highlighting the currently active tissue.

When a lead is selected, its trace should be enlarged and linked visually to the heart view. For example:

* Selecting lead II shows an inferior-leftward viewing direction.
* Selecting V1 shows a right anterior/septal viewpoint.
* Selecting V5/V6 shows lateral left-ventricular viewpoints.
* Selecting aVR shows why many normal deflections are negative in that lead.

The ECG traces should not just appear as finished graphs. They should be drawn over time, with the moving cursor revealing what the lead is measuring at each instant.

---

## Voltage Vector Arrow

The app should show a prominent vector arrow representing the heart’s dominant instantaneous electrical vector.

This arrow should update continuously during the cycle.

It should communicate:

* Direction: where the net electrical activity is pointing.
* Magnitude: how strong the net electrical signal is.
* Projection: how strongly each lead sees that vector.
* Polarity: whether each lead sees the vector as positive or negative.

The vector does not need to imply that electricity is physically traveling as a single arrow. It should be presented as a simplified net vector: a summary of the distributed electrical gradient across the heart.

Helpful visual behavior:

* Leads whose positive axis aligns with the vector glow or are emphasized.
* Leads opposite the vector show negative deflection.
* Leads perpendicular to the vector show small or biphasic deflection.
* The ECG trace at the current time can display a small marker showing the vector projection value.

This would make the user internalize the ECG as a set of directional projections.

---

## Mechanical Contraction

The app should include a mostly accurate contraction animation tied to electrical activation.

The contraction should not occur simultaneously with depolarization. It should follow after a short electromechanical delay.

A simplified model:

```text
local_contraction(vertex, t)
  = contraction_curve(t - activation_time(vertex) - electromechanical_delay)
```

The depolarization wave travels first. Then the myocardium contracts shortly afterward.

The animation should show:

* Atrial contraction after atrial depolarization.
* Ventricular contraction after ventricular depolarization.
* Ventricular squeezing during systole.
* Relaxation after repolarization.
* Chamber filling during diastole.

The ventricle should not visibly shrink immediately at the first instant of QRS. Early systole includes a phase where pressure rises before major ejection. For educational correctness, the app should separate:

1. Electrical activation.
2. Mechanical tension development.
3. Chamber volume reduction.
4. Relaxation and filling.

This distinction is important because the ECG is electrical, while visible squeezing is mechanical.

---

## Chamber Animation

The app should show simplified chamber behavior:

* Right atrium
* Left atrium
* Right ventricle
* Left ventricle

The chambers can be translucent internal volumes or cutaway shapes inside the heart.

Atria:

* Fill during ventricular systole.
* Contract before ventricular systole.
* Empty into the ventricles during late diastole.

Ventricles:

* Fill during diastole.
* Begin tension after QRS.
* Maintain approximate volume during isovolumic contraction.
* Shrink during ejection.
* Relax after repolarization.
* Fill again after AV valves open.

The goal is not to compute real pressure-volume loops, but to avoid visually misleading timing.

Recommended visual design:

* Show outer myocardium deformation subtly.
* Show chamber volume changes more clearly with translucent internal surfaces.
* Add optional labels for “atrial systole,” “isovolumic contraction,” “ejection,” “isovolumic relaxation,” and “filling.”
* Let users hide chamber motion if they want to focus only on electrical activity.

---

## Valve Timing Overlay

A useful optional layer would show valve states:

* Tricuspid valve
* Mitral valve
* Pulmonary valve
* Aortic valve

Valve states should be synchronized to the cardiac phase:

* AV valves open during ventricular filling.
* AV valves close at the start of ventricular systole.
* Semilunar valves open during ejection.
* Semilunar valves close at the end of ejection.
* All valves briefly closed during isovolumic contraction and relaxation.

This would help users understand that depolarization, contraction, pressure, flow, and ECG traces are related but not identical.

---

## Probe-to-Heart Teaching Mode

A major app mode should be explicitly designed around the question:

> “What is this lead seeing right now?”

In this mode, the user selects a lead, and the app shows:

* The lead’s waveform enlarged.
* The lead’s positive direction in 3D.
* The current voltage vector projected onto that direction.
* Heart regions currently contributing to that deflection.
* Whether the lead is seeing depolarization moving toward it, away from it, or sideways.
* A short explanation tied to the current time.

Example at early QRS:

```text
Lead V1 is seeing early septal activation moving partly toward the right anterior chest.
This produces a small positive deflection.
```

Example during main QRS:

```text
The dominant ventricular activation vector is moving leftward and posteriorly, away from V1.
Lead V1 therefore moves negative.
```

Example for lateral leads:

```text
The main ventricular vector is moving toward the left lateral chest.
V5 and V6 show a strong positive R wave.
```

This should be the central experience of the app.

---

## Heart-to-Probe Teaching Mode

The inverse mode should start from the heart.

The user can click or hover over a region of the myocardium and see:

* When it activates.
* When it contracts.
* Which leads are most sensitive to it.
* Which leads see it as positive or negative.
* How its activation contributes to the overall waveform.

For example:

```text
Selected region: left ventricular lateral wall
Activation: late QRS
Best seen by: I, aVL, V5, V6
Opposite leads: aVR, V1
Mechanical contraction: begins shortly after activation
```

This mode supports the reverse mapping:

> **Physical heart region → expected ECG signature**

---

## Synchronized Explanatory Layers

The app should allow layers to be toggled independently:

### Electrical Layers

* Depolarization wavefront
* Repolarization wavefront
* Activation-time contour map
* Transmembrane potential map
* Net electrical vector
* Lead projection vectors

### Mechanical Layers

* Muscle contraction
* Chamber volume
* Valve state
* Blood-flow arrows
* Cardiac-cycle phase labels

### ECG Layers

* 12-lead traces
* Selected lead enlargement
* Time cursor
* P/QRS/T labels
* Lead polarity
* Vector projection markers
* Region contribution highlights

This layered design lets the app work for both beginners and advanced users.

---

## User Interaction

The user should be able to:

* Rotate, pan, and zoom the heart.
* Select any ECG lead.
* Select any heart region.
* Scrub the cardiac cycle.
* Slow playback down to 20×.
* Toggle depolarization, contour, contraction, vector, and valve layers.
* Compare two leads side-by-side.
* Freeze the animation at any point.
* Ask “why is this lead going up/down here?”
* Switch between normal rhythm and simplified abnormal cases.

The app should encourage exploration rather than passive watching.

---

## Default Learning Sequence

The app could guide the user through a structured sequence:

### Lesson 1: A Lead Is a Directional View

Show a simple vector and one lead. Rotate the vector and show the trace rise/fall.

### Lesson 2: Limb Leads

Show leads I, II, III, aVR, aVL, and aVF around the heart. Demonstrate how the same vector projects differently into each lead.

### Lesson 3: Precordial Leads

Show V1–V6 as anterior chest viewpoints. Demonstrate R-wave progression across the chest leads.

### Lesson 4: Normal Ventricular Depolarization

Animate the QRS complex with activation contours, vector motion, and lead traces.

### Lesson 5: Mechanical Delay

Show that depolarization precedes contraction. The ECG is electrical; the visible squeeze comes afterward.

### Lesson 6: Reconstructing the Heart from Leads

Pause at moments in the ECG and ask the user to infer where the electrical vector is pointing and which region is active.

---

## Abnormal Rhythm / Pathology Extensions

Once the normal model works, the app could add controlled variations:

* Bundle branch block
* Ventricular ectopic beat
* Axis deviation
* Delayed regional activation
* Myocardial infarction patterns
* Poor R-wave progression
* Ventricular hypertrophy
* Reversed limb leads
* Paced rhythm

Each abnormal case should alter the physical model first, then show the resulting ECG changes.

For example:

* In left bundle branch block, ventricular activation should spread abnormally, causing a widened QRS and altered lateral lead morphology.
* In a ventricular ectopic beat, activation should begin from an abnormal focus and propagate cell-to-cell rather than through the normal conduction system.
* In axis deviation, the dominant QRS vector should visibly rotate, changing the relative amplitudes of limb leads.

The educational rule remains:

> Change the heart first; let the ECG follow.

---

## Visual Style

The app should be clear, slow, and inspectable.

Recommended visual style:

* Dark or neutral background.
* High-contrast heart activation colors.
* Thin contour lines over the myocardium.
* Soft translucent chambers.
* Clean ECG traces with minimal clutter.
* Smooth vector animation.
* Optional labels that appear only when needed.
* No excessive realism that obscures the teaching goal.

The user should never feel that they are watching a decorative animation. They should feel that they are inspecting a physical system with instruments attached.

---

## Technical Model

A practical implementation could use a simplified surface-based model.

Core data structures:

```text
HeartMesh
  vertices
  triangles
  region labels
  chamber labels
  fiber/orientation hints, optional

ElectricalState
  activation_time_ms per vertex
  repolarization_time_ms per vertex
  transmembrane_potential(vertex, t)
  local_gradient(vertex, t)

MechanicalState
  contraction_delay_ms
  contraction_curve(vertex, t)
  chamber_volume_curve(chamber, t)
  valve_state(valve, t)

LeadModel
  electrode positions
  lead axes
  transfer/projection weights
  lead_voltage(lead, t)

Timeline
  current_time_ms
  playback_speed
  selected_lead
  selected_region
  visible_layers
```

For an initial educational version, the ECG does not need to be generated by a full electrophysiological torso model. It can use an approximate lead-projection model:

```text
lead_voltage(t) ≈ dot(net_electrical_vector(t), lead_axis)
```

A later version could use a more sophisticated transfer matrix from heart-surface electrical activity to body-surface electrodes.

---

## Minimum Viable Version

The minimum useful app should include:

1. A 3D heart surface.
2. A ventricular depolarization activation map.
3. A moving depolarization wavefront.
4. Isochrone/contour lines.
5. A net electrical vector arrow.
6. 12 synchronized ECG traces.
7. Lead selection and lead-axis visualization.
8. Slow playback down to 20×.
9. Basic contraction after depolarization.
10. A teaching mode explaining why a selected lead is positive or negative.

This would already achieve the central goal: connecting ECG outputs to physical heart activity.

---

## Ideal Version

The ideal version would add:

* Segmented atria and ventricles.
* Chamber volume animation.
* Valve timing.
* Repolarization and T-wave explanation.
* User-controlled ectopic foci.
* Adjustable conduction delays.
* Abnormal ECG cases.
* Region-to-lead contribution overlays.
* Guided lessons.
* Quizzes where the user reconstructs heart activity from ECG traces.
* Exportable animations for teaching.

---

## Design Principle

The app should always preserve one conceptual direction:

> **The ECG is not the primary object. The heart is the primary object. The ECG is what the probes measure from it.**

Every feature should reinforce that relationship.

When the user sees a waveform rise or fall, they should be able to look immediately at the heart and understand why. When they see a wave of depolarization cross the myocardium, they should be able to predict which leads will go positive or negative.

The app succeeds if the user begins to think:

> “This lead is not just a squiggle. It is a directional measurement of an electrical event moving through real heart tissue.”
