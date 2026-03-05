# Task 3: Dashboard + Deck Components

## Priority

`P0`

## Objective

Deliver core dashboard and deck UI building blocks using shadcn
primitives and token-based Tailwind classes.

## Inputs

- `styles.md` (component style patterns)
- `architecture.md` (component folders and routes)

## Implementation Steps

1. Build `DeckCard`, `DeckGrid`, and `CreateDeckModal` components.
1. Build deck management primitives (`DeckHeader`, `CardList`,
   `CardRow`, `AddCardModal`).
1. Add lightweight stats cards (`DashboardStats`, `DeckStats`) with
   consistent visual language.
1. Ensure empty states and loading states use calm neutral styles.

## Acceptance Criteria

- Dashboard renders cards in responsive grid with consistent card
  height/radius/shadow.
- Create deck modal supports required fields and adheres to tokenized
  style rules.
- Deck detail page supports list-first management layout without noisy
  controls.

## Dependencies

- Task 1 (tokens)
- Task 2 (shell/layout)

## Estimate

6–8 hours

## Bot A Execution Status (2026-03-06)

- Status: `Blocked`
- Scope owner: Bot A
- Source-of-truth references applied: `styles.md` component pattern rules
  and `architecture.md` dashboard/deck component targets.

### Blocker Detail

- The component targets for this task (`src/components/dashboard/*`,
  `src/components/deck/*`, route pages under `src/app/(main)/*`) are not
  present, so dashboard/deck primitives cannot be implemented in-place
  yet.

### Implementation-Ready Checklist (once scaffold exists)

1. Build `DeckCard`, `DeckGrid`, and `CreateDeckModal` with tokenized
   classes.
1. Build `DeckHeader`, `CardList`, `CardRow`, and `AddCardModal`
   list-first deck management primitives.
1. Add calm empty/loading states and lightweight stats blocks
   (`DashboardStats`, `DeckStats`).
1. Verify responsive grid consistency and card surface rhythm.

### Validation Plan

- Component-level render checks for dashboard/deck screens.
- Lint/typecheck and interactive QA for create/add modal flows.
