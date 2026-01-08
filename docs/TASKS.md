---
repo: grocerylist
source: VISION.md
generated: 2026-01-08
status: draft
---

# Tasks: Grocery List Generator

## Overview

This task list implements the vision for evolving the Grocery List Generator from a simple recipe-to-shopping-list converter into a comprehensive meal planning and shopping companion. The application already has a solid foundation with 12 seed recipes, intelligent ingredient merging (synonym mapping, unit normalization, category inference), and local persistence. These tasks extend that foundation across three horizons: quick wins that leverage existing data (dietary badges, store mode, reverse ingredient search), system expansions requiring new infrastructure (household sync, meal planning, price estimation), and blue-sky features that reframe the product entirely (anti-waste companion, community recipe network).

---

## Horizon 1: Quick Wins

### 1. Smart Dietary Badges

**Goal:** Users see colored dietary badges (vegetarian, gluten-free, dairy-free) on recipe cards and can filter recipes by dietary restriction with one tap.

**Tasks:**

- [x] Create dietary detection utility in `src/lib/dietary-utils.ts`
  - [x] Define `DietaryBadge` type: `'vegetarian' | 'vegan' | 'gluten-free' | 'dairy-free' | 'nut-free'`
  - [x] Create `MEAT_INGREDIENTS` constant array (beef, chicken, pork, fish, shrimp, bacon, etc.)
  - [x] Create `GLUTEN_INGREDIENTS` constant array (flour, bread, pasta, soy sauce, etc.)
  - [x] Create `DAIRY_INGREDIENTS` constant array (milk, cheese, butter, cream, yogurt, etc.)
  - [x] Create `NUT_INGREDIENTS` constant array (peanut, almond, walnut, cashew, etc.)
  - [x] Implement `detectDietaryBadges(ingredients: Ingredient[]): DietaryBadge[]` function
  - [x] Write unit tests in `src/lib/dietary-utils.test.ts` covering all badge types

- [x] Update `Recipe` type in `src/types/index.ts`
  - [x] Add optional `dietaryBadges?: DietaryBadge[]` field to Recipe interface

- [x] Create `DietaryBadge` component in `src/components/DietaryBadge.tsx`
  - [x] Design badge with icon + label (green leaf for vegetarian, wheat-slash for gluten-free, etc.)
  - [x] Use Tailwind classes for badge colors: `bg-green-100 text-green-800` for vegetarian, etc.
  - [x] Make badges compact for recipe cards (small icon, optional text)

- [x] Update `RecipeCard` component (`src/components/RecipeCard.tsx`)
  - [x] Import and call `detectDietaryBadges()` for each recipe
  - [x] Display badges below recipe name, before tags
  - [x] Ensure badges don't wrap awkwardly on mobile

- [x] Add dietary filter to `RecipeList` component (`src/components/RecipeList.tsx`)
  - [x] Add `selectedDietary` state for active dietary filter
  - [x] Add dietary filter button row below cuisine filters (use same pill style)
  - [x] Update `filteredRecipes` memo to include dietary badge filtering
  - [x] Show badge count next to filter button (e.g., "Vegetarian (4)")

- [x] Update share preview text to include dietary info
  - [x] Modify `src/lib/share.ts` to include dietary summary in shared list title

- [x] Hide empty categories in GroceryList when all recipes share a dietary restriction
  - [x] If no meat ingredients, auto-collapse or hide "Meat" category header (already implemented by default)

**Acceptance Criteria:**
- Dietary badges appear on all 12 seed recipes
- Vegetable Curry, Mushroom Risotto, Greek Salad show "vegetarian" badge
- Clicking "Vegetarian" filter shows only vegetarian recipes
- Badges compute from ingredient data, not hardcoded per recipe
- All new functions have passing unit tests
- Mobile layout doesn't break with badges displayed

**Estimated Effort:** 4-6 hours

**Dependencies:** None

---

### 2. Aisle-Order Mode (Store Mode)

**Goal:** Users can toggle "Store Mode" which reorders categories by typical grocery store layout, shows a sticky progress header, and provides satisfying checkout feedback.

**Tasks:**

