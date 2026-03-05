# Task 3: Deck/Card Server Actions

## Priority

`P0`

## Objective

Implement secure, type-safe mutations and queries for deck and card workflows.

## Inputs

- `architecture.md` API surface
- Auth utilities from Task 2

## Implementation Steps

1. Add deck actions: create, delete, list user decks.
2. Add card actions: add card, grade card, fetch due/new cards.
3. Enforce ownership checks before all deck/card mutations.
4. Enforce ownership checks before deck/card reads that can expose user data.
5. Integrate cache revalidation for affected dashboard/deck pages.
6. Validate due-card query for `new OR due` records with batch size cap.

## Acceptance Criteria

- Unauthorized requests are rejected.
- Users can only mutate/read their own decks and cards.
- Due-card retrieval returns expected set and batch size cap.
- Grade action updates progress using authenticated user context.
- Ownership checks occur before destructive actions (delete/update).

## Dependencies

- Task 1 (schema)
- Task 2 (session + auth)

## Estimate

6–8 hours

## Validation Checklist

- Cross-user deck/card IDs are rejected for all actions
- `getDueCards(deckId)` returns new cards and cards where `dueDate <= now`
- Default due-card batch cap remains fixed (for example, `50`)

## Bot B Execution Status (2026-03-06)

- Status: `Partially Complete (contract stabilized, persistence wiring blocked)`
- Contract freeze file: `src/app/actions/card.ts`

### Stabilized Contracts

- `gradeCard(cardId: string, grade: Grade): Promise<CardProgressRecord>`
- `getDueCards(deckId: string): Promise<DueCard[]>`

### Remaining Blocker

- Full ownership checks and persistence wiring are blocked by missing
  project scaffold in this workspace (`prisma/*`, auth utilities, and
  App Router runtime files are not present yet).
