# Sprint 2: Data + Auth Backbone

## Priority

`P0` (MVP-critical)

## Objective

Establish secure multi-user data ownership with Prisma schema and
Auth.js integration, then expose deck/card action boundaries.

## In Scope

- Prisma schema and migrations
- Auth.js + Prisma adapter setup
- Secure server actions for decks/cards

## Out of Scope

- Full study interaction loop UI
- Import workflow UX
- Deployment hardening

## Dependencies

- Sprint 1 shell/components should exist for integration testing

## Exit Criteria

- Users can authenticate through OAuth and obtain valid sessions
- Deck and card actions enforce ownership checks
- Database includes complete user/deck/card/progress/session model
  with indexes
- Due-card lookup supports `new OR due` behavior for the authenticated
  user and deck

## Task Breakdown

1. [Task 1 — Prisma Schema + Migrations](task-1-prisma-schema-migrations.md)
2. [Task 2 — NextAuth + Prisma Integration](task-2-nextauth-prisma-integration.md)
3. [Task 3 — Deck/Card Server Actions](task-3-deck-card-server-actions.md)

## Estimated Effort

~2 to 2.5 days (single engineer)

## Validation Checklist

- Prisma schema validates and client generates
- Auth route handler responds through `/api/auth/[...nextauth]`
- Middleware protects dashboard/deck/study route groups
- Deck/card server actions reject cross-user access

## Bot B Execution Update (2026-03-06)

- Stabilized action signatures for downstream consumers in
  `src/app/actions/card.ts`.
- Contract signatures now fixed for dependency unblocking:
  - `gradeCard(cardId: string, grade: Grade)`
  - `getDueCards(deckId: string)`
- Remaining backend completion is blocked by missing scaffold files
  required for auth/database wiring in this workspace.
