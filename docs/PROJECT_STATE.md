# Project State - Grocery List Generator

> Source of truth for autonomous development cycles.
> Updated by AI after each work session. Human edits welcome for priorities and blockers.

## What's Next

1. [ ] Add PWA offline support (implement service worker to complement existing manifest.json)
2. [ ] Add recipe import/export validation to prevent malformed JSON
3. [ ] Implement portion calculator reverse mode (search by ingredient you have)
4. [ ] Add household sync with conflict resolution
5. [ ] Build weekly meal planner with calendar integration

## What's Done

### Horizon 1 Features (Completed)
- Smart dietary badges with auto-detection (vegetarian, vegan, gluten-free, dairy-free, nut-free)
- Dietary filtering in recipe list
- Store mode with category reordering by store layout
- Shopping progress tracker with sticky header
- Completion celebration with confetti animation
- Dark mode with system-aware theme and manual override
- Theme persistence across sessions

### Core Features (Completed)
- 12 seed recipes across various cuisines
- Recipe selection with search and filter
- Servings adjustment with quantity scaling
- Smart ingredient merging with synonym mapping (58+ ingredients)
- Unit normalization (14 conversions)
- Category grouping (7 categories)
- Editable list with inline editing
- Checkboxes with localStorage persistence
- Export options (copy, download, print)
- Mobile-friendly responsive design
- E2E test coverage (Playwright)
- Unit test coverage (Vitest)

## Blocked

_No blockers._

## Backlog

### Horizon 2 - System Expansions
- Household sync with conflict resolution (WebRTC or Firebase)
- Weekly meal planner with drag-and-drop calendar
- Price estimation with store comparison and budget mode
- Receipt OCR for price data contribution

### Horizon 3 - Blue Sky
- Anti-waste kitchen companion with inventory tracking
- Community recipe remix network
- Conversational meal concierge with AI

### Technical Debt
- Improve test coverage (currently ~40%, target 80%+)
- Add accessibility tests
- Set up CI/CD pipeline
- Enhance error handling for edge cases

## Project Context

**Tech Stack**: Next.js 16.1 (App Router), React 19, TypeScript 5, Tailwind CSS v4
**Key Patterns**: Local-first architecture, localStorage persistence, custom hooks, App Router
**Test Command**: `npm test` (unit), `npm run test:e2e` (E2E)
**Build Command**: `npm run build`
**Deploy**: Vercel auto-deploy on push to main

**Vision**: "A local-first web app that transforms recipe selections into smart grocery lists with intelligent merging, dietary filtering, and store-optimized shopping flows - all running client-side with zero backend dependencies."
