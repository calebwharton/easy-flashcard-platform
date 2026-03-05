# Refactoring Plan: Flashcard SRS Platform

## Modular Docs Index (Use These First)

To avoid loading this large mono-file unless needed, use the modular docs:

- [map.md](map.md) — index, 200-word summary, and file map
- [styles.md](styles.md) — UI/UX system, palette, typography, spacing
- [architecture.md](architecture.md) — technical setup, schema, folder structure, API surface
- [logic.md](logic.md) — SRS behavior, card loop, and state management
- [tasks.md](tasks.md) — sprint backlog with detailed task files

Legacy monolithic plan continues below for archival reference.

## Overview

Transform the single-file HP Spanish flashcard app into a full-featured, multi-user SRS (Spaced Repetition System) platform built with Next.js, TypeScript, PostgreSQL (via Prisma ORM), and OAuth authentication. Users can create multiple decks, add cards individually or via Anki-format bulk import, and access their personalized dashboard from any device.

---

## Tech Stack

| Layer           | Technology                           |
| --------------- | ------------------------------------ |
| Framework       | Next.js 14+ (App Router)             |
| Language        | TypeScript                           |
| Styling         | Tailwind CSS                         |
| Database        | PostgreSQL (Vercel Postgres or Neon) |
| ORM             | Prisma                               |
| Authentication  | NextAuth.js v5 (Auth.js)             |
| OAuth Providers | Google, GitHub (expandable)          |
| Deployment      | Vercel                               |
| File Parsing    | Custom Anki TSV/TXT parser           |

---

## Phase 1: Project Initialization

### 1.1 Create Next.js Project

```bash
npx create-next-app@latest flashcard-srs --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd flashcard-srs
```

### 1.2 Install Dependencies

```bash
# Core
npm install @prisma/client next-auth@beta
npm install -D prisma

# Utilities
npm install clsx zod
npm install @auth/prisma-adapter
```

### 1.3 Initialize Prisma

```bash
npx prisma init
```

### 1.4 Environment Variables Setup (`.env.local`)

```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/flashcard_srs"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# OAuth Providers
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GITHUB_ID="..."
GITHUB_SECRET="..."
```

---

## Phase 2: Database Schema (Prisma)

