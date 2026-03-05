# Task 3: Session State Hooks

## Priority

`P1`

## Objective

Extract reusable client state logic for study metrics and transient notifications.

## Inputs

- `logic.md` state management strategy
- Existing hooks scaffolding (`useSessionStats`, `useToast`)

## Implementation Steps

1. Implement grade accumulator helper to update reviewed/again/hard/good/easy counters.
2. Implement reset behavior for new session start.
3. Add toast helper for user feedback on success/failure events.
4. Ensure hooks are side-effect safe and composable across study/import contexts.

## Acceptance Criteria

- Session counters are consistent with grade events.
- Hook APIs are simple and stable for component consumption.
- Toasts auto-dismiss without memory leaks.

## Dependencies

- Task 2 (study flow integration)

## Estimate

3–4 hours
