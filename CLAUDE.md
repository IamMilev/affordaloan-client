# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js 15 (App Router, Turbopack) + React 19 + TypeScript frontend for a Bulgarian loan affordability calculator. Communicates with a Go backend on port 8080 via Next.js API route proxies (`app/api/stats/route.ts`).

## Commands

```bash
pnpm dev          # Dev server with Turbopack (port 3000)
pnpm build        # Production build
pnpm lint         # Lint with Biome
pnpm format       # Format with Biome (--write)
```

## Architecture

- **Multi-step wizard** (3 steps) orchestrated by `components/LoanCalculatorFlow/`
- Server component (`app/page.tsx`) fetches interest rate stats at request time, passes them to the client-side wizard
- One-component-per-directory pattern in `components/`
- Styling: Tailwind CSS v4, icons: lucide-react
- Linting/formatting: Biome (not ESLint/Prettier)
- Path alias: `@/*` maps to project root
- Types split into `types/loan.ts` and `types/api.ts`
