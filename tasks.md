# Backlog and Sprint Index

## Prioritization Model

- `P0`: Required for MVP learning loop (must ship)
- `P1`: Strongly recommended before public beta
- `P2`: Nice-to-have or post-MVP optimization

## Sprint Roadmap

### Sprint 1 — Core UI Foundations (`P0`)

- Goal: Build calm visual system, app shell, and dashboard/deck UI primitives.
- Sprint file: `tasks/sprint-1-core-ui/sprint.md`
- Tasks:
  - `tasks/sprint-1-core-ui/task-1-theme-tokenization.md`
  - `tasks/sprint-1-core-ui/task-2-app-shell-auth-layout.md`
  - `tasks/sprint-1-core-ui/task-3-dashboard-deck-components.md`

### Sprint 2 — Data + Auth Backbone (`P0`)

- Goal: Establish schema, authentication, and secure deck/card actions.
- Sprint file: `tasks/sprint-2-data-auth/sprint.md`
- Tasks:
  - `tasks/sprint-2-data-auth/task-1-prisma-schema-migrations.md`
  - `tasks/sprint-2-data-auth/task-2-nextauth-prisma-integration.md`
  - `tasks/sprint-2-data-auth/task-3-deck-card-server-actions.md`

### Sprint 3 — Study Runtime + SRS (`P0`)

- Goal: Ship due-card retrieval, reveal-grade cycle, and SRS scheduling updates.
- Sprint file: `tasks/sprint-3-study-srs/sprint.md`
- Tasks:
  - `tasks/sprint-3-study-srs/task-1-srs-engine-calculation.md`
  - `tasks/sprint-3-study-srs/task-2-study-session-card-loop.md`
  - `tasks/sprint-3-study-srs/task-3-session-state-hooks.md`

### Sprint 4 — Import, QA, Release (`P1`)

- Goal: Add Anki import, complete validation checklist, and deploy safely.
- Sprint file: `tasks/sprint-4-import-release/sprint.md`
- Tasks:
  - `tasks/sprint-4-import-release/task-1-anki-parser-import-action.md`
  - `tasks/sprint-4-import-release/task-2-import-ui-validation-flow.md`
  - `tasks/sprint-4-import-release/task-3-testing-deployment-readiness.md`

## Suggested Ownership for Parallel Work

- Track A (UI): Sprint 1 + Sprint 3 Task 2
- Track B (Backend/Auth): Sprint 2 + Sprint 3 Task 1
- Track C (Data Operations): Sprint 4 Task 1 + Task 2
- Track D (QA/Release): Sprint 4 Task 3

## File Structure

```text
tasks/
├── sprint-1-core-ui/
│   ├── sprint.md
│   ├── task-1-theme-tokenization.md
│   ├── task-2-app-shell-auth-layout.md
│   └── task-3-dashboard-deck-components.md
├── sprint-2-data-auth/
│   ├── sprint.md
│   ├── task-1-prisma-schema-migrations.md
│   ├── task-2-nextauth-prisma-integration.md
│   └── task-3-deck-card-server-actions.md
├── sprint-3-study-srs/
│   ├── sprint.md
│   ├── task-1-srs-engine-calculation.md
│   ├── task-2-study-session-card-loop.md
│   └── task-3-session-state-hooks.md
└── sprint-4-import-release/
    ├── sprint.md
    ├── task-1-anki-parser-import-action.md
    ├── task-2-import-ui-validation-flow.md
    └── task-3-testing-deployment-readiness.md
```