### 2.1 Create Schema (`prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── AUTH MODELS (NextAuth) ───────────────────────────────────────────────────

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]

  // App-specific relations
  decks         Deck[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ─── APP MODELS ───────────────────────────────────────────────────────────────

model Deck {
  id          String   @id @default(cuid())
  name        String
  description String?
  language    String?  // e.g., "Spanish", "Japanese", "French"
  color       String?  // Hex color for dashboard card
  icon        String?  // Icon identifier

  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  cards       Card[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
}

model Card {
  id        String   @id @default(cuid())
  front     String   // Question / term (e.g., Spanish word)
  back      String   // Answer / definition (e.g., English translation)
  tags      String[] // Flexible tagging: ["verb", "chapter-1", "high-freq"]
  extra     Json?    // Additional metadata (frequency, notes, media URLs)

  deckId    String
  deck      Deck     @relation(fields: [deckId], references: [id], onDelete: Cascade)

  // SRS fields (per-user progress stored in CardProgress)
  progress  CardProgress[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([deckId])
}

model CardProgress {
  id          String   @id @default(cuid())

  cardId      String
  card        Card     @relation(fields: [cardId], references: [id], onDelete: Cascade)

  userId      String   // Denormalized for query efficiency

  // SRS algorithm state
  interval    Int      @default(0)      // Days until next review
  easeFactor  Float    @default(2.5)    // Multiplier for interval
  repetitions Int      @default(0)      // Successful reviews in a row
  dueDate     DateTime @default(now())  // When card is next due
  lapses      Int      @default(0)      // Times "Again" was pressed

  lastReview  DateTime?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([cardId, userId])
  @@index([userId, dueDate])
  @@index([cardId])
}

model StudySession {
  id            String   @id @default(cuid())
  userId        String
  deckId        String

  cardsReviewed Int      @default(0)
  cardsAgain    Int      @default(0)
  cardsHard     Int      @default(0)
  cardsGood     Int      @default(0)
  cardsEasy     Int      @default(0)

  startedAt     DateTime @default(now())
  endedAt       DateTime?

  @@index([userId])
  @@index([deckId])
}
```

### 2.2 Generate and Migrate

```bash
npx prisma generate
npx prisma db push  # For development
# OR
npx prisma migrate dev --name init  # For production migrations
```

---

## Phase 3: Authentication Setup

### 3.1 Create Auth Configuration (`src/lib/auth.ts`)

```typescript
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    session: async ({ session, user }) => {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
```

### 3.2 Create Prisma Client (`src/lib/prisma.ts`)

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

### 3.3 Create Auth API Route (`src/app/api/auth/[...nextauth]/route.ts`)

```typescript
import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers;
```

### 3.4 Create Auth Middleware (`middleware.ts`)

```typescript
export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: ["/dashboard/:path*", "/deck/:path*", "/study/:path*"],
};
```

---

## Phase 4: Type Definitions

### 4.1 Core Types (`src/types/index.ts`)

```typescript
import type { Card, Deck, CardProgress } from "@prisma/client";

export type Grade = 0 | 1 | 2 | 3; // Again, Hard, Good, Easy

export interface CardWithProgress extends Card {
  progress: CardProgress[];
}

export interface DeckWithCards extends Deck {
  cards: CardWithProgress[];
  _count?: { cards: number };
}

export interface DeckStats {
  total: number;
  due: number;
  learned: number; // repetitions >= 2
  mastered: number; // interval >= 21
  new: number; // no progress yet
}

export interface SessionStats {
  reviewed: number;
  again: number;
  hard: number;
  good: number;
  easy: number;
}

// Anki import types
export interface AnkiCard {
  front: string;
  back: string;
  tags: string[];
}

export interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}
```

---

## Phase 5: API Routes (Server Actions & Route Handlers)

### 5.1 Deck Actions (`src/app/actions/deck.ts`)

```typescript
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createDeck(data: {
  name: string;
  description?: string;
  language?: string;
  color?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const deck = await prisma.deck.create({
    data: {
      ...data,
      userId: session.user.id,
    },
  });

  revalidatePath("/dashboard");
  return deck;
}

export async function deleteDeck(deckId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.deck.delete({
    where: { id: deckId, userId: session.user.id },
  });

  revalidatePath("/dashboard");
}

export async function getUserDecks() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.deck.findMany({
    where: { userId: session.user.id },
    include: { _count: { select: { cards: true } } },
    orderBy: { updatedAt: "desc" },
  });
}
```

### 5.2 Card Actions (`src/app/actions/card.ts`)

```typescript
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { Grade } from "@/types";
import { calculateNextReview } from "@/lib/srs";

export async function addCard(
  deckId: string,
  data: {
    front: string;
    back: string;
    tags?: string[];
  },
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Verify deck ownership
  const deck = await prisma.deck.findFirst({
    where: { id: deckId, userId: session.user.id },
  });
  if (!deck) throw new Error("Deck not found");

  const card = await prisma.card.create({
    data: {
      front: data.front,
      back: data.back,
      tags: data.tags || [],
      deckId,
    },
  });

  revalidatePath(`/deck/${deckId}`);
  return card;
}

export async function gradeCard(cardId: string, grade: Grade) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Get or create progress
  let progress = await prisma.cardProgress.findUnique({
    where: { cardId_userId: { cardId, userId: session.user.id } },
  });

  const next = calculateNextReview(progress, grade);

  progress = await prisma.cardProgress.upsert({
    where: { cardId_userId: { cardId, userId: session.user.id } },
    update: {
      interval: next.interval,
      easeFactor: next.easeFactor,
      repetitions: next.repetitions,
      dueDate: next.dueDate,
      lapses: next.lapses,
      lastReview: new Date(),
    },
    create: {
      cardId,
      userId: session.user.id,
      ...next,
      lastReview: new Date(),
    },
  });

  return progress;
}

export async function getDueCards(deckId: string) {
  const session = await auth();
  if (!session?.user?.id) return [];

  const now = new Date();

  // Get cards with progress that are due, or cards without progress (new)
  return prisma.card.findMany({
    where: {
      deckId,
      deck: { userId: session.user.id },
      OR: [
        { progress: { none: { userId: session.user.id } } },
        {
          progress: {
            some: { userId: session.user.id, dueDate: { lte: now } },
          },
        },
      ],
    },
    include: {
      progress: { where: { userId: session.user.id } },
    },
    take: 50, // Limit batch size
  });
}
```

### 5.3 Import Actions (`src/app/actions/import.ts`)

```typescript
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { parseAnkiFile } from "@/lib/anki-parser";
import type { ImportResult } from "@/types";

export async function importAnkiFile(
  deckId: string,
  fileContent: string,
): Promise<ImportResult> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Verify deck ownership
  const deck = await prisma.deck.findFirst({
    where: { id: deckId, userId: session.user.id },
  });
  if (!deck) throw new Error("Deck not found");

  const parsed = parseAnkiFile(fileContent);

  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const card of parsed.cards) {
    try {
      await prisma.card.create({
        data: {
          front: card.front,
          back: card.back,
          tags: card.tags,
          deckId,
        },
      });
      success++;
    } catch (e) {
      failed++;
      errors.push(`Failed to import: "${card.front.slice(0, 30)}..."`);
    }
  }

  revalidatePath(`/deck/${deckId}`);

  return { success, failed, errors };
}
```

---

## Phase 6: SRS Engine

### 6.1 SRS Algorithm (`src/lib/srs.ts`)

```typescript
import type { CardProgress } from "@prisma/client";
import type { Grade } from "@/types";

