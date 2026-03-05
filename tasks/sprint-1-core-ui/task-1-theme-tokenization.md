# Task 1: Theme Tokenization

## Priority

`P0`

## Objective

Map the visual palette to semantic theme tokens and enforce token-first
utility usage across components.

## Inputs

- `styles.md` (palette, token map, typography, spacing)
- Existing `globals.css` and `tailwind.config.ts`

## Implementation Steps

1. Define CSS variables for background, card, foreground, muted
   foreground, primary, accent, warning, and border.
1. Wire variables into Tailwind/shadcn theme extension.
1. Verify semantic classes (`bg-background`, `bg-card`,
   `text-muted-foreground`, `border-border`) render correctly.
1. Add serif + sans font assignments for heading vs body roles.
1. Audit and replace one-off color usage in core layout components.

## Acceptance Criteria

- Palette values match specification (Alabaster Mist, Moss Sage, etc.).
- No new one-off hex colors in feature component code.
- Typography pairing is available globally and applied in study
  heading/body hierarchy.

## Dependencies

- None

## Estimate

4–6 hours

## Bot A Execution Status (2026-03-06)

- Status: `Blocked`
- Scope owner: Bot A
- Source-of-truth references applied: `styles.md` token map and
  typography pairing.

### Blocker Detail

- This task requires editing `globals.css` + `tailwind.config.ts` and
  token-consuming UI files, but those architecture-defined files are not
  present in the current workspace.

### Implementation-Ready Checklist (once scaffold exists)

1. Define CSS variables for `background`, `card`, `foreground`,
   `muted-foreground`, `primary`, `accent`, `warning`, `border`.
1. Wire semantic color keys in Tailwind theme extension.
1. Add serif/sans font variables and apply heading/body defaults.
1. Replace one-off colors in core layout/dashboard/deck components with
   semantic classes.

### Validation Plan

- Verify semantic class rendering in `/login` and `/dashboard`.
- Run lint/typecheck after token migration to confirm no class or
  config regressions.
