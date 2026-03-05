# Refactoring Plan: Flashcard SRS Platform

## Overview

Transform the single-file HP Spanish flashcard app into a full-featured, multi-user SRS (Spaced Repetition System) platform built with Next.js, TypeScript, PostgreSQL (via Prisma ORM), and OAuth authentication. Users can create multiple decks, add cards individually or via Anki-format bulk import, and access their personalized dashboard from any device.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL (Vercel Postgres or Neon) |
| ORM | Prisma |
| Authentication | NextAuth.js v5 (Auth.js) |
| OAuth Providers | Google, GitHub (expandable) |
| Deployment | Vercel |
| File Parsing | Custom Anki TSV/TXT parser |

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
import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import { prisma } from "@/lib/prisma"

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
        session.user.id = user.id
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
})
```

### 3.2 Create Prisma Client (`src/lib/prisma.ts`)

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### 3.3 Create Auth API Route (`src/app/api/auth/[...nextauth]/route.ts`)

```typescript
import { handlers } from "@/lib/auth"
export const { GET, POST } = handlers
```

### 3.4 Create Auth Middleware (`middleware.ts`)

```typescript
export { auth as middleware } from "@/lib/auth"

export const config = {
  matcher: ['/dashboard/:path*', '/deck/:path*', '/study/:path*'],
}
```

---

## Phase 4: Type Definitions

### 4.1 Core Types (`src/types/index.ts`)

```typescript
import type { Card, Deck, CardProgress } from '@prisma/client'

export type Grade = 0 | 1 | 2 | 3 // Again, Hard, Good, Easy

export interface CardWithProgress extends Card {
  progress: CardProgress[]
}

export interface DeckWithCards extends Deck {
  cards: CardWithProgress[]
  _count?: { cards: number }
}

export interface DeckStats {
  total: number
  due: number
  learned: number   // repetitions >= 2
  mastered: number  // interval >= 21
  new: number       // no progress yet
}

export interface SessionStats {
  reviewed: number
  again: number
  hard: number
  good: number
  easy: number
}

// Anki import types
export interface AnkiCard {
  front: string
  back: string
  tags: string[]
}

export interface ImportResult {
  success: number
  failed: number
  errors: string[]
}
```

---

## Phase 5: API Routes (Server Actions & Route Handlers)

### 5.1 Deck Actions (`src/app/actions/deck.ts`)

```typescript
'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createDeck(data: {
  name: string
  description?: string
  language?: string
  color?: string
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const deck = await prisma.deck.create({
    data: {
      ...data,
      userId: session.user.id,
    },
  })

  revalidatePath('/dashboard')
  return deck
}

export async function deleteDeck(deckId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  await prisma.deck.delete({
    where: { id: deckId, userId: session.user.id },
  })

  revalidatePath('/dashboard')
}

export async function getUserDecks() {
  const session = await auth()
  if (!session?.user?.id) return []

  return prisma.deck.findMany({
    where: { userId: session.user.id },
    include: { _count: { select: { cards: true } } },
    orderBy: { updatedAt: 'desc' },
  })
}
```

### 5.2 Card Actions (`src/app/actions/card.ts`)

```typescript
'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import type { Grade } from '@/types'
import { calculateNextReview } from '@/lib/srs'

export async function addCard(deckId: string, data: {
  front: string
  back: string
  tags?: string[]
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  // Verify deck ownership
  const deck = await prisma.deck.findFirst({
    where: { id: deckId, userId: session.user.id },
  })
  if (!deck) throw new Error('Deck not found')

  const card = await prisma.card.create({
    data: {
      front: data.front,
      back: data.back,
      tags: data.tags || [],
      deckId,
    },
  })

  revalidatePath(`/deck/${deckId}`)
  return card
}

export async function gradeCard(cardId: string, grade: Grade) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  // Get or create progress
  let progress = await prisma.cardProgress.findUnique({
    where: { cardId_userId: { cardId, userId: session.user.id } },
  })

  const next = calculateNextReview(progress, grade)

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
  })

  return progress
}

export async function getDueCards(deckId: string) {
  const session = await auth()
  if (!session?.user?.id) return []

  const now = new Date()

  // Get cards with progress that are due, or cards without progress (new)
  return prisma.card.findMany({
    where: {
      deckId,
      deck: { userId: session.user.id },
      OR: [
        { progress: { none: { userId: session.user.id } } },
        { progress: { some: { userId: session.user.id, dueDate: { lte: now } } } },
      ],
    },
    include: {
      progress: { where: { userId: session.user.id } },
    },
    take: 50, // Limit batch size
  })
}
```

### 5.3 Import Actions (`src/app/actions/import.ts`)

```typescript
'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { parseAnkiFile } from '@/lib/anki-parser'
import type { ImportResult } from '@/types'