interface SRSResult {
  interval: number;
  easeFactor: number;
  repetitions: number;
  dueDate: Date;
  lapses: number;
}

export function calculateNextReview(
  progress: CardProgress | null,
  grade: Grade,
): SRSResult {
  let interval = progress?.interval ?? 0;
  let easeFactor = progress?.easeFactor ?? 2.5;
  let repetitions = progress?.repetitions ?? 0;
  let lapses = progress?.lapses ?? 0;

  if (grade === 0) {
    // Again - reset
    lapses += 1;
    interval = 1;
    repetitions = 0;
    easeFactor = Math.max(1.3, easeFactor - 0.2);
  } else {
    // Hard, Good, or Easy
    if (repetitions === 0) {
      interval = grade === 3 ? 4 : 1;
    } else if (repetitions === 1) {
      interval = grade === 3 ? 6 : 3;
    } else {
      const multiplier =
        grade === 1 ? 1.2 : grade === 2 ? easeFactor : easeFactor * 1.3;
      interval = Math.round(interval * multiplier);
    }

    easeFactor = Math.max(
      1.3,
      easeFactor + (0.1 - (3 - grade) * (0.08 + (3 - grade) * 0.02)),
    );
    repetitions += 1;
  }

  const dueDate = new Date(Date.now() + interval * 24 * 60 * 60 * 1000);

  return { interval, easeFactor, repetitions, dueDate, lapses };
}

export function getNextIntervalPreview(
  progress: CardProgress | null,
  grade: Grade,
): string {
  const result = calculateNextReview(progress, grade);
  if (result.interval === 0) return "<1d";
  if (result.interval === 1) return "1d";
  if (result.interval < 30) return `${result.interval}d`;
  if (result.interval < 365) return `${Math.round(result.interval / 30)}mo`;
  return `${(result.interval / 365).toFixed(1)}y`;
}
```

---

## Phase 7: Anki File Parser

### 7.1 Parser Implementation (`src/lib/anki-parser.ts`)

```typescript
import type { AnkiCard } from "@/types";

interface ParseResult {
  cards: AnkiCard[];
  errors: string[];
}

/**
 * Parses Anki export format (TSV with optional tags)
 *
 * Supported formats:
 * 1. Simple TSV: front<TAB>back
 * 2. With tags: front<TAB>back<TAB>tag1 tag2 tag3
 * 3. Anki export with HTML: strips basic HTML tags
 *
 * Lines starting with # are treated as comments
 * Empty lines are skipped
 */
export function parseAnkiFile(content: string): ParseResult {
  const cards: AnkiCard[] = [];
  const errors: string[] = [];

  const lines = content.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines and comments
    if (!line || line.startsWith("#")) continue;

    // Split by tab
    const parts = line.split("\t");

    if (parts.length < 2) {
      errors.push(`Line ${i + 1}: Expected at least 2 tab-separated fields`);
      continue;
    }

    const front = stripHtml(parts[0]).trim();
    const back = stripHtml(parts[1]).trim();

    if (!front || !back) {
      errors.push(`Line ${i + 1}: Empty front or back field`);
      continue;
    }

    // Tags are optional, space-separated in the third field
    const tags = parts[2] ? parts[2].split(/\s+/).filter(Boolean) : [];

    cards.push({ front, back, tags });
  }

  return { cards, errors };
}

function stripHtml(str: string): string {
  return str
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .trim();
}

/**
 * Generates a sample Anki format string for user reference
 */
