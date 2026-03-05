# Task 1: SRS Engine Calculation

## Priority

`P0`

## Objective

Implement deterministic next-review computation for grades Again/Hard/Good/Easy.

## Inputs

- `logic.md` SRS scheduling rules
- Existing `src/lib/srs.ts`

## Implementation Steps

1. Implement `calculateNextReview(progress, grade)` with default bootstrap state.
2. Apply reset behavior for `Again` (lapse increment, interval reset, ease floor).
3. Apply early and mature interval scaling for `Hard/Good/Easy`.
4. Update ease factor with bounded formula and minimum threshold.
5. Compute `dueDate` from review timestamp + interval days for every grade path.
6. Implement interval preview utility (`<1d`, `1d`, `Xd`, `Xmo`, `Xy`).

## Acceptance Criteria

- Grade transitions produce expected interval/ease/repetition outcomes.
- `dueDate` is always computed from current time + interval days.
- Output shape is directly usable by card progress upsert action.
- Ease factor never drops below `1.3`.
- Early-success behavior matches rules (`1/3` days, or `4/6` on Easy).

## Dependencies

- Sprint 2 Task 3 for persistence integration

## Estimate

3–5 hours

## Validation Checklist

- Deterministic test cases cover Again/Hard/Good/Easy transitions
- Interval and due-date outputs match `logic.md` scheduling rules
- Returned object includes all persistence fields required by progress upsert

## Bot C Execution Status (2026-03-06)

- Status: `Implemented (pending integration validation)`
- Delivered in `src/lib/srs.ts`:
	- `calculateNextReview(progress, grade, now?)`
	- `getNextIntervalPreview(progress, grade, now?)`
- Logic alignment: Again reset path, early-step intervals (`1/3`, Easy
	`4/6`), mature multipliers, ease floor `1.3`, deterministic due-date
	computation.