export async function importAnkiFile(
  deckId: string,
  fileContent: string
): Promise<ImportResult> {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  // Verify deck ownership
  const deck = await prisma.deck.findFirst({
    where: { id: deckId, userId: session.user.id },
  })
  if (!deck) throw new Error('Deck not found')

  const parsed = parseAnkiFile(fileContent)
  
  let success = 0
  let failed = 0
  const errors: string[] = []

  for (const card of parsed.cards) {
    try {
      await prisma.card.create({
        data: {
          front: card.front,
          back: card.back,
          tags: card.tags,
          deckId,
        },
      })
      success++
    } catch (e) {
      failed++
      errors.push(`Failed to import: "${card.front.slice(0, 30)}..."`)
    }
  }

  revalidatePath(`/deck/${deckId}`)
  
  return { success, failed, errors }
}
```

---

## Phase 6: SRS Engine

### 6.1 SRS Algorithm (`src/lib/srs.ts`)

```typescript
import type { CardProgress } from '@prisma/client'
import type { Grade } from '@/types'

interface SRSResult {
  interval: number
  easeFactor: number
  repetitions: number
  dueDate: Date
  lapses: number
}

export function calculateNextReview(
  progress: CardProgress | null,
  grade: Grade
): SRSResult {
  let interval = progress?.interval ?? 0
  let easeFactor = progress?.easeFactor ?? 2.5
  let repetitions = progress?.repetitions ?? 0
  let lapses = progress?.lapses ?? 0

  if (grade === 0) {
    // Again - reset
    lapses += 1
    interval = 1
    repetitions = 0
    easeFactor = Math.max(1.3, easeFactor - 0.2)
  } else {
    // Hard, Good, or Easy
    if (repetitions === 0) {
      interval = grade === 3 ? 4 : 1
    } else if (repetitions === 1) {
      interval = grade === 3 ? 6 : 3
    } else {
      const multiplier = 
        grade === 1 ? 1.2 : 
        grade === 2 ? easeFactor : 
        easeFactor * 1.3
      interval = Math.round(interval * multiplier)
    }
    
    easeFactor = Math.max(
      1.3,
      easeFactor + (0.1 - (3 - grade) * (0.08 + (3 - grade) * 0.02))
    )
    repetitions += 1
  }

  const dueDate = new Date(Date.now() + interval * 24 * 60 * 60 * 1000)

  return { interval, easeFactor, repetitions, dueDate, lapses }
}

export function getNextIntervalPreview(
  progress: CardProgress | null,
  grade: Grade
): string {
  const result = calculateNextReview(progress, grade)
  if (result.interval === 0) return '<1d'
  if (result.interval === 1) return '1d'
  if (result.interval < 30) return `${result.interval}d`
  if (result.interval < 365) return `${Math.round(result.interval / 30)}mo`
  return `${(result.interval / 365).toFixed(1)}y`
}
```

---

## Phase 7: Anki File Parser

### 7.1 Parser Implementation (`src/lib/anki-parser.ts`)

```typescript
import type { AnkiCard } from '@/types'

interface ParseResult {
  cards: AnkiCard[]
  errors: string[]
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
  const cards: AnkiCard[] = []
  const errors: string[] = []
  
  const lines = content.split(/\r?\n/)
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // Skip empty lines and comments
    if (!line || line.startsWith('#')) continue
    
    // Split by tab
    const parts = line.split('\t')
    
    if (parts.length < 2) {
      errors.push(`Line ${i + 1}: Expected at least 2 tab-separated fields`)
      continue
    }
    
    const front = stripHtml(parts[0]).trim()
    const back = stripHtml(parts[1]).trim()
    
    if (!front || !back) {
      errors.push(`Line ${i + 1}: Empty front or back field`)
      continue
    }
    
    // Tags are optional, space-separated in the third field
    const tags = parts[2] 
      ? parts[2].split(/\s+/).filter(Boolean)
      : []
    
    cards.push({ front, back, tags })
  }
  
  return { cards, errors }
}