export function getAnkiFormatExample(): string {
  return `# Anki Format Example (lines starting with # are comments)
# Format: front<TAB>back<TAB>tags (tags are optional, space-separated)

hola\thello\tgreetings common
adiós\tgoodbye\tgreetings
libro\tbook\tnoun common
correr\tto run\tverb
`;
}
```

---

## Phase 8: Page Routes & Components

### 8.1 App Route Structure

```
src/app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx          # Login page with OAuth buttons
│   └── layout.tsx            # Centered auth layout
├── (main)/
│   ├── dashboard/
│   │   └── page.tsx          # User's deck dashboard
│   ├── deck/
│   │   └── [deckId]/
│   │       ├── page.tsx      # Deck detail (card list, stats)
│   │       ├── edit/
│   │       │   └── page.tsx  # Edit deck settings
│   │       └── import/
│   │           └── page.tsx  # Import cards page
│   ├── study/
│   │   └── [deckId]/
│   │       └── page.tsx      # Study session (flashcard review)
│   └── layout.tsx            # Main app layout with nav
├── api/
│   └── auth/
│       └── [...nextauth]/
│           └── route.ts
├── layout.tsx                # Root layout
├── page.tsx                  # Landing page (redirect or marketing)
└── globals.css
```

### 8.2 Component Structure

Component architecture below is now explicitly mapped to shadcn primitives and Tailwind patterns.

#### Auth Components

| Component      | shadcn primitives                                                   | Tailwind class pattern                                                                  |
| -------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `LoginButton`  | `Button`                                                            | `w-full h-10 rounded-xl font-medium transition-colors duration-150 hover:brightness-95` |
| `LogoutButton` | `DropdownMenuItem`, `Button`                                        | `text-muted-foreground hover:text-foreground`                                           |
| `UserMenu`     | `Avatar`, `DropdownMenu`, `DropdownMenuContent`, `DropdownMenuItem` | `rounded-xl border border-border bg-popover shadow-sm`                                  |

#### Dashboard Components

| Component         | shadcn primitives                                                                        | Tailwind class pattern                                                                                  |
| ----------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `DeckCard`        | `Card`, `CardHeader`, `CardContent`, `CardFooter`, `Badge`, `Button`                     | `rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow duration-200` |
| `DeckGrid`        | `Separator` (optional) + native grid layout                                              | `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5`                                                  |
| `CreateDeckModal` | `Dialog`, `DialogContent`, `DialogHeader`, `DialogFooter`, `Input`, `Textarea`, `Button` | `max-w-lg rounded-2xl p-6 space-y-4`                                                                    |
| `DashboardStats`  | `Card`, `Progress`, `Badge`                                                              | `grid grid-cols-2 lg:grid-cols-4 gap-4`                                                                 |

#### Deck Management Components

| Component      | shadcn primitives                                 | Tailwind class pattern                                                             |
| -------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `CardList`     | `Card`, `ScrollArea`, `Separator`                 | `rounded-2xl border border-border bg-card`                                         |
| `CardRow`      | `Badge`, `Button`, `DropdownMenu`                 | `flex items-center gap-3 h-12 px-4 rounded-lg hover:bg-muted/40 transition-colors` |
| `AddCardModal` | `Dialog`, `Input`, `Textarea`, `Button`           | `space-y-4 [&_textarea]:min-h-28`                                                  |
| `ImportModal`  | `Dialog`, `Tabs`, `ScrollArea`, `Alert`, `Button` | `max-w-2xl rounded-2xl p-6`                                                        |
| `DeckHeader`   | `Button`, `Badge`, `Separator`, `DropdownMenu`    | `flex flex-col gap-4 md:flex-row md:items-center md:justify-between`               |
| `DeckStats`    | `Card`, `Progress`, `Badge`                       | `rounded-2xl p-5 space-y-4 sticky top-20`                                          |

#### Study Components

| Component         | shadcn primitives                                                    | Tailwind class pattern                                                                                                                                  |
| ----------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `FlashCard`       | `Card`, `CardContent`                                                | `rounded-2xl border border-border bg-card shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] min-h-[320px] p-8 md:p-10 transition-all duration-300 ease-in-out` |
| `GradeButtons`    | `Button`, `Tooltip`                                                  | `grid grid-cols-2 md:grid-cols-4 gap-3 [&_button]:rounded-full [&_button]:px-6 [&_button]:py-3`                                                         |
| `ProgressBar`     | `Progress`                                                           | `h-1 w-full rounded-full`                                                                                                                               |
| `SessionComplete` | `Card`, `CardHeader`, `CardContent`, `CardFooter`, `Badge`, `Button` | `max-w-xl mx-auto rounded-2xl p-6 space-y-4`                                                                                                            |
| `StudyHeader`     | `Button`, `Separator`, `Badge`                                       | `flex items-center justify-between py-3`                                                                                                                |

#### Shared UI Primitives (wrapper layer)

| Wrapper       | shadcn primitive      | Tailwind defaults                                       |
| ------------- | --------------------- | ------------------------------------------------------- |
| `AppButton`   | `Button`              | `rounded-xl font-medium transition-colors duration-150` |
| `AppCard`     | `Card`                | `rounded-2xl border border-border shadow-sm`            |
| `AppInput`    | `Input`               | `h-10 rounded-xl border-input focus-visible:ring-2`     |
| `AppTextarea` | `Textarea`            | `rounded-xl min-h-28 leading-6`                         |
| `AppBadge`    | `Badge`               | `rounded-full px-2.5 py-0.5 text-xs font-medium`        |
| `AppToast`    | `Toast` (or `Sonner`) | `rounded-xl border border-border shadow-md`             |

#### Layout Components

| Component | shadcn primitives                   | Tailwind class pattern                                       |
| --------- | ----------------------------------- | ------------------------------------------------------------ |
| `Header`  | `Button`, `DropdownMenu`, `Avatar`  | `h-14 border-b border-border bg-background/95 backdrop-blur` |
| `Sidebar` | `Separator`, `ScrollArea`, `Button` | `w-64 border-r border-border bg-background`                  |
| `Footer`  | `Separator`                         | `py-6 text-sm text-muted-foreground`                         |

Implementation rule:

- Each feature component must be built from shadcn primitives first, then customized with token-based Tailwind utility classes (`bg-background`, `text-foreground`, `border-border`, `text-muted-foreground`) and no one-off hex values.

### 8.3 Key Page Implementations

**Dashboard Page (`src/app/(main)/dashboard/page.tsx`)**

```typescript
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getUserDecks } from '@/app/actions/deck'
import { DeckGrid } from '@/components/dashboard/DeckGrid'
import { CreateDeckModal } from '@/components/dashboard/CreateDeckModal'
import { Separator } from '@/components/ui/separator'

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const decks = await getUserDecks()

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-6xl px-6 py-10 space-y-6">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight">Your Decks</h1>
            <p className="text-sm text-muted-foreground">
              Keep decks focused, quiet, and easy to revisit.
            </p>
          </div>
          <CreateDeckModal />
        </header>

        <Separator className="bg-border" />

        <DeckGrid decks={decks} />
      </section>
    </main>
  )
}
```

**Study Page (`src/app/(main)/study/[deckId]/page.tsx`)**

```typescript
'use client'