- [x] Define store layout configuration in `src/lib/store-mode.ts`
  - [x] Create `STORE_LAYOUTS` constant with default layout order
  - [x] Default order: `['Produce', 'Dairy', 'Meat', 'Frozen', 'Pantry', 'Spices', 'Other']`
  - [x] Export `reorderByStoreLayout(categories: IngredientCategory[]): IngredientCategory[]`

- [x] Add store mode state to main app (`src/app/page.tsx`)
  - [x] Add `storeMode` boolean state (default: false)
  - [x] Persist store mode preference to localStorage key `grocery-store-mode`

- [x] Create `StoreModeToggle` component in `src/components/StoreModeToggle.tsx`
  - [x] Toggle switch UI with cart/store icon
  - [x] Label: "Store Mode" when off, "Shopping..." when on
  - [x] Visual indicator (pulsing dot or different color) when active

- [x] Update `GroceryList` component (`src/components/GroceryList.tsx`)
  - [x] Accept `storeMode` prop
  - [x] When store mode active, reorder CATEGORIES array using store layout
  - [x] Add sticky header showing "X of Y remaining" with progress bar
  - [x] Animate checked items: strikethrough + fade + drift to bottom of category
  - [x] Add CSS transition: `transition-all duration-300 ease-in-out`

- [x] Implement completion celebration
  - [x] When all items checked in store mode, show confetti animation
  - [x] Create custom Confetti component in `src/components/Confetti.tsx` (CSS-based, no external library)
  - [x] Show "All done! Great shopping trip!" message when complete

- [x] Create sticky progress header component
  - [x] Fixed position at top of grocery list
  - [x] Shows: "[remaining]/[total] items" + visual progress bar
  - [x] Smooth animation as items get checked

- [x] Add store mode to print view (`src/app/print/page.tsx`)
  - [x] Respect store mode ordering when printing
  - [x] Show layout indicator: "Organized for store shopping"

**Acceptance Criteria:**
- Toggle clearly indicates store mode is on/off
- Categories reorder instantly when toggled
- Checked items visually fade and move to bottom
- Progress header stays visible while scrolling
- Confetti fires when last item checked
- Store mode preference persists across sessions
- Print view respects store mode ordering

**Estimated Effort:** 6-8 hours

**Dependencies:** None (can be done in parallel with dietary badges)

---

### 3. Portion Calculator Reverse Mode

**Goal:** Users can input an ingredient they already have (e.g., "2 lbs ground beef") and see which recipes can use it, with automatic serving calculations.

**Tasks:**

- [ ] Create ingredient search utility in `src/lib/ingredient-search.ts`
  - [ ] Define `IngredientMatch` type with `{ recipeId, recipeName, maxServings, ingredientUsed }`
  - [ ] Implement `findRecipesByIngredient(ingredient: string, recipes: Recipe[]): IngredientMatch[]`
  - [ ] Use existing `normalizeIngredientName()` for fuzzy matching
  - [ ] Implement `calculateMaxServings(have: {qty, unit}, need: {qty, unit}, baseServings: number): number`
  - [ ] Use existing unit conversion functions from merge-engine.ts
  - [ ] Write unit tests in `src/lib/ingredient-search.test.ts`

- [ ] Create `IngredientSearchModal` component in `src/components/IngredientSearchModal.tsx`
  - [ ] Modal with input fields: ingredient name, quantity, unit
  - [ ] Autocomplete ingredient names from all recipe ingredients
  - [ ] Unit dropdown with common units (lb, g, cup, item, etc.)
  - [ ] "Find Recipes" button to trigger search

- [ ] Create `IngredientSearchResults` component in `src/components/IngredientSearchResults.tsx`
  - [ ] Display matching recipes as cards
  - [ ] Show: recipe name, max servings possible, ingredient usage
  - [ ] Format: "Tacos: 8 servings (uses 2 lbs ground beef)"
  - [ ] "Select" button to add recipe with calculated servings

- [ ] Add "I have this ingredient" entry point to UI
  - [ ] Add button above recipe list: "🔍 I have an ingredient..."
  - [ ] Opens IngredientSearchModal
  - [ ] Alternatively, add to search bar as mode toggle

