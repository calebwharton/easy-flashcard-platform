# Task 1: Prisma Schema + Migrations

## Priority

`P0`

## Objective

Implement relational models for users, decks, cards, progress, and sessions with efficient query indexes.

## Inputs

- `architecture.md` database model definitions
- Existing `prisma/schema.prisma`

## Implementation Steps

1. Add/validate auth models (`User`, `Account`, `Session`, `VerificationToken`).
2. Add app models (`Deck`, `Card`, `CardProgress`, `StudySession`).
3. Apply unique constraints and indexes (`cardId_userId`, `userId_dueDate`, `deck.userId`).
4. Ensure `CardProgress` stores `interval`, `easeFactor`, `repetitions`, `dueDate`, `lapses`, `lastReview`.
5. Run Prisma generate + migration workflow (`prisma generate`, `prisma migrate dev`).
6. Validate local DB push and query shape for due-card retrieval (`new OR due`).

## Acceptance Criteria

- Schema compiles and Prisma client generates successfully.
- Required constraints/indexes exist and support key queries.
- Development migration is reproducible from clean database.
- `CardProgress` unique key on `(cardId, userId)` prevents duplicate progress rows.
- Due lookup index on `(userId, dueDate)` is present for review scheduling queries.

## Dependencies

- None

## Estimate

4–6 hours

## Validation Commands

- `npx prisma validate`
- `npx prisma generate`
- `npx prisma migrate dev --name init_auth_data`