function stripHtml(str: string): string {
  return str
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .trim()
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
`
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

```
src/components/
├── auth/
│   ├── LoginButton.tsx       # OAuth sign-in button
│   ├── LogoutButton.tsx      # Sign-out button
│   └── UserMenu.tsx          # User avatar dropdown
├── dashboard/
│   ├── DeckCard.tsx          # Deck preview card for dashboard
│   ├── DeckGrid.tsx          # Grid layout of deck cards
│   ├── CreateDeckModal.tsx   # Modal to create new deck
│   └── DashboardStats.tsx    # Overall user statistics
├── deck/
│   ├── CardList.tsx          # List of cards in deck
│   ├── CardRow.tsx           # Single card row
│   ├── AddCardModal.tsx      # Modal to add single card
│   ├── ImportModal.tsx       # Modal for Anki file import
│   ├── DeckHeader.tsx        # Deck title, description, actions
│   └── DeckStats.tsx         # Deck-specific statistics
├── study/
│   ├── FlashCard.tsx         # Flip card component
│   ├── GradeButtons.tsx      # Again/Hard/Good/Easy buttons
│   ├── ProgressBar.tsx       # Session progress indicator
│   ├── SessionComplete.tsx   # End-of-session summary
│   └── StudyHeader.tsx       # Study mode header
├── ui/
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Modal.tsx
│   ├── Input.tsx
│   ├── Textarea.tsx
│   ├── Badge.tsx
│   ├── ProgressRing.tsx
│   ├── Toast.tsx
│   ├── Dropdown.tsx
│   ├── FileUpload.tsx
│   └── Icon.tsx
└── layout/
    ├── Header.tsx            # Top navigation bar
    ├── Sidebar.tsx           # Optional sidebar navigation
    └── Footer.tsx
```

### 8.3 Key Page Implementations

**Dashboard Page (`src/app/(main)/dashboard/page.tsx`)**
```typescript
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getUserDecks } from '@/app/actions/deck'
import { DeckGrid } from '@/components/dashboard/DeckGrid'
import { CreateDeckModal } from '@/components/dashboard/CreateDeckModal'

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const decks = await getUserDecks()

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Decks</h1>
        <CreateDeckModal />
      </div>
      <DeckGrid decks={decks} />
    </div>
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

  if (loading) return <div>Loading...</div>
  if (currentIndex >= cards.length) return <SessionComplete stats={stats} />

  return (
    <div className="max-w-2xl mx-auto py-8">
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
    </div>
  )
}
```

---

## Phase 9: Custom Hooks

### 9.1 Hooks Directory (`src/hooks/`)

```typescript
// useToast.ts
import { useState, useCallback } from 'react'

export function useToast(duration = 3000) {
  const [message, setMessage] = useState<string | null>(null)

  const showToast = useCallback((msg: string) => {
    setMessage(msg)
    setTimeout(() => setMessage(null), duration)
  }, [duration])

  return { message, showToast }
}

// useSessionStats.ts
import { useState, useCallback } from 'react'
import type { SessionStats, Grade } from '@/types'

export function useSessionStats() {
  const [stats, setStats] = useState<SessionStats>({
    reviewed: 0, again: 0, hard: 0, good: 0, easy: 0
  })

  const recordGrade = useCallback((grade: Grade) => {
    setStats(prev => ({
      reviewed: prev.reviewed + 1,
      again: prev.again + (grade === 0 ? 1 : 0),
      hard: prev.hard + (grade === 1 ? 1 : 0),
      good: prev.good + (grade === 2 ? 1 : 0),
      easy: prev.easy + (grade === 3 ? 1 : 0),
    }))
  }, [])

  const reset = useCallback(() => {
    setStats({ reviewed: 0, again: 0, hard: 0, good: 0, easy: 0 })
  }, [])

  return { stats, recordGrade, reset }
}
```

---

## Phase 10: Styling & Theming

### 10.1 Tailwind Configuration (`tailwind.config.ts`)

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          900: '#4c1d95',
        },
        surface: {
          dark: '#0a0a1a',
          card: 'rgba(255,255,255,0.05)',
          border: 'rgba(255,255,255,0.1)',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Times New Roman', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
```

### 10.2 Global Styles (`src/app/globals.css`)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-surface-dark text-white antialiased;
  }
}

@layer components {
  .card-glass {
    @apply bg-surface-card border border-surface-border 
           backdrop-blur-xl rounded-2xl;
  }
  
  .btn-primary {
    @apply bg-gradient-to-r from-brand-600 to-brand-500 
           text-white px-4 py-2 rounded-lg font-semibold
           hover:from-brand-500 hover:to-brand-600 
           transition-all duration-200;
  }
  
  .btn-ghost {
    @apply bg-surface-card border border-surface-border
           text-gray-300 px-4 py-2 rounded-lg
           hover:bg-white/10 transition-colors;
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(124, 58, 237, 0.3);
  border-radius: 999px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(124, 58, 237, 0.5);
}
```

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
import { prisma } from '../src/lib/prisma'
import { BASE_CARDS } from '../src/data/hp-spanish-cards'

async function main() {
  // Create a public "HP Spanish" deck template
  // Or provide as downloadable .txt file in Anki format
}
```

---

## Estimated Effort

| Phase | Time Estimate |
|-------|---------------|
| 1. Project Init | 15 min |
| 2. Database Schema | 30 min |
| 3. Auth Setup | 45 min |
| 4. Type Definitions | 15 min |
| 5. API Routes/Actions | 1.5 hr |
| 6. SRS Engine | 20 min |
| 7. Anki Parser | 30 min |
| 8. Pages & Routes | 2 hr |
| 9. Custom Hooks | 20 min |
| 10. Styling | 1 hr |
| 11. Vercel/DB Setup | 45 min |
| 12. Testing & Deploy | 1 hr |
| **Total** | **~9 hours** |

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