- [ ] Implement "What else do I need?" flow
  - [ ] When user selects a recipe from results, auto-set servings
  - [ ] Highlight the "covered" ingredient in the generated grocery list
  - [ ] Show inline note: "You already have: 2 lbs ground beef"

- [ ] Update `GroceryItem` type if needed (`src/types/index.ts`)
  - [ ] Add optional `alreadyHave?: boolean` flag
  - [ ] Add optional `userQuantity?: number` for user-provided amounts

- [ ] Style "already have" items differently in GroceryList
  - [ ] Lighter background, checkmark pre-filled, or strikethrough
  - [ ] Clear visual distinction from items to buy

**Acceptance Criteria:**
- User can search "ground beef" and see Tacos, Spaghetti Bolognese
- Servings calculation is accurate based on unit conversion
- Selecting a recipe from results adds it with correct servings
- "Already have" ingredient appears differently in grocery list
- Search works with ingredient synonyms (scallions -> green onion)
- Unit conversion handles lb to g, cups to tbsp, etc.

**Estimated Effort:** 8-10 hours

**Dependencies:** None

---

## Horizon 2: System Expansions

### 1. Household Sync with Conflict Resolution

**Goal:** Multiple devices can join a shared session using a 6-character code, with real-time recipe selection sync and conflict resolution for simultaneous edits.

**Tasks:**

- [ ] Research and select WebRTC/sync solution
  - [ ] Evaluate PeerJS vs Firebase Realtime Database vs Supabase Realtime
  - [ ] Document decision in `docs/ADR-001-sync-solution.md`
  - [ ] Prefer solution that works without accounts

- [ ] Set up sync infrastructure
  - [ ] Install chosen sync library
  - [ ] Create `src/lib/sync/` directory for sync-related code
  - [ ] Create `src/lib/sync/connection.ts` for connection management
  - [ ] Create `src/lib/sync/messages.ts` for message types

- [ ] Implement room code generation and joining
  - [ ] Create `generateRoomCode(): string` (6 alphanumeric characters)
  - [ ] Create `src/hooks/useRoomSync.ts` hook
  - [ ] Handle room creation (host) vs room joining (guest)
  - [ ] Store active room code in state

- [ ] Create `ShareSessionModal` component in `src/components/ShareSessionModal.tsx`
  - [ ] "Create Session" button generates room code
  - [ ] Display large, copyable room code
  - [ ] QR code for easy mobile joining
  - [ ] "Join Session" input for entering existing code

- [ ] Implement one-way sync (Phase 1)
  - [ ] Broadcast recipe selections from host to guests
  - [ ] Sync `selectedRecipes` array changes
  - [ ] Show connection status indicator
  - [ ] Handle disconnection gracefully

- [ ] Implement two-way sync (Phase 2)
  - [ ] Allow any device to add/remove recipes
  - [ ] Show avatar/initials next to recipes indicating who added them
  - [ ] Sync grocery item check states in real-time

- [ ] Implement conflict resolution UI
  - [ ] Detect when two devices edit same item simultaneously
  - [ ] Show modal: "Keep [value A] (Maria) or [value B] (David)?"
  - [ ] For quantity conflicts, offer "combine" option
  - [ ] Log conflicts for debugging

- [ ] Create `SessionParticipants` component
  - [ ] Show connected users with avatars/initials
  - [ ] Allow setting display name
  - [ ] Indicate who's actively editing

- [ ] Add sync indicators throughout UI
  - [ ] Small sync icon showing connection status
  - [ ] "Last synced: X seconds ago" timestamp
  - [ ] Visual pulse when receiving updates

**New Infrastructure Required:**
- WebRTC signaling server OR Firebase/Supabase project
- Optional: Simple backend for room code registry (can use Firebase)

**Migration Notes:**
- Existing localStorage data remains local to each device
- Sync only works for active sessions, not persistent

**Acceptance Criteria:**
- Two devices can connect using a 6-character code
- Recipe changes sync within 2 seconds
- Grocery item checkboxes sync in real-time
- Conflict modal appears for simultaneous edits
- Works on same WiFi and across networks
- Graceful degradation when connection lost
- No account creation required

