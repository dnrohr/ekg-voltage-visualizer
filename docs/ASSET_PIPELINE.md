# Asset Pipeline

## Current 3D Asset Strategy

The Task 04 3D view uses procedural geometry generated at runtime with Three.js:

- transparent torso shell from an ellipsoid primitive
- simplified heart chambers from scaled ellipsoid primitives
- electrode markers from the engine's `electrodeDefinitions`
- tissue activation markers from the current `SimulationState`
- selected-lead overlays from the existing lead terminal definitions

No third-party anatomy meshes, textures, HDRIs, or reference images are bundled in the current app.

## Why Procedural First

Procedural geometry keeps the educational model inspectable and avoids early license or cleanup work. The first 3D goal is spatial intuition: heart position, electrode placement, selected lead relationship, and tissue state. It is not anatomical realism.

The renderer is deterministic from the same inputs as the 2D view:

```text
scenario definition + normalized cardiac-cycle time
```

The 3D package should not introduce independent physiology state.

## Coordinate Mapping

The engine coordinate convention remains the source of truth:

- `x`: patient left
- `y`: patient anterior
- `z`: patient superior

The Three.js scene maps this to:

```text
scene.x = model.x
scene.y = model.z
scene.z = model.y
```

This preserves superior/inferior as vertical in the rendered scene while keeping anterior/posterior as depth.

## Camera Presets

Task 04 ships four camera presets:

- frontal: torso and limb/chest electrode overview
- transverse: superior view for anterior chest electrode placement
- left lateral: side view for chest depth and lateral leads
- heart close-up: tissue-state and net-vector inspection

Camera controls are preset-based rather than free orbit controls so learners land in predictable views.

## Cutaway Mode

Cutaway mode hides the transparent torso shell while retaining electrodes, heart geometry, tissue nodes, lead overlays, and the net vector. This is intended for quick anatomy inspection, not as a surgical or anatomical slice.

## Future Asset Intake Requirements

Before adding third-party assets, record:

- source URL
- author or institution
- license name and version
- attribution requirements
- whether commercial use is allowed
- modifications made
- original file format and optimized output format

Any imported model should be simplified for web use and separated into meaningful educational regions where possible.

## Known Limitations

- The heart is a chamber schematic, not a realistic mesh.
- The torso is an ellipsoid shell and does not model tissue conductivity.
- Electrode locations are normalized teaching positions.
- Color maps are node markers, not volumetric myocardial activation.
- The selected lead overlay connects electrode/reference centers geometrically; it does not imply current travels along that line.
