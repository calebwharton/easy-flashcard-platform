# Project Map

## 200-Word Summary

This documentation system decomposes the original single-plan specification into focused modules so humans and AI agents can work with smaller, cleaner context windows. The app itself is a Next.js 14+ flashcard platform for language learning with multi-user accounts, deck management, card authoring, study sessions, and spaced repetition scheduling. Authentication is handled through Auth.js (NextAuth v5) with Google and GitHub providers, while PostgreSQL plus Prisma provides relational storage for users, decks, cards, and per-user learning progress. The study workflow prioritizes cognitive calm: a centered flashcard, minimal distraction, and a reveal-then-grade loop that updates SRS state and schedules the next due date. Import support accepts Anki-style TSV text so learners can bulk-load existing material. Styling is tokenized with Tailwind + shadcn primitives and follows a low-stimulation visual language inspired by Medium’s width discipline and Notion’s subdued structure. The new structure separates style rules, architecture decisions, runtime logic, and execution backlog into independent files, enabling parallel implementation streams (UI, backend, algorithm, and delivery). Each sprint and task now has its own markdown file, improving ownership boundaries, reducing merge conflict risk, and making milestone tracking explicit from MVP build through deployment hardening.

## Core Tech Stack

- Framework: Next.js 14+ (App Router)
- Language: TypeScript
- Styling: Tailwind CSS + shadcn/ui
- Database: PostgreSQL (Neon or Vercel Postgres)
- ORM: Prisma
- Auth: Auth.js / NextAuth v5 with Prisma adapter
- Deployment: Vercel
- Import Parsing: Custom Anki TSV/TXT parser

## File Map

- `map.md`: Index, summary, stack, and navigation guide for all docs.
- `styles.md`: Visual design system, color tokens, typography, spacing, interaction, and accessibility rules.
- `architecture.md`: Technical setup, folder layout, schema model, API surface, and infra/deployment setup.
- `logic.md`: Functional behavior for SRS math, study flow, card flip mechanics, and state model.
- `tasks.md`: Prioritized backlog index with sprint roadmap and links to sprint/task documents.
- `tasks/sprint-1-core-ui/`: Sprint scope and detailed tasks for base UI and design token implementation.
- `tasks/sprint-2-data-auth/`: Sprint scope and detailed tasks for schema, auth, and deck/card actions.
- `tasks/sprint-3-study-srs/`: Sprint scope and detailed tasks for SRS engine and study runtime.
- `tasks/sprint-4-import-release/`: Sprint scope and detailed tasks for import, QA, and deployment readiness.
