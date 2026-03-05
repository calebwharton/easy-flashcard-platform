# Task 2: Study Session Card Loop

## Priority

`P0`

## Objective

Build the client-side study flow with loading, reveal, grading,
progression, and completion states.

## Inputs

- `logic.md` interaction sequence
- Due card and grade server actions

## Implementation Steps

1. Load due/new cards on page mount for selected deck.
2. Render front side first and gate grade controls behind flip.
3. On grade, call persistence action and advance index.
4. Reset flip state when moving to next card.
5. Render completion card when all cards in current batch are reviewed.
6. Keep progress indicator synchronized with current index.

## Acceptance Criteria

- Reveal-then-grade interaction is enforced.
- No skipped state between grade submission and next card render.
- Session complete view appears only after final card.

## Dependencies

- Sprint 2 Task 3 (card actions)
- Sprint 1 UI components

## Estimate

5–7 hours