**Estimated Effort:** 20-30 hours

**Dependencies:** None, but benefits from Horizon 1 features being complete

---

### 2. Weekly Meal Planner with Auto-List

**Goal:** Users can drag recipes onto a 7-day calendar view, generating a consolidated grocery list with items tagged by which day they're needed.

**Tasks:**

- [ ] Create meal plan data model in `src/types/index.ts`
  - [ ] Define `MealSlot` type: `{ day: DayOfWeek, mealType: 'breakfast' | 'lunch' | 'dinner', recipeId?: string, servings?: number }`
  - [ ] Define `WeeklyPlan` type: `{ weekStartDate: string, slots: MealSlot[] }`

- [ ] Create `src/hooks/useMealPlan.ts` hook
  - [ ] State for weekly plan
  - [ ] `addRecipeToSlot(recipeId, day, mealType)`
  - [ ] `removeRecipeFromSlot(day, mealType)`
  - [ ] `updateServings(day, mealType, servings)`
  - [ ] Persist to localStorage key `grocery-meal-plan`

- [ ] Create `WeekView` component in `src/components/WeekView.tsx`
  - [ ] 7-column grid layout (Mon-Sun)
  - [ ] 3 rows per day (breakfast, lunch, dinner)
  - [ ] Drop zones for drag-and-drop
  - [ ] Responsive: stack days vertically on mobile

- [ ] Implement drag-and-drop for recipes
  - [ ] Install `@dnd-kit/core` and `@dnd-kit/sortable`
  - [ ] Make RecipeCards draggable in planner context
  - [ ] Visual feedback during drag (ghost, drop zone highlight)
  - [ ] Drop onto calendar slot to assign

- [ ] Create `MealSlotCard` component in `src/components/MealSlotCard.tsx`
  - [ ] Compact recipe display within calendar cell
  - [ ] Servings adjustment inline
  - [ ] Remove button (X)
  - [ ] Click to expand/edit

- [ ] Extend grocery list generation for meal plans
  - [ ] Modify `mergeIngredients()` to accept date info
  - [ ] Add `neededBy: string` field to `GroceryItem`
  - [ ] Show calendar icon with day indicator next to items

- [ ] Create "Optimize by shelf life" feature
  - [ ] Define `SHELF_LIFE` map in `src/lib/shelf-life.ts`
  - [ ] Categories: perishable (1-3 days), short (4-7 days), long (7+ days)
  - [ ] "Optimize" button sorts list: long shelf-life first, perishables last

- [ ] Add navigation between week view and list view
  - [ ] New route or tab: `/planner` or in-page toggle
  - [ ] "Generate List for This Week" button
  - [ ] Show week summary: X recipes, Y ingredients

- [ ] Implement calendar export
  - [ ] Generate .ics file with meal prep reminders
  - [ ] Include shopping list as event on Saturday/Sunday
  - [ ] "Add to Calendar" button

**New Infrastructure Required:**
- Drag-and-drop library (@dnd-kit recommended)
- Optional: Date manipulation library (date-fns) if not already included

**Migration Notes:**
- Existing single-list workflow remains default
- Meal planner is additive feature, accessible via new tab

**Acceptance Criteria:**
- Users can drag recipes onto any day/meal slot
- Consolidated list generates from all planned meals
- Items show which day(s) they're needed
- Optimize sorts by shelf life correctly
- Plan persists across sessions
- Works on mobile with touch drag
- Calendar export produces valid .ics file

**Estimated Effort:** 25-35 hours

**Dependencies:** None, but Dietary Badges enhance the planning experience

---

### 3. Price Estimation with Store Comparison

**Goal:** Users see estimated price ranges for their grocery list, with per-item price tooltips and budget-conscious substitution suggestions.

**Tasks:**

- [ ] Design price data model
  - [ ] Create `src/types/price.ts` with `PriceEstimate` type
  - [ ] Fields: `{ ingredientId, lowPrice, highPrice, store?, lastUpdated }`
  - [ ] Create `PriceDatabase` type for local storage

