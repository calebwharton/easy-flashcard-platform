# Task 2: App Shell + Auth Layout

## Priority

`P0`

## Objective

Create consistent page shells for auth and main app experiences with
low-noise navigation.

## Inputs

- `architecture.md` (route structure)
- `styles.md` (spacing and layout behavior)

## Implementation Steps

1. Implement `(auth)/layout.tsx` with centered card-style container.
1. Implement `(main)/layout.tsx` with header/sidebar/footer primitives.
1. Add responsive behavior for compact navigation on smaller screens.
1. Ensure study mode can suppress nonessential navigation chrome.
1. Validate spacing rhythm (`py-10`, `gap-6`) and width constraints.

## Acceptance Criteria

- `/login` uses centered calm auth card with consistent spacing.
- `/dashboard` and deck pages share the same shell primitives.
- Navigation remains present but visually secondary to content.

## Dependencies

- Task 1 (theme tokens should be available)

## Estimate

5–7 hours

## Bot A Execution Status (2026-03-06)

- Status: `Blocked`
- Scope owner: Bot A
- Source-of-truth references applied: `architecture.md` route groups and
  `styles.md` spacing/width discipline.

### Blocker Detail

- Required route-group files (`src/app/(auth)/layout.tsx`,
  `src/app/(main)/layout.tsx`) and shell component directories do not
  exist in this workspace, so this task cannot be executed without first
  creating the architecture baseline.

### Implementation-Ready Checklist (once scaffold exists)

1. Build `(auth)` layout with centered calm card container.
1. Build `(main)` shell with subdued navigation and content-first
   hierarchy.
1. Add responsive compact nav behavior for smaller breakpoints.
1. Add study-mode chrome suppression flag/path behavior.

### Validation Plan

- Visual QA for `/login`, `/dashboard`, and deck pages against spacing
  rhythm (`py-10`, `gap-6`) and width constraints.
- Run lint/typecheck to confirm layout and route-group integrity.
