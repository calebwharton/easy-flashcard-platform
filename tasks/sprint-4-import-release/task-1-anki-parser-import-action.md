# Task 1: Anki Parser + Import Action

## Priority

`P1`

## Objective

Support bulk card ingestion from Anki-compatible TSV/TXT exports with
robust line-level validation.

## Inputs

- `architecture.md` import action contract
- `logic.md` data requirements for cards

## Contract

- Server action: `importAnkiFile(deckId, fileContent)`
- Parser location: `src/lib/anki-parser.ts`
- Parser output shape:
  - `validRows`: normalized card payloads
  - `errors`: `{ line: number; message: string; raw: string }[]`
- Action response shape:
  - `successCount: number`
  - `failedCount: number`
  - `errors: { line: number; message: string }[]`

## Implementation Steps

1. Normalize input (`\r\n`/`\r` → `\n`) and split into lines.
2. Skip empty lines and comment lines (trimmed line starts with `#`).
3. Parse each row as `front<TAB>back<TAB>tags?`.
4. Sanitize `front/back`:
   - Strip HTML tags.
   - Decode common entities (`&nbsp;`, `&amp;`, `&lt;`, `&gt;`,
     `&quot;`, `&#39;`).
   - Trim surrounding whitespace.
5. Normalize tags when present:
   - Split by comma.
   - Trim each tag.
   - Remove empties.
6. Validate row-level requirements:
   - `front` required.
   - `back` required.
   - Reject malformed rows with fewer than 2 tab-separated fields.
7. Accumulate line-specific errors without aborting the full import.
8. In `importAnkiFile`, enforce auth and deck ownership before writes.
9. Persist only valid rows via batch creation scoped to the owned deck.
10. Return deterministic summary counts plus sorted line errors.

## Validation Rules

- Invalid rows never block valid-row writes.
- Error ordering follows source line order.
- Re-running same file is allowed (no dedupe in this task).
- Max error payload should be capped for UI usability (first 100 errors),
  while `failedCount` remains exact.

## Non-Goals

- Media/audio import handling.
- Cloze syntax expansion.
- Tag taxonomy management.

## Acceptance Criteria

- Parser supports simple TSV and optional tags.
- Invalid rows do not block valid-row imports.
- Import summary output is deterministic and user-friendly.

## Dependencies

- Sprint 2 Task 3 (deck/card actions and ownership checks)

## Estimate

4–6 hours
