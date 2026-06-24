# TASK_10.md - Polish, Accessibility, and Distribution

## Status

Not started

## Goal

Make the app polished, accessible, responsive, and practical for repeated learner use.

## Depends On

- `TASK_01.md`

## Deliverables

- Responsive layout for desktop and mobile-sized screens.
- Keyboard controls for playback, scrubbing, and lead selection.
- Accessible color palettes for activation, repolarization, ECG traces, and flow states.
- Reduced-motion mode.
- High-contrast ECG grid mode.
- Saved view presets.
- Exportable screenshots or animations.
- PWA install support.
- Performance pass for rendering and timeline updates.

## Suggested Files

- `apps/web/`
- `packages/cardio-render-2d/`
- `packages/cardio-render-3d/` if 3D exists
- `packages/cardio-content/`
- `docs/VALIDATION.md`
- `TASKS.md`
- `TASK_10.md`

## Implementation Notes

- The learner should always be oriented: cycle phase, active tissue, selected lead, measured relationship, and reason for polarity should remain discoverable.
- Do not overwhelm the screen with every layer at once.
- Progressive disclosure should remain central.
- Verify text fit and layout at mobile and desktop sizes.

## Exit Criteria

- The app is usable without guidance on common viewport sizes.
- Keyboard and reduced-motion experiences work.
- Visual contrast and color choices are checked.
- Export/PWA features work if implemented.
- Relevant documentation is updated for controls, accessibility, distribution, and remaining support notes.
- The finished task changes are committed, pushed, merged to `main`, and the task branch is retained.
- `TASKS.md` and this task file are updated with progress and verification notes.

## Required Closeout

- Run the relevant automated tests, type checks, lint checks, accessibility checks, and app build if available.
- Manually verify desktop and mobile-sized layouts, keyboard controls, reduced motion, and contrast-sensitive views.
- Update docs for controls, accessibility notes, distribution/PWA behavior, and limitations.
- Commit the completed task with a focused commit message.
- Push the branch after the commit succeeds.
- Merge the finished task branch into `main` and push `main`.
- Do not delete the task branch after merging.

## Verification Notes

Record accessibility checks, viewport checks, performance observations, and remaining polish gaps.
