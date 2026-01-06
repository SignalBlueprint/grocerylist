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

**Active and functional.** App is fully operational with recipe selection, ingredient merging, and export features working. Main risk: no automated E2E tests.
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
npm test          # watch mode
npm run test:run  # single run
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

1. Add E2E tests using Playwright or Cypress
2. Add PWA offline support (manifest.json exists but sw.js needs verification)
3. Add recipe import/export validation to prevent malformed JSON
<!-- SB:SECTION:NEXT_UPGRADES:END -->

## Features

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

## Project Structure

```
grocerylist/
├── data/
│   └── recipes.json          # Seed recipe data (12 recipes)
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main app page
│   │   ├── print/page.tsx    # Print-friendly view
│   │   ├── layout.tsx        # Root layout
│   │   └── globals.css       # Global styles
│   ├── components/
│   │   ├── RecipeCard.tsx    # Recipe card component
│   │   ├── RecipeList.tsx    # Searchable recipe list
│   │   ├── SelectedRecipes.tsx # Selected recipes panel
│   │   └── GroceryList.tsx   # Grocery list with editing
│   ├── hooks/
│   │   └── useLocalStorage.ts # localStorage hook
│   ├── lib/
│   │   ├── merge-engine.ts   # Core merge/normalize logic
│   │   └── merge-engine.test.ts # Unit tests
│   └── types/
│       └── index.ts          # TypeScript types
└── vitest.config.ts          # Test configuration
```

## How It Works

1. **Select Recipes**: Browse the recipe library, search by name/cuisine/tags, and click to select
2. **Adjust Servings**: Modify the serving count for each selected recipe
3. **Generate List**: Click "Generate Grocery List" to merge all ingredients
4. **Shop**: Check off items as you shop, edit quantities, or add custom items
5. **Export**: Copy, download, or print your list

## Ingredient Merging Logic

The merge engine:
- Normalizes ingredient names (lowercase, trim, apply synonyms)
- Normalizes units (tablespoon -> tbsp, grams -> g, etc.)
- Scales quantities by serving ratio
- Merges items with matching name + unit
- Keeps items with different units separate (doesn't convert between unit systems)
- Rounds quantities appropriately (whole numbers for g/oz, quarter increments for cups/tbsp)

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Testing**: Vitest
- **Data Storage**: localStorage (no backend required)
