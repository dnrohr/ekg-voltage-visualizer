# V2 Cardiac Clock

V2 uses continuous cardiac-cycle time in milliseconds as the primary playback value. Normalized cycle time is derived from milliseconds only when existing simulation APIs need a `0..1` value.

## Engine Helpers

`packages/cardio-engine/src/clock.ts` provides:

- `normalizeCycleMs(timeMs, cycleMs)` for deterministic wrapping.
- `cycleMsToNormalized(timeMs, cycleMs)` and `normalizedToCycleMs(normalized, cycleMs)`.
- `createClockState(scenario, timeMs)` for `{ timeMs, normalizedTime, cycleMs }`.
- `advanceClock(scenario, currentTimeMs, elapsedRealMs, speed)` for playback.
- `stepClock(scenario, currentTimeMs, stepMs)` for exact stepping.

The playback speed list includes `0.05x`, which makes a 1-second cardiac cycle take 20 seconds of real time.

## UI Behavior

The app stores `timeMs` in React state. Scrubbing uses a millisecond range from `0` to the current scenario cycle length. Playback advances by real elapsed frame time multiplied by the selected speed, then wraps within the cycle.

Controls include:

- Play/pause.
- Reset to `0 ms`.
- Frame-sized step backward/forward using `16 ms`.
- Millisecond step backward/forward using `1 ms`.
- Speed buttons from `0.05x` through `2x`.

The readout displays current cycle time and total cycle duration, such as `340 / 800 ms`.

## Assumptions

Frame stepping uses `16 ms` as a teaching-friendly approximation of one 60 fps frame. Millisecond stepping is exact at the model level. Visual interpolation remains deterministic because simulation state is recomputed from the current cardiac time rather than advanced by stored animation frames.