import { useState, useEffect } from 'react'
import { getDueCards, gradeCard } from '@/app/actions/card'
import { FlashCard } from '@/components/study/FlashCard'
import { GradeButtons } from '@/components/study/GradeButtons'
import { SessionComplete } from '@/components/study/SessionComplete'
import type { CardWithProgress, Grade, SessionStats } from '@/types'

export default function StudyPage({ params }: { params: { deckId: string } }) {
  const [cards, setCards] = useState<CardWithProgress[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [stats, setStats] = useState<SessionStats>({
    reviewed: 0, again: 0, hard: 0, good: 0, easy: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDueCards(params.deckId).then(cards => {
      setCards(cards)
      setLoading(false)
    })
  }, [params.deckId])

  const handleGrade = async (grade: Grade) => {
    const card = cards[currentIndex]
    await gradeCard(card.id, grade)

    setStats(prev => ({
      reviewed: prev.reviewed + 1,
      again: prev.again + (grade === 0 ? 1 : 0),
      hard: prev.hard + (grade === 1 ? 1 : 0),
      good: prev.good + (grade === 2 ? 1 : 0),
      easy: prev.easy + (grade === 3 ? 1 : 0),
    }))

    setFlipped(false)
    setCurrentIndex(i => i + 1)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <section className="mx-auto max-w-[700px] px-6 py-10">
          <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground shadow-sm">
            Loading due cards...
          </div>
        </section>
      </main>
    )
  }

  if (currentIndex >= cards.length) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <section className="mx-auto max-w-[700px] px-6 py-10">
          <SessionComplete stats={stats} />
        </section>
      </main>
    )
  }

  const progressPct = (currentIndex / Math.max(cards.length, 1)) * 100

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-[700px] px-6 py-10 space-y-6">
        <header className="space-y-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>Study Session</p>
            <p>{Math.max(cards.length - currentIndex, 0)} left</p>
          </div>

          <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-accent transition-all duration-300 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </header>

        <FlashCard
          card={cards[currentIndex]}
          flipped={flipped}
          onFlip={() => setFlipped(true)}
        />

        {flipped && (
          <GradeButtons
            progress={cards[currentIndex].progress[0]}
            onGrade={handleGrade}
          />
        )}
      </section>
    </main>
  )
}
```

---

## Phase 9: Custom Hooks

### 9.1 Hooks Directory (`src/hooks/`)

```typescript
// useToast.ts
import { useState, useCallback } from "react";

