# Task 2: Import UI + Validation Flow

## Priority

`P1`

## Objective

Create a low-friction import experience that guides users through format,
upload, and validation.

## Inputs

- `styles.md` import page styling constraints
- Parser/import action from Task 1

## Route + Boundaries

- Route: `(main)/deck/[deckId]/import/page.tsx`
- Uses existing deck ownership boundaries (no client-side bypass paths)
- Uses Task 1 action contract directly for result rendering

## Implementation Steps

1. Build a single-page, 3-step vertical flow:
   - Step 1: Format help (TSV explanation + sample block).
   - Step 2: Input (paste textarea and optional `.txt/.tsv` upload).
   - Step 3: Results (summary + row-level issues).
2. Keep controls minimal:
   - One primary import action.
   - One secondary clear/reset action.
3. Add input validation before submit:
   - Reject empty payload.
   - Reject unsupported file types.
4. Submit to import action and handle response states:
   - `idle`, `submitting`, `success`, `partial`, `error`.
5. Render deterministic summary block:
   - `Imported X cards`
   - `Failed Y rows`
6. Render inline error list with line numbers from action response.
7. Trigger route/data revalidation after successful writes.
8. Preserve calm UI tone from `styles.md`:
   - Semantic tokens only.
   - Subdued warning visuals (`warning` family), no alarm styling.

## UX/Copy Rules

- Use actionable and neutral language (for example,
  "Row 12 is missing back text").
- Keep error text one line where possible.
- For partial success, present success summary first, then issues.

## Accessibility Requirements

- Label textarea and file input explicitly.
- Ensure keyboard-only operation for import/clear actions.
- Announce submit/result transitions with accessible status text.

## Acceptance Criteria

- Users can import valid TSV content from deck import route.
- Validation feedback is actionable and non-blocking where possible.
- UI remains consistent with dashboard/deck design system.

## Dependencies

- Task 1 (parser and action)
- Sprint 1 styling foundations

## Estimate

4–6 hours
