---
project: Grocery List Generator
generated: 2026-01-24
status: draft
---

# Grocery List Generator Vision

## Design System: "Fresh Market"

**Updated:** 2026-01-25

The application now features a cohesive design system called "Fresh Market" that reflects the product's warm, approachable personality for home cooks and families.

### Design Philosophy

- **Warmth over sterility**: Soft, natural colors inspired by fresh ingredients
- **Clarity in action**: High contrast for interactive elements and shopping mode
- **Tactile feedback**: Rounded corners and subtle shadows that feel touchable
- **Progressive disclosure**: Information revealed when needed, not overwhelming

### Color Palette

**Brand Colors:**
- **Sage Green** (#6B8F71): Primary color representing fresh produce and calm efficiency
- **Terracotta** (#D97757): Secondary color for warmth and home cooking
- **Honey Gold** (#F4B860): Accent color for cheerful highlights
- **Fresh Mint** (#52C893): Success state for shopping mode completion

**Neutral Palette:**
- Warm grays (#F9F7F4 to #1C1A16) with slight beige tint for comfortable reading
- Designed for both light and dark modes with adjusted brightness

**Semantic Colors:**
- Dietary badges use the brand palette for consistency
- Interactive elements use sage green for primary actions
- Terracotta for destructive or warning actions

### Typography

- **Headings**: Inter font family (modern, readable, friendly)
- **Body**: System fonts for optimal performance
- **Scale**: 14px base with clear hierarchy
- **Weight**: Medium (500) for buttons, Semibold (600) for headings

### Spacing & Layout

- Consistent spacing scale: xs (0.25rem) to 2xl (3rem)
- Border radius: sm (0.375rem) to full (9999px) for pill shapes
- Shadows: Four-level system from subtle (sm) to prominent (xl)
- Card-based layout with soft shadows and gentle hover states

### Component Patterns

**Cards**: Rounded corners (0.75-1rem), subtle borders, hover lift effect
**Buttons**: Three variants (primary sage, secondary terracotta, ghost neutral)
**Badges**: Pill-shaped with icon + label, color-coded by category
**Progress**: Gradient backgrounds with smooth animations
**Forms**: Clean inputs with focus states matching brand colors

### Accessibility

- WCAG AA compliant color contrasts
- Focus states with 2px sage outline
- Skip navigation link for keyboard users
- Touch targets 44x44px minimum on mobile
- Screen reader support throughout

## What It Is

A local-first web app that transforms recipe selections into smart grocery lists with intelligent merging, dietary filtering, and store-optimized shopping flows. Users browse recipes, adjust servings, and generate consolidated shopping lists where ingredients are automatically combined ("2 cloves garlic" + "4 cloves garlic" = "6 cloves garlic"). Everything runs client-side with localStorage persistence - no backend required.

## Architecture

- **Stack:** Next.js 16.1 (App Router), React 19, TypeScript 5, Tailwind CSS v4
- **Data:** localStorage-based (4 keys: selected-recipes, custom-recipes, grocery-list, theme)
- **Key patterns:** Local-first SPA, custom hooks (useLocalStorage, useUndoRedo), ThemeContext
- **Merge engine:** 535 lines with synonym mapping (58+ ingredients), unit normalization (14 conversions), category inference (100+ keywords)

## Current State

- **Working:** Recipe selection, ingredient merging, dietary badges, store mode, dark mode, export features, E2E tests
- **Broken/Missing:** PWA service worker not implemented, import validation minimal, ~40% test coverage
- **Tech debt:** No CI/CD pipeline, no accessibility tests, malformed JSON import fails silently

## Opportunities

### Quick Wins (< 1 day each)

1. **PWA offline support** - manifest.json exists; implement service worker for offline functionality
2. **Recipe import/export validation** - Add JSON schema validation to prevent malformed data crashes
3. **Portion calculator reverse mode** - Search by ingredient you have to find compatible recipes

### Bigger Moves (multi-day)

1. **Household sync with conflict resolution** - Real-time multi-device sync via WebRTC/Firebase with elegant conflict UI
2. **Weekly meal planner** - Drag-and-drop calendar with consolidated shopping list and shelf-life optimization
3. **Price estimation** - Crowd-sourced pricing with store comparison and budget mode substitutions

## Open Questions

- Should household sync require accounts or stay anonymous with room codes?
- Which sync solution: WebRTC (peer-to-peer) vs Firebase (centralized) vs Supabase?
- Is camera-based inventory tracking (anti-waste feature) too ambitious for local-first architecture?

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
