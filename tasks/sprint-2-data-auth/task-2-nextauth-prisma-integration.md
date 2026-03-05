# Task 2: NextAuth + Prisma Integration

## Priority

`P0`

## Objective

Configure Auth.js v5 with Prisma adapter and OAuth providers, then guard protected app routes.

## Inputs

- `architecture.md` auth surface
- Environment variable requirements in project setup

## Implementation Steps

1. Implement `src/lib/auth.ts` with Prisma adapter and providers (Google/GitHub).
2. Add `session` callback to include `user.id` in session payload.
3. Create auth route handler at `/api/auth/[...nextauth]`.
4. Add middleware matcher to protect dashboard/deck/study routes while leaving login/auth callbacks public.
5. Ensure server utilities can read stable authenticated identity (`session.user.id`) for ownership checks.
6. Validate local sign-in/sign-out and protected-route redirects.

## Acceptance Criteria

- OAuth login works in local environment.
- Protected routes require authenticated session.
- Session object includes stable user identifier for ownership checks.
- Auth route and middleware behavior are consistent for App Router route groups.

## Dependencies

- Task 1 (schema and Prisma client available)

## Estimate

5–7 hours

## Validation Checklist

- Unauthenticated access to dashboard/deck/study redirects to login
- Authenticated user can access protected route groups
- Session payload includes non-null `user.id`
