# Grocery List Generator

<!-- SB:APP
name: Grocery List Generator
slug: grocery-list-generator
type: web
health: green
owner: Grif
last_verified: 2026-01-06
-->

A local-first web app that generates consolidated grocery lists from selected recipes. Built with Next.js (App Router), TypeScript, and Tailwind CSS.

<!-- SB:SECTION:STATUS -->
## Status

**Active and functional.** App is fully operational with recipe selection, ingredient merging, export features, dietary filtering, store mode, dark mode, and E2E test coverage.
<!-- SB:SECTION:STATUS:END -->

<!-- SB:SECTION:HOW_TO_RUN -->
## How to Run

### Prerequisites
- Node.js 18.17 or later
- npm

### Install
```bash
npm install
```

### Development
```bash
npm run dev
```
Open http://localhost:3000

### Test
```bash
# Unit tests
npm test          # watch mode
npm run test:run  # single run

# E2E tests
npm run test:e2e           # run E2E tests
npm run test:e2e:ui        # run E2E tests with UI
npm run test:e2e:headed    # run E2E tests in headed mode
```

### Build
```bash
npm run build
npm start
```

### Lint
```bash
npm run lint
```
<!-- SB:SECTION:HOW_TO_RUN:END -->

<!-- SB:SECTION:ENV -->
## Environment Variables

UNKNOWN - No .env files or environment variable references found in the codebase. App uses localStorage only.
<!-- SB:SECTION:ENV:END -->

<!-- SB:SECTION:ENTRY_POINTS -->
## Entry Points

| Route | Description |
|-------|-------------|
| `/` | Main app - recipe selection and grocery list generation |
| `/print` | Print-friendly view of the current grocery list |
<!-- SB:SECTION:ENTRY_POINTS:END -->

<!-- SB:SECTION:NEXT_UPGRADES -->
## Next Upgrades

1. Add PWA offline support (manifest.json exists but service worker needs implementation)
2. Add recipe import/export validation to prevent malformed JSON
3. Implement portion calculator reverse mode (search by ingredient you have)
4. Add household sync with conflict resolution
5. Build weekly meal planner with calendar integration
<!-- SB:SECTION:NEXT_UPGRADES:END -->

## Features

### Core Functionality
- **Recipe Library**: 12 seed recipes across various cuisines (Italian, Asian, Mexican, etc.)
- **Recipe Selection**: Search and filter recipes by name, cuisine, or tags
- **Servings Adjustment**: Scale ingredient quantities based on desired servings
- **Smart Merging**: Combines identical ingredients across recipes, with quantity scaling
- **Ingredient Normalization**: Handles synonyms (scallions -> green onion) and unit variations (tablespoon -> tbsp)
- **Category Grouping**: Items organized by category (Produce, Meat, Dairy, Pantry, Frozen, Spices, Other)
- **Editable List**: Edit item names, quantities, units, and categories inline
- **Checkboxes**: Track items as you shop (persisted to localStorage)
- **Export Options**: Copy to clipboard, download as .txt, or print-friendly view
- **Local Persistence**: All data saved to localStorage (no server required)
- **Mobile Friendly**: Responsive design with drawer UI on mobile

### Smart Features (Horizon 1)
- **Dietary Badges**: Auto-detected badges (vegetarian, vegan, gluten-free, dairy-free, nut-free) on recipe cards
- **Dietary Filtering**: Filter recipes by dietary restrictions with one tap
- **Store Mode**: Reorder grocery list by typical store layout for efficient shopping
- **Shopping Progress**: Sticky progress header showing remaining items and visual progress bar
- **Completion Celebration**: Confetti animation when all items are checked off in store mode
- **Dark Mode**: System-aware theme with manual override (light/dark/system)
- **Theme Persistence**: Theme preference saved across sessions

## Project Structure

