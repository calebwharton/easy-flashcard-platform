# Task 3: Testing + Deployment Readiness

## Priority

`P1`

## Ownership

- Track D (QA/Release)

## Objective

Validate core behavior and ship to production with correct database and OAuth configuration.

## Inputs

- Existing testing checklist and deployment notes
- Completed work from Sprints 1–4
- Source-of-truth constraints from `architecture.md` and `logic.md`

## Implementation Steps

1. Confirm dependency readiness before full QA run:
   - Sprint 2 ownership checks are merged and active for deck/card/import
     actions.
   - Bot B contracts are stable and confirmed for
     `gradeCard(cardId, grade)` and `getDueCards(deckId)`.
   - Sprint 3 grading pipeline is merged so due-date updates are
     verifiable.
2. Execute local end-to-end checklist (happy path + failure path):
   - OAuth login and session persistence.
   - Deck creation under authenticated user.
   - Card add/edit in owned deck.
   - Import flow: valid TSV rows persist, invalid rows report line-level errors.
   - Study flow: reveal → grade (`Again/Hard/Good/Easy`) → persisted
     interval/due-date update.
   - User data isolation: second user cannot read or mutate first user
     deck/card data.
3. Verify production env vars are complete and non-empty:
   - `DATABASE_URL`
   - `NEXTAUTH_URL`
   - `NEXTAUTH_SECRET`
   - OAuth provider client IDs/secrets (Google, GitHub)
4. Provision production Postgres and run Prisma migrations against production connection.
5. Configure OAuth callback URLs for localhost and production host.
6. Perform deployment smoke test on production:
   - Sign in with OAuth.
   - Open dashboard and deck page.
   - Run one import.
   - Complete one graded study card cycle.
7. Record rollback notes:
   - Previous deployment identifier.
   - Revert command/path.
   - Data-impact statement for migration rollback safety.

## QA Checklist (Must Pass)

- Auth
  - Unauthenticated users are redirected from protected routes.
  - Authenticated users retain session across refresh.
- Ownership and Security
  - Cross-user deck/card/import access is rejected.
  - Server actions operate only on `session.user.id`-scoped records.
- Import
  - Mixed valid/invalid TSV imports persist only valid rows.
  - Error payload includes source line numbers and clear messages.
- Study + SRS
  - Grade submission updates `interval`, `repetitions`, `easeFactor`, and `dueDate`.
  - `Again` resets repetition state and increments lapses.
- Regression Guard
  - No P0 flow regression in login, dashboard, deck, import, and study routes.

## Deployment Readiness Artifacts

- Completed QA checklist with timestamp and tester name.
- Production env var verification log (redacted for secrets).
- Migration output log and schema version reference.
- Smoke test evidence (route + action-level pass notes).
- Rollback runbook note validated by dry review.

## Acceptance Criteria

- Core checklist passes without P0 regressions.
- Production environment variables are complete and valid.
- Deployed app supports login, dashboard, and study flow.
- Rollback notes exist and are executable by on-call maintainer.

## Current Execution Status (2026-03-06)

- Task 3 release-readiness documentation is complete.
- Local markdown validation for this file is passing.
- End-to-end execution is pending dependency unblocks listed below.

## Blockers

- Blocked until Sprint 2 ownership checks are merged for
  import/deck/card mutation paths.
- Blocked until Bot B confirms stable behavior/signatures for
  `gradeCard(cardId, grade)` and `getDueCards(deckId)`.
- Blocked until Sprint 3 grading path is stable for SRS due-date
  verification.

## Dependencies

- Completion of Sprint 2 and Sprint 3 P0 tasks

## Estimate

5–8 hours
