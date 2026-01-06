---
repo: grocerylist
scan_date: 2026-01-06
status: draft
---

# Vision Document: Grocery List Generator

## Foundation Read

This is a local-first recipe-to-shopping-list converter. Users browse 12 seed recipes, select multiples, adjust serving sizes, and generate a merged grocery list with intelligent deduplication—"2 cloves garlic" from pasta plus "4 cloves garlic" from stir-fry becomes "6 cloves garlic" in the Produce section. The core value delivery happens in that merge: saving the mental arithmetic and category organization that makes shopping trips efficient.

Everything runs client-side with localStorage persistence. Lists export as text, print-ready pages, or shareable URLs with embedded QR codes.

---

## Architecture Snapshot

### Stack
- **Framework:** Next.js 16 (App Router) + React 19
- **Language:** TypeScript 5 (strict mode)
- **Styling:** Tailwind CSS v4
- **Testing:** Vitest + React Testing Library
- **Build:** Next.js bundler, no external backend

### Data
- **Storage:** localStorage with four namespaced keys (selected-recipes, custom-recipes, grocery-list, theme)
- **Seed Data:** 12 recipes in `/data/recipes.json` covering Italian, Asian, Mexican, Indian, American cuisines
- **Key Models:** `Recipe` (id, name, cuisine, tags, servingsBase, ingredients[]) → `GroceryItem` (id, name, quantity, unit, category, checked, sourceRecipes[])

### Patterns
- **Architecture:** Monolithic SPA, no API routes
- **State:** Custom hooks (`useLocalStorage`, `useUndoRedo`) + ThemeContext
- **Core Logic:** 535-line merge engine with synonym mapping (58+ ingredients), unit normalization (14 conversions), and category inference (100+ keywords)
- **Sharing:** Base64-compressed URL params with QR generation via external API

### Gaps
- **No authentication**—anyone with a shared URL sees the list
- **No backend sync**—data trapped in single browser
- **~40% test coverage**—no E2E, no accessibility tests
- **PWA incomplete**—manifest exists but service worker unverified
- **No CI/CD** pipeline visible
- **Import validation minimal**—malformed JSON fails silently

---

## Latent Potential

**The merge engine is overbuilt for its current use case.** The synonym mapping, unit conversion, and category inference could power features far beyond simple list generation—it's essentially a food item normalizer that could standardize any recipe data.

**Category intelligence is embedded but unexposed.** The system knows that "chicken breast" is Meat and "arborio rice" is Pantry. This knowledge graph could drive shopping route optimization, dietary filtering, or cost estimation.

**Recipe metadata exists but isn't leveraged.** Every recipe has cuisine and tags, but there's no "show me all Asian recipes" quick filter or "I made Italian last week, suggest something different" logic.

**The undo/redo system is a full state machine.** It tracks 50 states with proper history—this architecture could power collaborative editing, offline sync queues, or "what changed since I started shopping" comparisons.

**URL sharing is compression-ready.** The base64 encoding pipeline could serialize more than grocery items—full meal plans, shopping history, or household preferences.

---

## Horizon 1: Quick Wins (days)

### 1. Smart Dietary Badges
A user opens the app and immediately sees colored badges on each recipe card: green leaf for vegetarian, wheat-slash for gluten-free, milk-slash for dairy-free. They tap "Vegetarian" in the filter bar and the 12 recipes collapse to 4. When they select Mushroom Risotto, the generated list automatically hides the "Meat" category entirely, and the share preview says "Vegetarian dinner for 4." The badges are computed from the existing ingredient data—no new input required.