```
grocerylist/
├── data/
│   └── recipes.json          # Seed recipe data (12 recipes)
├── e2e/
│   └── grocery-list.spec.ts  # E2E tests (Playwright)
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main app page
│   │   ├── print/page.tsx    # Print-friendly view
│   │   ├── layout.tsx        # Root layout
│   │   ├── providers.tsx     # Context providers (Theme)
│   │   └── globals.css       # Global styles
│   ├── components/
│   │   ├── RecipeCard.tsx        # Recipe card with dietary badges
│   │   ├── RecipeList.tsx        # Searchable recipe list with filters
│   │   ├── SelectedRecipes.tsx   # Selected recipes panel
│   │   ├── GroceryList.tsx       # Grocery list with editing & store mode
│   │   ├── DietaryBadge.tsx      # Dietary restriction badges
│   │   ├── StoreModeToggle.tsx   # Store mode toggle component
│   │   └── ThemeToggle.tsx       # Dark mode toggle
│   ├── contexts/
│   │   └── ThemeContext.tsx      # Theme provider and hook
│   ├── hooks/
│   │   └── useLocalStorage.ts    # localStorage hook
│   ├── lib/
│   │   ├── merge-engine.ts       # Core merge/normalize logic
│   │   ├── merge-engine.test.ts  # Unit tests
│   │   ├── dietary-utils.ts      # Dietary badge detection
│   │   ├── dietary-utils.test.ts # Dietary tests
│   │   ├── store-mode.ts         # Store layout ordering
│   │   └── store-mode.test.ts    # Store mode tests
│   └── types/
│       └── index.ts              # TypeScript types
├── playwright.config.ts      # E2E test configuration
└── vitest.config.ts          # Unit test configuration
```

## How It Works

### Basic Workflow
1. **Select Recipes**: Browse the recipe library, search by name/cuisine/tags, and click to select
2. **Filter (Optional)**: Use dietary filters (vegetarian, vegan, gluten-free, etc.) to find suitable recipes
3. **Adjust Servings**: Modify the serving count for each selected recipe
4. **Generate List**: Click "Generate Grocery List" to merge all ingredients
5. **Shop**: Check off items as you shop, edit quantities, or add custom items
6. **Export**: Copy, download, or print your list

### Store Mode
1. **Enable Store Mode**: Toggle the "Store Mode" switch on the grocery list
2. **Optimized Order**: Items automatically reorder to match typical grocery store layout (Produce → Dairy → Meat → Frozen → Pantry → Spices)
3. **Track Progress**: Sticky header shows remaining items and progress bar
4. **Celebrate**: Complete all items to see the confetti celebration

### Dark Mode
- Click the theme toggle in the header to switch between light, dark, and system themes
- Theme preference is saved and persists across sessions

## Ingredient Merging Logic

The merge engine:
- Normalizes ingredient names (lowercase, trim, apply synonyms)
- Normalizes units (tablespoon -> tbsp, grams -> g, etc.)
- Scales quantities by serving ratio
- Merges items with matching name + unit
- Keeps items with different units separate (doesn't convert between unit systems)
- Rounds quantities appropriately (whole numbers for g/oz, quarter increments for cups/tbsp)

## Dietary Badge Detection

The dietary detection system automatically analyzes recipe ingredients to identify dietary attributes:
- **Vegetarian**: No meat, poultry, fish, or seafood
- **Vegan**: Vegetarian + no dairy, eggs, or honey
- **Gluten-Free**: No wheat, flour, bread, pasta, or gluten-containing ingredients
- **Dairy-Free**: No milk, cheese, butter, cream, or yogurt
- **Nut-Free**: No peanuts, almonds, walnuts, cashews, or other tree nuts

Badges are computed dynamically from ingredient data, not hardcoded per recipe, ensuring accuracy even when ingredients are modified.

## Tech Stack

- **Framework**: Next.js 16.1 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4
- **UI**: React 19
- **Testing**:
  - Unit Tests: Vitest 4 + Testing Library
  - E2E Tests: Playwright 1.58
- **Data Storage**: localStorage (no backend required)

## Testing

### Unit Tests
The project uses Vitest for unit testing core business logic:
- `src/lib/merge-engine.test.ts` - Tests for ingredient merging and normalization
- `src/lib/dietary-utils.test.ts` - Tests for dietary badge detection
- `src/lib/store-mode.test.ts` - Tests for store layout ordering

Run tests with `npm test` (watch mode) or `npm run test:run` (single run).

### E2E Tests
Playwright tests cover the main user workflows:
- Recipe selection and browsing
- Grocery list generation
- Item checking and persistence
- Servings adjustment
- Mobile/desktop responsive behavior

Run E2E tests with `npm run test:e2e` or `npm run test:e2e:ui` for the interactive UI.

## Additional Documentation

- [VISION.md](docs/VISION.md) - Product vision and future directions
- [TASKS.md](docs/TASKS.md) - Detailed task breakdown across 3 horizons
- [WORK_LOG.md](docs/WORK_LOG.md) - Development history and decisions
- [PORTFOLIO.md](docs/PORTFOLIO.md) - Portfolio-ready project summary
