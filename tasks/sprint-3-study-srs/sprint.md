# Sprint 3: Study Runtime + SRS

## Priority

`P0` (MVP-critical)

## Objective

Deliver the end-to-end study loop: due-card fetch, card reveal/grade flow,
and reliable SRS progress scheduling.

## In Scope

- SRS calculation engine and preview formatting
- Study page card-loop interaction model
- Session stats and supporting hooks/state boundaries

## Out of Scope

- Bulk import UX
- Production deployment hardening

## Dependencies

- Sprint 2 actions and auth must be available
- Sprint 1 study UI primitives should be in place

## Exit Criteria

- SRS updates are persisted after each grade
- Card flip gating and reveal-grade loop works without state regressions
- End-of-session stats are accurate and displayed

## Task Breakdown

1. [Task 1 — SRS Engine Calculation](task-1-srs-engine-calculation.md)
2. [Task 2 — Study Session Card Loop](task-2-study-session-card-loop.md)
3. [Task 3 — Session State Hooks](task-3-session-state-hooks.md)

## Estimated Effort

~1.5 to 2 days (single engineer)

## Bot C Execution Update (2026-03-06)

- Status: `In Progress (partially blocked)`
- Source-of-truth followed: `styles.md`, `architecture.md`, `logic.md`

### Completed (non-blocked)

- Implemented SRS engine module at `src/lib/srs.ts`:
  - `calculateNextReview(progress, grade, now?)`
  - `getNextIntervalPreview(progress, grade, now?)`
  - Grade behavior aligned to `logic.md` (Again reset, early learning
    steps, mature multipliers, ease floor `1.3`).
- Implemented session stats hook at `src/hooks/useSessionStats.ts`:
  - Grade-based counters (`reviewed`, `again`, `hard`, `good`, `easy`)
  - Deterministic `reset()` behavior.

### Remaining (blocked)

- Final study-loop wiring in `src/app/(main)/study/[deckId]/page.tsx` and
  `src/components/study/*` is blocked until Bot B confirms stable contracts
  for:
  - `gradeCard(cardId, grade)`
  - `getDueCards(deckId)`

### Next Bot C Action Once Unblocked

1. Wire study page load/flip/grade/completion states to stabilized actions.
2. Add progress indicator synchronization and completion rendering.
3. Validate interaction path against `logic.md` reveal-then-grade sequence.
