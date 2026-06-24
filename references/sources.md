# Source Notes

## Current 3D Sources

Task 04 uses the project's own coordinate and lead model documentation as the source for procedural 3D placement:

- `docs/COORDINATE_SYSTEM.md`
- `docs/ECG_LEADS.md`
- `docs/ACTIVATION_MODEL.md`

No external 3D anatomy sources are currently included.

## Current Reference Signal Sources

Task 09 uses project-authored synthetic reference envelopes generated from the same teaching scenario model:

- `packages/cardio-engine/src/validation.ts`
- `docs/VALIDATION.md`

No patient ECG datasets, public waveform corpora, or third-party reference signals are bundled.

## Future Candidate Sources

Potential future anatomy sources should be evaluated for license compatibility, mesh quality, anatomical region separation, and web performance before inclusion.
