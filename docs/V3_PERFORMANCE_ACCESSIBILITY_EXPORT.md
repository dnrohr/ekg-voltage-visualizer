# V3 Performance, Accessibility, And Export

## Render Performance

- The V3 scene reports a render-budget profile in the validation panel: mesh segments, vertices, faces, and current contour count.
- Study snapshots include the same render profile so a saved learning state records its visual complexity.
- The WebGL renderer caps device pixel ratio at 2 to avoid runaway canvas cost on high-density displays.
- Dynamic 3D objects are still disposed before each synchronized redraw; shader materials keep the wavefront path on the GPU with a standard-material fallback.

## Accessibility And Keyboard Operation

- Global keyboard shortcuts cover the main V3 workflow:
  - Space: play/pause.
  - ArrowLeft / ArrowRight: step time by 1 ms.
  - L: cycle selected lead.
  - S: cycle scenario.
  - C: cycle comparison scenario.
  - R / Shift+R: cycle selected surface region.
  - M: cycle learner mode and layer preset.
  - G / Shift+G: cycle guided lesson.
  - V: cycle 3D camera preset.
  - A: cycle anatomy mode.
  - F: cycle surface map mode.
  - I: cycle isochrone scope.
  - 1-9: toggle the first nine layer controls.
- V3 camera, anatomy, surface-map, and isochrone controls expose `aria-pressed` state and shortcut metadata.
- Native buttons, selects, range inputs, and checkboxes remain tab-focusable; layer checkboxes remain keyboard-toggleable with Space.

## Reduced Motion And High Contrast

- Reduced motion stops autoplay through the existing playback loop guard and suppresses app-shell CSS motion.
- In reduced-motion V3 scene state, wavefront and recovery bands are widened slightly to make static inspection easier.
- High contrast is threaded into V3 shader and fallback material paths for selected mesh regions, wavefront emphasis, and lead projection colors.
- High-contrast CSS now reaches the 3D toolbar, legend, caption, and canvas frame.

## Export

- 3D screenshot export saves the current canvas with scenario, selected lead, camera preset, and anatomy mode in the filename.
- Study snapshot JSON now includes:
  - scenario and comparison scenario
  - cardiac time, lead, selected region, learner mode, and layers
  - V3 camera, anatomy, surface-map, and isochrone state
  - high-contrast and reduced-motion state
  - render-budget profile
  - phase, voltage, mechanical phase, and lesson context

## Remaining Limits

The screenshot export captures the current 3D canvas only. The JSON study snapshot is the reproducible artifact for the full V3 learning state, including non-canvas panels and accessibility settings.
