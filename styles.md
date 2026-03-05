# Styles System

## Design Intent: Cognitive Calm

- Minimize visual noise so attention stays on recall tasks.
- Use soft geometry (`rounded-xl` to `rounded-2xl`) and subtle depth.
- Keep hierarchy clear through spacing and typography, not aggressive color.
- Use semantic tokens (`bg-background`, `text-foreground`, `border-border`) instead of one-off values in component code.

## Color Palette

| Role               | Name           | Hex       | Primary Usage                   |
| ------------------ | -------------- | --------- | ------------------------------- |
| App Background     | Alabaster Mist | `#F8F7F4` | Main page background            |
| Surface            | Pure Paper     | `#FFFFFF` | Flashcards and panel surfaces   |
| Primary Text       | Inkwell Grey   | `#3C3C3C` | Core text and headings          |
| Secondary Text     | Driftwood      | `#8A8A8A` | Metadata, helper text           |
| Success / Positive | Moss Sage      | `#8E9775` | Good/Easy grades, progress fill |
| Neutral Action     | Dusty Denim    | `#7D8E95` | Secondary action emphasis       |
| Warning / Struggle | Muted Clay     | `#D9AE94` | Hard/Again states               |
| Border / Divider   | Soft Pebble    | `#DAD7D1` | Borders and separators          |

### Usage Rules

- Avoid pure black and alarm-style reds for default interface states.
- Keep non-content areas warm-neutral and reserve white for content surfaces.
- Use color for meaning (state + affordance), not decoration.

## Token Mapping

- `--background`: Alabaster Mist
- `--card`: Pure Paper
- `--foreground`: Inkwell Grey
- `--muted-foreground`: Driftwood
- `--primary`: Dusty Denim
- `--accent`: Moss Sage family
- `--warning`: Muted Clay family
- `--border`: Soft Pebble

Required utility usage:

- Shell: `bg-background text-foreground`
- Surface: `bg-card text-card-foreground`
- Low-emphasis text: `text-muted-foreground`
- Borders: `border border-border`
- Warning state: `bg-warning/20 text-warning-foreground`

## Typography

### Font Pairing

- Heading word (flashcard focus): `Libre Baskerville` or `Playfair Display`
- UI/body: `Inter` or `Open Sans`

### Type Hierarchy

- Flashcard term: `text-5xl md:text-6xl leading-tight tracking-tight font-serif`
- Page heading: `text-3xl font-semibold`
- Section heading: `text-xl font-medium`
- Body: `text-base leading-7`
- Metadata: `text-sm text-muted-foreground`

### Width Discipline

- Study lane: `max-w-[700px]`
- Longform/docs content: `max-w-[72ch]`

## Spacing & Layout Rules (Medium + Notion Inspired)

- Use constrained reading widths to reduce eye travel.
- Maintain generous rhythm: `py-10`, `gap-6`, `space-y-6` as default large-section spacing.
- Keep navigation present but visually subdued.
- In study mode, de-emphasize global chrome (“Zen Mode”): centered content, minimal surrounding UI.
- Prefer consistent card spacing and predictable vertical stacking over dense dashboards.

## Component Style Patterns

- Flashcard: `rounded-2xl border border-border bg-card shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] transition-all duration-300 ease-in-out`
- Grade controls: rounded pill/soft-rect, `px-6 py-3`, subtle `hover:brightness-95`
- Ghost button: `bg-transparent border border-border text-muted-foreground hover:bg-muted/40`
- Progress bar: top-positioned, `h-1`, muted track + accent fill

## Motion and Accessibility

- Default transitions: `200–300ms ease-in-out`
- Respect reduced motion: `motion-reduce:transition-none`
- Keep focus rings visible and keyboard traversal complete across study/import actions.
- Preserve WCAG AA contrast while still maintaining a low-stimulation interface.