- [ ] Seed initial price data
  - [ ] Create `data/price-estimates.json` with crowd-sourced averages
  - [ ] Cover all ingredients in seed recipes
  - [ ] Include regional variance (low/high range)

- [ ] Create `src/lib/price-engine.ts`
  - [ ] `estimateItemPrice(item: GroceryItem): PriceEstimate`
  - [ ] `estimateListTotal(items: GroceryItem[]): { low: number, high: number }`
  - [ ] Handle unit conversion for price calculation (per lb, per oz, etc.)

- [ ] Add price display to GroceryList component
  - [ ] Show estimated total at top: "$47-62"
  - [ ] Per-item tooltip on hover: "~$8 at Costco, ~$12 at Whole Foods"
  - [ ] Toggle to show/hide prices

- [ ] Create `PriceTooltip` component in `src/components/PriceTooltip.tsx`
  - [ ] Display on hover/tap
  - [ ] Show price range
  - [ ] Show store comparison if data available
  - [ ] "Update price" link for user contribution

- [ ] Implement budget mode with substitutions
  - [ ] Create `src/lib/substitutions.ts`
  - [ ] Define substitution rules: pine nuts -> sunflower seeds, etc.
  - [ ] "Budget Mode" toggle shows cheaper alternatives
  - [ ] Show savings: "Swap pine nuts for sunflower seeds, save ~$6"

- [ ] Create `SubstitutionSuggestion` component
  - [ ] Inline suggestion below expensive items
  - [ ] One-click to apply substitution
  - [ ] Show price difference

- [ ] Build receipt OCR contribution flow
  - [ ] Create `ReceiptUpload` component
  - [ ] Use browser camera API for capture
  - [ ] Integrate OCR service (Tesseract.js for local, or cloud API)
  - [ ] Parse receipt for item prices
  - [ ] Update local price database

- [ ] Aggregate price data
  - [ ] Anonymous submission to improve estimates
  - [ ] Store median prices locally
  - [ ] Show "based on X reports" confidence indicator

**New Infrastructure Required:**
- OCR library (Tesseract.js for client-side) or cloud OCR API
- Optional: Backend service for aggregating crowd-sourced prices
- Price data storage (localStorage initially, could expand to backend)

**Migration Notes:**
- Feature is opt-in, doesn't affect core workflow
- Price data is supplementary, not required

**Acceptance Criteria:**
- Total estimate shown for any generated list
- Hovering an item shows price breakdown
- Budget mode highlights expensive items
- At least 3 substitution rules implemented
- Receipt upload extracts at least item/price pairs
- Prices persist locally for future visits

**Estimated Effort:** 30-40 hours

**Dependencies:** None, but more useful after Household Sync (share budgets)

---

## Horizon 3: Blue Sky

### 1. The Anti-Waste Kitchen Companion

**Goal:** Transform from "recipe -> list" to "inventory -> suggestions -> list for gaps" using camera-based inventory tracking and proactive recipe suggestions.

**Open Questions:**
- Which vision AI to use? (Cloud vs local models)
- How to handle false positives in food recognition?
- What's the privacy story for food photos?
- How accurate can expiration detection be?
- Should we partner with smart fridge manufacturers?

**Proof of Concept Scope:**
- Manual inventory input (no camera)
- Expiration date tracking for 5 common items
- Simple suggestion: "You have X and Y, try recipe Z"
- "Add missing ingredients" button

**Tasks:**

- [ ] Design inventory data model
  - [ ] Create `InventoryItem` type: name, quantity, unit, location, expiresAt, addedAt
  - [ ] Create `src/hooks/useInventory.ts` hook
  - [ ] Persist to localStorage key `grocery-inventory`

- [ ] Create `InventoryManager` component
  - [ ] List view of current inventory
  - [ ] Add/edit/remove items manually
  - [ ] Group by location (fridge, freezer, pantry)
  - [ ] Expiration indicators (green/yellow/red)

- [ ] Implement expiration tracking
  - [ ] Create `src/lib/expiration.ts` with default shelf-life data
  - [ ] Calculate days remaining
  - [ ] Sort by "use soon" priority
  - [ ] Push notification support (PWA)