export function useToast(duration = 3000) {
  const [message, setMessage] = useState<string | null>(null);

  const showToast = useCallback(
    (msg: string) => {
      setMessage(msg);
      setTimeout(() => setMessage(null), duration);
    },
    [duration],
  );

  return { message, showToast };
}

// useSessionStats.ts
import { useState, useCallback } from "react";
import type { SessionStats, Grade } from "@/types";

export function useSessionStats() {
  const [stats, setStats] = useState<SessionStats>({
    reviewed: 0,
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
  });

  const recordGrade = useCallback((grade: Grade) => {
    setStats((prev) => ({
      reviewed: prev.reviewed + 1,
      again: prev.again + (grade === 0 ? 1 : 0),
      hard: prev.hard + (grade === 1 ? 1 : 0),
      good: prev.good + (grade === 2 ? 1 : 0),
      easy: prev.easy + (grade === 3 ? 1 : 0),
    }));
  }, []);

  const reset = useCallback(() => {
    setStats({ reviewed: 0, again: 0, hard: 0, good: 0, easy: 0 });
  }, []);

  return { stats, recordGrade, reset };
}
```

---

## Phase 10: Visual Identity & Style Guide (Opinionated)

### 10.1 Design Philosophy: Cognitive Calm

Primary objective:

- Language learning is mentally taxing; the UI must never compete with memory work.

Guiding principles:

- **Minimalism**: if an element does not help the learner recall, remove it.
- **Softness**: rounded corners (`12px+`) and gentle transitions; avoid harsh, technical edges.
- **Focus**: negative space pulls attention to the flashcard center.
- **Low Stimulation**: avoid high-saturation accents, aggressive shadows, and noisy animation.

Tech commitment:

- Styling system: **Tailwind CSS**
- Component primitives: **shadcn/ui**

---

### 10.2 Color Palette & Usage (Low-Contrast Zen)

| UI Element       | Token Name     | HEX       | Usage Rule                                         |
| ---------------- | -------------- | --------- | -------------------------------------------------- |
| App Background   | Alabaster Mist | `#F8F7F4` | Default viewport background for all non-card areas |
| Card Surface     | Pure Paper     | `#FFFFFF` | Flashcard and panel surfaces with clean contrast   |
| Primary Text     | Inkwell Grey   | `#3C3C3C` | Main headings and vocabulary text                  |
| Secondary Text   | Driftwood      | `#8A8A8A` | Hints, metadata, due labels, helper copy           |
| Success / Good   | Moss Sage      | `#8E9775` | “Good/Easy” outcomes and progress fill             |
| Action / Neutral | Dusty Denim    | `#7D8E95` | Secondary actions and neutral links                |
| Warning / Hard   | Muted Clay     | `#D9AE94` | “Hard/Again” controls (non-panic warning tone)     |
| Neutral Border   | Soft Pebble    | `#DAD7D1` | Ghost button borders and low-emphasis separators   |

Usage constraints:

- Never use pure black (`#000`) or high-contrast red for default warning actions.
- Keep backgrounds warm-neutral (`Alabaster Mist`) and reserve white for content surfaces.
- Use color to support state, not decoration.

---

### 10.3 Tailwind Tokenization + shadcn Theme Mapping

All colors above must map to theme tokens in `globals.css` + `tailwind.config.ts` so component code uses semantic classes.

Token map:

- `--background`: Alabaster Mist
- `--card`: Pure Paper
- `--foreground`: Inkwell Grey
- `--muted-foreground`: Driftwood
- `--primary`: Dusty Denim
- `--accent`: Moss Sage tint
- `--warning`: Muted Clay
- `--border`: Soft Pebble

Required class usage:

- Background shell: `bg-background`
- Main card: `bg-card text-card-foreground`
- Secondary copy: `text-muted-foreground`
- Soft borders: `border border-border`
- Warning state: custom `bg-warning/20 text-warning-foreground`

---

### 10.4 Typography System (Modern Library)

Font pairing:

- **Primary Heading (the studied word)**: `Libre Baskerville` or `Playfair Display`
- **Body/UI text**: `Inter` or `Open Sans`

Why this pairing:

- Serif heading increases character distinctness and academic tone.
- Sans UI text keeps controls readable and unobtrusive.

Type hierarchy:

- Flashcard word: `text-5xl md:text-6xl leading-tight tracking-tight font-serif`
- Page headings: `text-3xl font-semibold`
- Section headings: `text-xl font-medium`
- Body text: `text-base leading-7`
- Metadata: `text-sm text-muted-foreground`

Line-length rules:

- Main study content max width: `max-w-[700px]`
- Body reading width for docs/help: `max-w-[72ch]`

