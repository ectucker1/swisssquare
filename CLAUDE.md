# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SwissSquare is a web application for hosting swiss-system tournaments, primarily for Magic the Gathering draft events. It supports bracket generation, match pairings, result submission, and deck data collection for cube designers.

## Tech Stack

- **Framework**: SvelteKit with Svelte 5 (uses runes like `$props()`)
- **Database**: SQLite via better-sqlite3 with Drizzle ORM
- **Build**: Vite with Node adapter for production deployment
- **Testing**: Vitest

## Commands

```sh
npm run dev          # Start development server
npm run build        # Production build
npm run preview      # Preview production build
npm run test         # Run all tests once
npm run test:unit    # Run tests in watch mode
npm run check        # TypeScript and Svelte type checking
npm run lint         # Check formatting (Prettier) and linting (ESLint)
npm run format       # Auto-format code with Prettier
```

### Database Commands

Requires `DATABASE_URL` environment variable (see `.env.example`).

```sh
npm run db:push      # Push schema changes to database
npm run db:generate  # Generate migration files
npm run db:migrate   # Run migrations
npm run db:studio    # Open Drizzle Studio GUI
```

## Architecture

- `src/routes/` - SvelteKit file-based routing
- `src/lib/` - Shared code importable via `$lib`
- `src/lib/server/db/` - Database layer
  - `schema.ts` - Drizzle table definitions
  - `index.ts` - Database connection (server-only)

## Testing

Vitest is configured with `requireAssertions: true` - every test must contain at least one assertion. Tests use the file pattern `*.{test,spec}.{js,ts}`.
