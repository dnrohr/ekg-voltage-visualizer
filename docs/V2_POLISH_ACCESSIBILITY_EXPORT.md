# V2 Polish, Accessibility, And Export

## Performance

- The 3D renderer disposes dynamic geometries and materials before rebuilding each synchronized frame layer.
- Layer props are memoized so unchanged layer state does not force extra 3D updates.
- Global keyboard handling uses refs for live scenario and region state instead of re-registering during continuous playback.

## Keyboard And Motion

- Time: Space toggles playback; arrow keys step time.
- Lead: `L` cycles selected lead.
- Region: `R` / `Shift+R` cycles selected surface region.
- Lesson: `G` / `Shift+G` cycles guided lessons and applies their live context.
- Layer controls are native checkboxes, so keyboard users can tab to them and toggle with Space.
- Reduced motion stops autoplay and suppresses CSS transitions/animations in the app shell.

## High Contrast

High contrast now applies beyond the ECG grid to major panels, selected controls, lesson state, region selection, and active layer/mode buttons.

## Export And Distribution

- The existing camera export saves the current 3D canvas as a PNG.
- The study snapshot export saves a JSON file with scenario, comparison, time, selected lead, selected region, learner mode, layers, phase, voltage, and lesson context.
- PWA basics are present: manifest, icon, theme color, standalone display, and responsive viewport metadata.

## Remaining Limits

Short animation capture is not implemented in V2-11. The app exports still images and reproducible study snapshots; animation capture can be revisited after V2 validation and performance audit.
