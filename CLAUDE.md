# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js 15 (App Router, Turbopack) + React 19 + TypeScript frontend for a Bulgarian loan affordability calculator. Communicates with a Go backend via Next.js API route proxies (`app/api/stats/route.ts`, `app/api/save-user/route.ts`).

## Commands

```bash
pnpm dev          # Dev server with Turbopack (port 3000)
pnpm build        # Production build (standalone output)
pnpm test         # Run tests (Vitest)
pnpm test:watch   # Run tests in watch mode
pnpm lint         # Lint with Biome
pnpm format       # Format with Biome (--write)
docker build -t affordaloan-client .  # Build Docker image
```

## Testing

- **Framework**: Vitest + React Testing Library + jsdom
- **Config**: `vitest.config.ts`, setup in `vitest.setup.ts`
- **Convention**: Tests live next to the component they test (e.g. `LoanCalculatorStep2/LoanCalculatorStep2.test.tsx`)
- **After every feature**: run `pnpm test` and ensure all tests pass before considering work complete. Write tests for new functionality.

## Environment Variables

See `.env.example`. Key variable:
- `BACKEND_INTERNAL_URL` — Go backend URL used by server-side API route proxies (default: `http://localhost:8080`)

## Architecture

- **Multi-step wizard** (3 steps) orchestrated by `components/LoanCalculatorFlow/`
- Server component (`app/page.tsx`) fetches interest rate stats at request time, passes them to the client-side wizard
- One-component-per-directory pattern in `components/`
- Styling: Tailwind CSS v4, icons: lucide-react
- Linting/formatting: Biome (not ESLint/Prettier)
- Path alias: `@/*` maps to project root
- Types split into `types/loan.ts` and `types/api.ts`
- **Dockerfile**: multi-stage build (node 20 alpine, pnpm, standalone output)
- `next.config.ts` uses `output: "standalone"` for Docker-friendly builds