---

### 10.5 UI Components & Styling Patterns

#### Flashcard

- Border radius: `rounded-2xl` (16px)
- Surface: `bg-card border border-border`
- Shadow: `shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)]`
- Transition: `transition-all duration-300 ease-in-out`
- Layout priority: always centered in viewport with generous vertical whitespace

#### SRS Buttons

- Shape: pill or rounded-rect (`rounded-full` or `rounded-xl`)
- Padding: `px-6 py-3` (≈12px × 24px)
- Hover behavior: darken by ~5% only (`hover:brightness-95`)
- No dramatic color swaps on hover/focus

State mapping:

- `Good/Easy`: Moss Sage family
- `Hard/Again`: Muted Clay family
- Neutral actions: Dusty Denim + ghost variants

#### Ghost Buttons

- Transparent background + 1px `Soft Pebble` border
- Tailwind pattern: `bg-transparent border border-border text-muted-foreground hover:bg-muted/40`
- Use for secondary actions (Edit, Cancel, Back)

#### Progress Indicators

- Bar placement: fixed at top inside study header
- Height: `h-1` (4px)
- Track: muted neutral tone
- Fill: Moss Sage (`bg-accent` mapped)
- Motion: smooth width transition (`duration-300 ease-out`)

---

### 10.6 Layout Inspiration Applied

#### Medium-inspired width discipline

- Main study lane fixed near article width: `max-w-[700px] mx-auto`
- Avoid ultra-wide card layouts to reduce eye travel.

#### Notion-inspired navigation behavior

- Navigation remains present but non-dominant.
- In study mode, enable “Zen Mode”: hide sidebar and mute header chrome.

#### Airbnb-inspired softness

- Large whitespace around major blocks (`py-10`, `gap-6`).
- Comfortable spacing between flashcard and controls.
- Soft edges and subtle depth, never hard outlines.

---

### 10.7 Page-Level Styling Rules (Relaxing Vibe)

#### Landing (`/`)

- Minimal hero, two CTAs max, no decorative clutter.
- Background `bg-background`; typography does hierarchy work.

#### Login (`/login`)

- Single centered auth card (`max-w-md`, `rounded-2xl`, `shadow-sm`).
- OAuth buttons equal width/height for calm visual rhythm.

#### Dashboard (`/dashboard`)

- Quiet deck grid with consistent card heights.
- One dominant CTA (Create Deck), all else secondary/ghost.

#### Deck Detail (`/deck/[deckId]`)

- List-first design; controls grouped and tucked into toolbar cards.
- Stats/actions in calm side panel; no noisy icon clusters.

#### Import (`/deck/[deckId]/import`)

- Clear 3-step visual path: format → upload → validate.
- Error feedback inline and polite; avoid alarming colors.

#### Study (`/study/[deckId]`)

- Full concentration mode: centered flashcard, thin progress strip, minimal navigation.
- Primary interaction loop is reveal → grade, with no competing elements.

---

### 10.8 Motion, Interaction, and Accessibility Rules

Motion:

- Default component transitions: `200–300ms ease-in-out`
- Avoid bouncing, flipping theatrics, or complex parallax
- Respect reduced motion via `motion-reduce:transition-none`

Focus and keyboard:

- Always-visible focus rings using theme ring tokens
- Full keyboard path through study controls and import workflow

Contrast and fatigue prevention:

- Maintain WCAG AA contrast while preserving low-contrast feel
- Reserve strongest contrast for current card content only

---

### 10.9 Starter Tailwind Patterns (for implementation)

```tsx
// App shell
<main className="min-h-screen bg-background text-foreground" />

// Study container (Medium-like width)
<section className="max-w-[700px] mx-auto px-6 py-10 space-y-6" />

// Flashcard
<Card className="rounded-2xl border-border bg-card shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] transition-all duration-300 ease-in-out" />

// Primary SRS button
<Button className="rounded-full px-6 py-3 bg-accent text-accent-foreground hover:brightness-95" />

// Ghost button
<Button variant="outline" className="rounded-xl border-border text-muted-foreground hover:bg-muted/40" />

// Thin progress bar
<Progress className="h-1" />
```

Definition of done:

- Every page follows low-contrast tokenized colors.
- Flashcard is the visual center of gravity in study mode.
- shadcn primitives are used consistently with Tailwind semantic class patterns.
- UI feels quiet, scholarly, and emotionally neutral during long sessions.

---

## Phase 11: Vercel & Database Setup

### 11.1 Vercel Postgres Setup

1. Create project on Vercel
2. Go to Storage → Create Database → Postgres
3. Copy connection strings to environment variables
4. Run `npx prisma db push` with production DATABASE_URL

