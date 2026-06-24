# TASK_00.md - Concept, Safety, and Scientific Framing

## Status

Not started

## Goal

Define what the app teaches, what it does not teach, and the core scientific framing that keeps the product from implying diagnostic or clinical decision-support use.

## Context

The app teaches how myocardial depolarization and repolarization create body-surface potential differences that become 12-lead ECG traces. It must avoid the misconception that voltage waves travel along ECG leads.

## Deliverables

- Product statement for the app.
- Educational scope statement.
- Non-diagnostic disclaimer language.
- Glossary of core terms.
- Explanation hierarchy: vector model, distributed dipole model, reference/high-fidelity mode.
- Initial normal sinus rhythm timing model.
- Coordinate convention for heart, torso, electrodes, and lead axes.
- Initial documentation structure under `docs/`.

## Suggested Files

- `docs/CONCEPTUAL_MODEL.md`
- `docs/ECG_LEADS.md`
- `docs/GLOSSARY.md`
- `docs/SAFETY_AND_SCOPE.md`
- `docs/COORDINATE_SYSTEM.md`
- `TASKS.md`
- `TASK_00.md`

## Implementation Notes

- Use plain educational language.
- State clearly that this is not medical advice, not diagnostic software, and not patient-specific modeling.
- Keep the causal chain central:

```text
myocardial activation state
-> electrical source distribution
-> body-surface electrode potentials
-> lead definitions
-> 12 ECG waveforms
```

- Define the three explanation levels so later tasks can reference them consistently.
- Choose a simple coordinate convention early, even if it is revised later.

## Exit Criteria

- A future agent can understand the product's scientific stance without rereading the full roadmap.
- The project has stable language for what it teaches and what it excludes.
- Lead definitions and coordinate assumptions are documented.
- Relevant tests/checks have been run, or the reason they are not applicable is recorded.
- Documentation changed by this task is complete enough for the next agent.
- The finished task changes are committed and pushed.
- `TASKS.md` and this task file are updated with progress and verification notes.

## Required Closeout

- Test/check the changed docs for broken links, formatting issues, and internal consistency.
- Document any decisions, assumptions, and unresolved questions in the relevant docs and verification notes.
- Commit the completed task with a focused commit message.
- Push the branch after the commit succeeds.

## Verification Notes

Record what was created or changed, and list any unresolved conceptual questions.
