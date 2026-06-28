# TASK_V2_01.md - Continuous Cardiac Clock and Precision Playback

## Status

Not started

## Goal

Introduce a V2 cardiac clock model that supports continuous millisecond time, real-time playback, 20x slowdown, scrubbing, and precise stepping without relying on pre-rendered frames.

## Depends On

- `TASK_V2_00.md`

## Deliverables

- Engine time helpers for normalized time and absolute milliseconds.
- Playback speed model including at least `0.05x` for 20x slowdown.
- Millisecond and frame-step controls.
- UI labels that expose current absolute time and cycle duration.
- Tests covering time wrapping, speed conversion, and step behavior.

## Suggested Files

- `packages/cardio-engine/src/`
- `apps/web/src/main.tsx`
- `apps/web/src/styles.css`
- `docs/`
- `TASKS_V2.md`
- `TASK_V2_01.md`

## Exit Criteria

- The app can play, pause, scrub, step, and run at 20x slower than real time.
- State is recomputed from continuous cardiac time for arbitrary `t`.
- Existing V1 timeline behavior remains intact.
- Tests/typecheck/build pass.
- Browser smoke verifies playback controls.

## Verification Notes

Record tests, browser checks, and any timing assumptions.
