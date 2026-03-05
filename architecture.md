# Architecture

## Technical Setup

### Platform Choices

- Next.js 14+ App Router with TypeScript
- Tailwind CSS + shadcn/ui for design-system-driven UI
- PostgreSQL with Prisma ORM
- Auth.js (NextAuth v5) with Prisma adapter
- OAuth providers: Google and GitHub
- Deploy target: Vercel

### Baseline Initialization

1. Create app with Next.js + TypeScript + Tailwind + App Router
2. Install Prisma, Auth.js, and support libraries (`zod`, `clsx`)
3. Initialize Prisma and connect `DATABASE_URL`
4. Configure auth env vars (`NEXTAUTH_URL`, `NEXTAUTH_SECRET`, provider credentials)

## Folder Structure

```text
flashcard-srs/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── (auth)/login/page.tsx
│   │   ├── (main)/dashboard/page.tsx
│   │   ├── (main)/deck/[deckId]/page.tsx
│   │   ├── (main)/deck/[deckId]/edit/page.tsx
│   │   ├── (main)/deck/[deckId]/import/page.tsx
│   │   ├── (main)/study/[deckId]/page.tsx
│   │   ├── actions/deck.ts
│   │   ├── actions/card.ts
│   │   ├── actions/import.ts
│   │   └── api/auth/[...nextauth]/route.ts
│   ├── components/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── deck/
│   │   ├── study/
│   │   ├── layout/
│   │   └── ui/
│   ├── hooks/
│   │   ├── useToast.ts
│   │   └── useSessionStats.ts
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── prisma.ts
│   │   ├── srs.ts
│   │   └── anki-parser.ts
│   └── types/index.ts
├── middleware.ts
└── .env.local
```

## Database Schema

### Core Learning Models

- `User`
  - Owns many decks
  - Linked to Auth.js account/session records
- `Deck`
  - Belongs to one user
  - Contains many cards
  - Optional metadata: `description`, `language`, `color`, `icon`
- `Card`
  - Belongs to one deck
  - Fields: `front`, `back`, `tags[]`, optional `extra` JSON
- `CardProgress`
  - Per-user learning state per card
  - Fields: `interval`, `easeFactor`, `repetitions`, `dueDate`, `lapses`, `lastReview`
  - Unique constraint: `(cardId, userId)`
- `StudySession`
  - Session-level counters (`again/hard/good/easy`, `cardsReviewed`) and timestamps

### Auth Models

- `Account`, `Session`, and `VerificationToken` from Auth.js adapter requirements

### Key Indexing

- Decks by `userId`
- Card progress by `(userId, dueDate)` for due-card retrieval
- Unique progress record per `(cardId, userId)`

## API Surface

### Route Handlers

- `GET/POST /api/auth/[...nextauth]` (Auth.js handlers)

### Server Actions (mutation/query boundary)

- Deck actions
  - `createDeck(data)`
  - `deleteDeck(deckId)`
  - `getUserDecks()`
- Card actions
  - `addCard(deckId, data)`
  - `gradeCard(cardId, grade)`
  - `getDueCards(deckId)`
- Import actions
  - `importAnkiFile(deckId, fileContent)`

## Security and Ownership Rules

- Every action requires authenticated session (`session.user.id`)
- Deck access is ownership-gated before card/import mutation
- Multi-tenant safety: user-specific filtering on deck and progress queries

## Deployment Notes

- Provision Postgres in Vercel Storage (or Neon)
- Set production env vars in Vercel dashboard
- Run Prisma migration/push against production `DATABASE_URL`
- Configure OAuth callback URLs for production and localhost