### 2. Aisle-Order Mode
Sarah is standing in her grocery store. She taps a new "Store Mode" toggle, and suddenly her list reorders: Produce first (she's near the entrance), then Dairy (back wall), then Pantry (center aisles), then Frozen (last before checkout). As she checks off items, they fade with a satisfying strikethrough and drift to the bottom. The unchecked count shows "7 remaining" in a sticky header. When she finishes, confetti bursts and a "Trip complete!" toast offers to clear the list.

### 3. Portion Calculator Reverse Mode
Tom has 2 lbs of ground beef thawing in the fridge. He taps "I have this ingredient" and types "ground beef, 2 lbs." The app highlights every recipe that uses ground beef and shows how many servings he could make: "Tacos: 8 servings, Spaghetti Bolognese: 6 servings, Stuffed Peppers: 4 servings." He picks Tacos for 8 and the app auto-scales, then shows what else he needs to buy. He's cooking around what he has, not what a recipe demands.

---

## Horizon 2: System Expansions (weeks)

### 1. Household Sync with Conflict Resolution
Maria and her partner both have the app on their phones. She adds "Pad Thai" while he adds "Green Curry" from the living room. Both phones show both recipes within seconds—a tiny avatar appears next to each selection showing who added it. When they generate the list, coconut milk appears once (merged), but a subtle "2 people want this" indicator shows it's critical. At the store, when he checks off "fish sauce," her phone updates live. If they both try to edit the same quantity simultaneously, a gentle modal asks "Keep 2 tbsp (Maria) or 3 tbsp (David)?" No account creation—just a shareable household code.

### 2. Weekly Meal Planner with Auto-List
Sunday morning: Emma opens a new "Week View" showing seven empty dinner slots. She drags Chicken Tikka Masala to Tuesday, Pasta Primavera to Thursday, and Beef Tacos to Saturday. The sidebar immediately shows a consolidated grocery list for all three meals, with a calendar icon next to items indicating which day they're needed. She taps "Optimize" and the list reorders by shelf life—fresh herbs for Tuesday's dish are at the bottom (buy last), canned tomatoes at the top (grab first). One tap exports to her reminders app as a dated shopping task.

### 3. Price Estimation with Store Comparison
Before leaving home, Jake sees his 15-item list with an estimated total: "$47-62 at typical prices." He taps an item—"boneless chicken thighs, 2 lbs"—and sees a tooltip: "~$8 at Costco, ~$12 at Whole Foods (based on crowd-sourced data)." The list offers a "Budget Mode" that suggests substitutions: "Swap pine nuts for sunflower seeds, save ~$6." At the end of his trip, he snaps his receipt; the app OCRs it and updates the local price database, improving estimates for everyone in his area.

---

## Horizon 3: Blue Sky (reframes the product)

### 1. The Anti-Waste Kitchen Companion
The app evolves from "recipe → list" to "inventory → suggestions → list for gaps." Users snap their fridge and pantry with their phone camera; vision AI catalogs what's there with approximate quantities and expiration hints. The app then becomes proactive: "You have spinach wilting and feta expiring Thursday—here's a spanakopita recipe that uses both, and you only need to buy phyllo dough." The shopping list becomes a surgical strike for missing ingredients, not a full restock. Over time, the app learns household consumption patterns: "You usually run out of eggs on Wednesdays. Add to this week's list?" Food waste drops, grocery spending falls, and the fridge becomes a curated inventory rather than a mystery box.

### 2. Community Recipe Remix Network
The app transforms into a living cookbook shaped by its users. When someone imports or creates a recipe, it enters a public remix tree. Maria's "Quick Weeknight Tacos" gets forked by 200 people; 40 of them make variations (ground turkey instead of beef, added black beans, doubled cumin). The app surfaces these as "Popular remixes" when you select her original. Ratings become specific: "crispy" tagged 89 times, "kid-approved" tagged 156 times. You can follow cooks whose remixes match your taste. The merge engine now normalizes across thousands of community recipes, building the most comprehensive ingredient synonym database in existence—which becomes an API other apps pay to access.

---

## Moonshot

**The Conversational Meal Concierge**

Imagine texting your kitchen: "We have guests Saturday, one is vegetarian, one hates cilantro, and I want to impress but not spend all day cooking." The system knows your pantry (from camera scans), your calendar (you're free Saturday afternoon but not morning), your local store's current sales (from a retail data partnership), and your cooking history (you've never tried Indian food but rated all your pasta dishes highly).

It responds: "I suggest a three-course dinner: roasted beet and goat cheese salad (vegetarian, elegant, 20 min prep), mushroom risotto as the main (crowd-pleaser, you have arborio rice already), and chocolate lava cakes for dessert (make-ahead, impress factor: high). Total active time: 2.5 hours with breaks built in. Your guest who hates cilantro is safe—none in any dish. The risotto parmesan is on sale at Trader Joe's this week. Want me to generate the shopping list and block 2-5pm on Saturday for cooking?"

You say "yes," and your phone adds calendar blocks, your grocery list appears organized by the store's actual layout (from crowdsourced aisle data), and a prep timeline shows up Saturday morning with push notifications: "Start risotto stock at 3:00pm."

This isn't a recipe app anymore. It's a personal chef who happens to let you do the fun parts.

---

## Next Move

### Most Promising Idea: Household Sync with Conflict Resolution

**Why this one:** It directly addresses the biggest pain point with the current architecture (data trapped in localStorage) while staying true to the local-first, no-account philosophy. It's technically achievable with WebRTC for peer sync or a lightweight Firebase Realtime Database. The conflict resolution UI is a genuine UX innovation—most list apps either ignore conflicts or last-write-wins. This feature would make the app sticky for couples and families, the exact demographic that meal-plans together.

### First Experiment (< 1 day)

Build a "Share Session" prototype that generates a 6-character room code. When a second device enters the code, they connect via a free WebRTC service (e.g., PeerJS). Implement one-way sync first: Device A's recipe selections broadcast to Device B in real-time. No persistence, no conflict handling—just prove the connection works and feels magical. Test with two browser tabs, then two phones on the same WiFi, then two phones on different networks.

### One Question That Would Sharpen the Vision

**"How many active users are shopping together versus alone?"**

If 80% of trips are solo, double down on the personal assistant angle (inventory tracking, waste reduction, proactive suggestions). If 40%+ involve a partner or household, the collaborative features become the core differentiator. This could be validated with a single modal asking "Are you shopping for yourself or a household?" on first launch, tracked anonymously.

---

*Generated from codebase analysis. Next review recommended after implementing first experiment.*