- [ ] Create recipe suggestion engine
  - [ ] `findRecipesFromInventory(inventory: InventoryItem[], recipes: Recipe[])`
  - [ ] Score by: % ingredients available, expiring ingredients used
  - [ ] Return top 3 suggestions with explanations

- [ ] Build "Suggestions" UI
  - [ ] Card showing suggested recipe
  - [ ] "Why this recipe": lists matching/expiring ingredients
  - [ ] "Missing ingredients" list
  - [ ] One-click to add missing items to grocery list

- [ ] Implement camera inventory capture (Phase 2)
  - [ ] Integrate vision AI API
  - [ ] Capture fridge/pantry photo
  - [ ] Parse detected items with confidence scores
  - [ ] User confirmation/correction flow

- [ ] Add consumption pattern learning
  - [ ] Track when items are checked off grocery list
  - [ ] Predict restock timing
  - [ ] Proactive: "You usually run out of eggs on Wednesdays"

**Acceptance Criteria (MVP):**
- Manual inventory tracking works
- Expiration warnings appear 3 days before
- At least 1 recipe suggestion based on inventory
- Can add missing ingredients to list
- Inventory persists across sessions

**Estimated Effort:** 60-80 hours (MVP), 120+ hours (full vision)

**Dependencies:** Horizon 1 and 2 features recommended first

---

### 2. Community Recipe Remix Network

**Goal:** Users can share, fork, and remix recipes, with version tracking and community ratings on specific attributes.

**Open Questions:**
- User accounts required? (Yes, for attribution)
- Moderation approach for submitted recipes?
- How to handle copyright/attribution?
- Revenue model for API access to ingredient database?

**Proof of Concept Scope:**
- Recipe export as shareable JSON/link
- Recipe import with duplicate detection
- "Fork" button that creates local copy
- No user accounts yet (anonymous sharing)

**Tasks:**

- [ ] Design recipe sharing format
  - [ ] Extend Recipe type with `sourceUrl?`, `forkedFrom?`, `version?`
  - [ ] Create stable recipe ID system (hash-based)
  - [ ] JSON export format with all metadata

- [ ] Build recipe export flow
  - [ ] "Share Recipe" button on custom recipes
  - [ ] Generate shareable link with embedded recipe data
  - [ ] Copy to clipboard

- [ ] Build recipe import flow
  - [ ] Parse imported recipe JSON
  - [ ] Detect duplicates by ingredient/name similarity
  - [ ] Show diff view for near-duplicates
  - [ ] Add to custom recipes

- [ ] Implement forking
  - [ ] "Remix this recipe" button
  - [ ] Creates copy with `forkedFrom` reference
  - [ ] Track modification history

- [ ] Create community backend (Phase 2)
  - [ ] User accounts (OAuth: Google, GitHub)
  - [ ] Recipe submission API
  - [ ] Fork tree visualization
  - [ ] Rating system (tags: "crispy", "kid-approved", etc.)

- [ ] Build browse/discovery UI
  - [ ] "Community Recipes" section
  - [ ] Filter by tags, ratings, cuisine
  - [ ] "Popular remixes" carousel
  - [ ] Follow cooks feature

- [ ] Monetize ingredient API (Phase 3)
  - [ ] Document comprehensive synonym/normalization database
  - [ ] API access for other recipe apps
  - [ ] Usage-based pricing

**Acceptance Criteria (MVP):**
- Can export any custom recipe as link
- Can import recipe from link
- Fork creates linked copy
- Imported recipes integrate with existing workflow

**Estimated Effort:** 40-60 hours (MVP), 200+ hours (full platform)

**Dependencies:** Custom recipe creation feature (already exists in RecipeManager)

---

## Moonshot: The Conversational Meal Concierge

**Vision:** A natural language interface that understands your pantry, calendar, dietary needs, and preferences to suggest complete meal plans with automated shopping lists.

### Phase 1: Foundation (Text Commands)

**Tasks:**