### 11.2 Environment Variables (Vercel Dashboard)

```
DATABASE_URL=postgres://...
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_ID=...
GITHUB_SECRET=...
```

### 11.3 OAuth Provider Setup

**Google Cloud Console:**

1. Create OAuth 2.0 credentials
2. Add authorized redirect URI: `https://your-domain.vercel.app/api/auth/callback/google`
3. Add localhost for development: `http://localhost:3000/api/auth/callback/google`

**GitHub Developer Settings:**

1. Create new OAuth App
2. Authorization callback URL: `https://your-domain.vercel.app/api/auth/callback/github`

---

## Phase 12: Testing & Deployment

### 12.1 Local Development Testing

```bash
# Start local Postgres (Docker)
docker run --name flashcard-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres

# Set DATABASE_URL
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/flashcard_srs"

# Push schema
npx prisma db push

# Seed sample data (optional)
npx prisma db seed

# Start dev server
npm run dev
```

### 12.2 Testing Checklist

- [ ] OAuth login (Google, GitHub)
- [ ] Create new deck
- [ ] Add individual card
- [ ] Import Anki file (TSV format)
- [ ] Study session flow
- [ ] Grading updates SRS state
- [ ] Cards appear on correct due dates
- [ ] Multiple decks per user
- [ ] Data isolation between users

### 12.3 Deploy

```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit: Flashcard SRS Platform"
gh repo create flashcard-srs --public --push --source .

# Connect Vercel
# - Import from GitHub
# - Add environment variables
# - Deploy
```

---

## Final File Structure

```
flashcard-srs/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (main)/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── deck/[deckId]/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── edit/page.tsx
│   │   │   │   └── import/page.tsx
│   │   │   ├── study/[deckId]/page.tsx
│   │   │   └── layout.tsx
│   │   ├── api/auth/[...nextauth]/route.ts
│   │   ├── actions/
│   │   │   ├── deck.ts
│   │   │   ├── card.ts
│   │   │   └── import.ts
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── deck/
│   │   ├── study/
│   │   ├── ui/
│   │   └── layout/
│   ├── hooks/
│   │   ├── useToast.ts
│   │   └── useSessionStats.ts
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── prisma.ts
│   │   ├── srs.ts
│   │   └── anki-parser.ts
│   └── types/
│       └── index.ts
├── public/
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
├── middleware.ts
├── package.json
└── .env.local
```

---

## Data Migration (Optional)

### Importing Existing HP Spanish Cards

Create a seed script to import the original ~200 cards as a starter deck:

```typescript
// prisma/seed.ts
import { prisma } from "../src/lib/prisma";
import { BASE_CARDS } from "../src/data/hp-spanish-cards";

async function main() {
  // Create a public "HP Spanish" deck template
  // Or provide as downloadable .txt file in Anki format
}
```

---

## Estimated Effort

| Phase                 | Time Estimate |
| --------------------- | ------------- |
| 1. Project Init       | 15 min        |
| 2. Database Schema    | 30 min        |
| 3. Auth Setup         | 45 min        |
| 4. Type Definitions   | 15 min        |
| 5. API Routes/Actions | 1.5 hr        |
| 6. SRS Engine         | 20 min        |
| 7. Anki Parser        | 30 min        |
| 8. Pages & Routes     | 2 hr          |
| 9. Custom Hooks       | 20 min        |
| 10. Styling           | 1 hr          |
| 11. Vercel/DB Setup   | 45 min        |
| 12. Testing & Deploy  | 1 hr          |
| **Total**             | **~9 hours**  |

---

## Key Architecture Decisions

1. **Server Actions over API Routes**: Use Next.js Server Actions for mutations (simpler, type-safe)

2. **CardProgress Separation**: SRS state stored separately from Card, allowing shared decks in future

3. **Prisma ORM**: Type-safe database access, easy migrations, works great with Vercel Postgres

4. **NextAuth v5**: Latest Auth.js with built-in Prisma adapter

5. **Anki Compatibility**: Simple TSV parser covers 90% of Anki exports without complex .apkg handling

6. **Optimistic Updates**: Consider adding for better UX during study sessions

---

## Future Enhancements (Out of Scope)

- [ ] Shared/public deck library
- [ ] Deck templates and cloning
- [ ] Rich text/markdown in cards
- [ ] Image and audio support
- [ ] Mobile app (React Native)
- [ ] Keyboard shortcuts for grading
- [ ] Spaced repetition algorithm variants (SM-2, FSRS)
- [ ] Export to Anki format
- [ ] Study streak tracking
- [ ] Collaborative deck editing
