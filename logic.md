# Logic

## Functional Mechanics Overview

The runtime loop is: fetch due/new cards → present one card at a time → reveal answer (flip) → submit grade (`Again`, `Hard`, `Good`, `Easy`) → update SRS progress → move to next card → end session with stats.

## SRS Engine

### Grade Model

- `0`: Again
- `1`: Hard
- `2`: Good
- `3`: Easy

### Progress State (per user per card)

- `interval` (days until next review)
- `easeFactor` (review growth multiplier)
- `repetitions` (successful streak count)
- `dueDate` (next time card is due)
- `lapses` (number of Again resets)
- `lastReview`

### Scheduling Rules

1. Initialize defaults when no prior progress:
   - `interval = 0`, `easeFactor = 2.5`, `repetitions = 0`, `lapses = 0`
2. If grade is `Again`:
   - `lapses += 1`
   - `interval = 1`
   - `repetitions = 0`
   - `easeFactor = max(1.3, easeFactor - 0.2)`
3. If grade is `Hard/Good/Easy`:
   - Early learning steps:
     - First success: `1d` (`4d` for Easy)
     - Second success: `3d` (`6d` for Easy)
   - Mature steps:
     - `Hard`: interval × `1.2`
     - `Good`: interval × `easeFactor`
     - `Easy`: interval × `easeFactor * 1.3`
   - Update `easeFactor` with bounded SM-2-style formula, floor `1.3`
   - Increment `repetitions`
4. Compute next review:
   - `dueDate = now + interval days`

## Due Card Selection Logic

For a selected deck, retrieve cards where:

- No progress exists for current user (new card), OR
- Progress exists and `dueDate <= now` (due card)

Constraints:

- Scope to current user’s deck ownership
- Include current user’s progress in result
- Limit batch size (e.g., 50 cards)

## Card Flip and Study Flow

### Client State

- `cards`: due/new cards loaded at session start
- `currentIndex`: active card pointer
- `flipped`: front/back reveal gate
- `stats`: session counters (`reviewed`, `again`, `hard`, `good`, `easy`)
- `loading`: initial fetch state

### Interaction Sequence

1. Load due cards on mount
2. Show front side only
3. User flips card (`flipped = true`)
4. Show grading controls only after flip
5. On grade:
   - Persist progress via `gradeCard(cardId, grade)`
   - Increment session stats
   - Reset `flipped` to `false`
   - Advance `currentIndex`
6. If index exceeds list length, show session-complete view

## State Management Strategy

- Server responsibilities:
  - Auth validation
  - Ownership checks
  - Data fetch/mutation and SRS persistence
- Client responsibilities:
  - Session UI transitions
  - Flip state and in-session counters
  - Progress bar rendering and completion handoff

### Reusable Hooks

- `useSessionStats`: encapsulates grade-to-stat accumulation and reset
- `useToast`: lightweight transient feedback utility

This split keeps correctness and security server-side while preserving responsive study interactions on the client.