- [ ] Implement command parser
  - [ ] Create `src/lib/command-parser.ts`
  - [ ] Parse: "add [ingredient]", "plan [cuisine] for [day]", "what can I make?"
  - [ ] Return structured command objects

- [ ] Create `CommandBar` component
  - [ ] Text input with autocomplete
  - [ ] Command history (up arrow)
  - [ ] Keyboard shortcuts (Cmd+K to focus)

- [ ] Implement basic commands
  - [ ] "add eggs" -> adds eggs to grocery list
  - [ ] "show vegetarian" -> filters to vegetarian recipes
  - [ ] "plan italian for tuesday" -> opens planner with suggestion

- [ ] Connect to existing features
  - [ ] Commands trigger existing UI actions
  - [ ] Feedback confirms action taken
  - [ ] Undo support for commands

**Estimated Effort:** 15-20 hours

### Phase 2: Core Feature (Context-Aware Suggestions)

**Tasks:**

- [ ] Build context aggregator
  - [ ] Combine: inventory, calendar (if available), past selections, preferences
  - [ ] Create `UserContext` type and `useUserContext` hook
  - [ ] Update context on each interaction

- [ ] Implement suggestion engine
  - [ ] Rule-based suggestions (simpler than AI)
  - [ ] "You made Italian last week, try Asian?"
  - [ ] "You have expiring spinach, how about..."
  - [ ] "Guest coming + vegetarian constraint = ..."

- [ ] Create proactive suggestion UI
  - [ ] Notification banner with suggestion
  - [ ] "Sounds good" / "Not now" / "Never suggest this"
  - [ ] Learn from feedback

- [ ] Add calendar integration
  - [ ] Read-only Google Calendar API
  - [ ] Detect "dinner party", "guests", time-constrained days
  - [ ] Factor into suggestions

**Estimated Effort:** 30-40 hours

### Phase 3: Full Vision (Natural Language + AI)

**Tasks:**

- [ ] Integrate LLM API
  - [ ] OpenAI API or local model
  - [ ] Prompt engineering for meal planning context
  - [ ] Streaming responses for conversational feel

- [ ] Build conversation UI
  - [ ] Chat-style interface
  - [ ] Message history
  - [ ] Structured response cards (recipe suggestions, lists)

- [ ] Implement multi-turn conversation
  - [ ] Remember context across messages
  - [ ] Clarification questions: "How many guests?"
  - [ ] Refinement: "Actually, make it 6 servings"

- [ ] Add voice input
  - [ ] Web Speech API
  - [ ] "Hey Grocery, what should I make tonight?"
  - [ ] Voice feedback for hands-free cooking

- [ ] Build prep timeline feature
  - [ ] Parse recipe steps for timing
  - [ ] Generate schedule: "Start rice at 5:30, chicken at 5:45"
  - [ ] Push notifications for each step

- [ ] Integrate everything
  - [ ] Pantry knowledge
  - [ ] Calendar awareness
  - [ ] Store sale data (if available)
  - [ ] Cooking history
  - [ ] Seamless: question -> plan -> list -> calendar -> notifications

**Estimated Effort:** 80-100 hours

---

## Suggested Starting Point

### Start With: Smart Dietary Badges (Horizon 1.1)

**Why this task first:**

1. **Immediate user value** — Users see badges on first load, no interaction required
2. **Leverages existing data** — All ingredient info exists; pure logic layer
3. **Low risk** — Additive feature, can't break existing functionality
4. **Foundation for filtering** — Enables dietary filtering which is useful for all future features
5. **Quick win** — 4-6 hours to complete, builds momentum
6. **Tests the contribution pattern** — Creates utilities, components, and tests; validates development workflow

**What it unblocks:**
- Dietary filters make the meal planner more useful
- Share preview with dietary info improves sharing value
- Sets pattern for other computed recipe attributes (difficulty, prep time, cost tier)

**First session checklist:**
1. Create `src/lib/dietary-utils.ts` with detection logic
2. Write tests for all badge types
3. Create badge component
4. Add badges to RecipeCard
5. Run `npm run test:run` and `npm run build` to verify

---

*Generated from VISION.md analysis. Review recommended before implementation begins.*
