import { Ingredient, DietaryBadge } from '@/types';

export type { DietaryBadge };

/**
 * Ingredients that contain meat or fish (non-vegetarian)
 */
export const MEAT_INGREDIENTS: string[] = [
  // Red meat
  'beef', 'ground beef', 'steak', 'roast beef', 'brisket',
  'pork', 'ground pork', 'ham', 'bacon', 'pork chop', 'pork loin',
  'lamb', 'ground lamb', 'lamb chop',
  'veal',
  // Poultry
  'chicken', 'chicken breast', 'chicken thigh', 'chicken wing', 'chicken drumstick',
  'turkey', 'ground turkey', 'duck', 'goose',
  // Fish & seafood
  'fish', 'salmon', 'salmon fillet', 'tuna', 'cod', 'halibut', 'tilapia',
  'trout', 'bass', 'snapper', 'mahi', 'swordfish', 'sardine', 'anchovy',
  'shrimp', 'prawn', 'crab', 'lobster', 'scallop', 'clam', 'mussel',
  'oyster', 'squid', 'calamari', 'octopus',
  // Processed meats
  'sausage', 'salami', 'pepperoni', 'prosciutto', 'pancetta', 'chorizo',
  'hot dog', 'deli meat', 'lunch meat',
  // Meat-based products
  'fish sauce', 'anchovy paste', 'worcestershire sauce', 'oyster sauce',
  'chicken broth', 'chicken stock', 'beef broth', 'beef stock',
  'bone broth', 'gelatin',
];

/**
 * Ingredients that contain gluten
 */
export const GLUTEN_INGREDIENTS: string[] = [
  // Wheat-based
  'flour', 'all-purpose flour', 'bread flour', 'wheat flour', 'whole wheat flour',
  'bread', 'breadcrumb', 'breadcrumbs', 'crouton', 'croutons',
  'pasta', 'spaghetti', 'penne', 'fettuccine', 'linguine', 'rigatoni',
  'macaroni', 'lasagna', 'noodle', 'noodles', 'ramen',
  'tortilla', 'flour tortilla', 'pita', 'naan', 'flatbread',
  'couscous', 'bulgur', 'seitan',
  // Barley/rye
  'barley', 'malt', 'beer',
  // Sauces with gluten
  'soy sauce', 'teriyaki sauce', 'hoisin sauce',
  // Baked goods
  'cake', 'cookie', 'muffin', 'biscuit', 'cracker', 'crackers',
  'panko', 'breading',
];

/**
 * Ingredients that contain dairy
 */
export const DAIRY_INGREDIENTS: string[] = [
  // Milk products
  'milk', 'whole milk', 'skim milk', '2% milk', 'cream', 'heavy cream',
  'whipping cream', 'half and half', 'evaporated milk', 'condensed milk',
  'buttermilk', 'sour cream', 'creme fraiche',
  // Cheese
  'cheese', 'parmesan', 'parmesan cheese', 'cheddar', 'cheddar cheese',
  'mozzarella', 'feta', 'feta cheese', 'gouda', 'brie', 'camembert',
  'gruyere', 'swiss', 'swiss cheese', 'provolone', 'monterey jack',
  'colby', 'american cheese', 'blue cheese', 'gorgonzola', 'ricotta',
  'cottage cheese', 'cream cheese', 'mascarpone', 'queso',
  // Butter & yogurt
  'butter', 'unsalted butter', 'salted butter', 'ghee',
  'yogurt', 'greek yogurt', 'plain yogurt',
  // Other dairy
  'ice cream', 'whey', 'casein',
];

/**
 * Ingredients that contain nuts
 */
export const NUT_INGREDIENTS: string[] = [
  // Tree nuts
  'almond', 'almonds', 'almond butter', 'almond milk', 'almond flour',
  'walnut', 'walnuts',
  'pecan', 'pecans',
  'cashew', 'cashews', 'cashew butter',
  'pistachio', 'pistachios',
  'hazelnut', 'hazelnuts', 'hazelnut butter',
  'macadamia', 'macadamia nut',
  'brazil nut', 'brazil nuts',
  'pine nut', 'pine nuts',
  'chestnut', 'chestnuts',
  // Peanuts (legume but common allergen)
  'peanut', 'peanuts', 'peanut butter', 'peanut oil',
  // Nut-based products
  'nutella', 'praline', 'marzipan', 'nut butter',
];

/**
 * Ingredients that are specifically animal-derived (non-vegan)
 * This includes dairy, eggs, and honey in addition to meat
 */
export const ANIMAL_INGREDIENTS: string[] = [
  ...MEAT_INGREDIENTS,
  ...DAIRY_INGREDIENTS,
  'egg', 'eggs', 'egg yolk', 'egg white', 'mayonnaise', 'mayo',
  'honey',
];

/**
 * Exceptions - ingredients that match a restricted pattern but are actually allowed
 * These are plant-based alternatives that contain words from restricted lists
 */
const DAIRY_EXCEPTIONS: string[] = [
  'coconut milk', 'coconut cream', 'almond milk', 'oat milk', 'soy milk',
  'rice milk', 'cashew milk', 'hemp milk', 'coconut yogurt', 'coconut butter',
  'vegan cheese', 'vegan butter', 'plant milk', 'nut milk',
];

const GLUTEN_EXCEPTIONS: string[] = [
  'rice noodle', 'rice noodles', 'rice paper', 'rice flour',
  'buckwheat noodle', 'buckwheat noodles', 'soba noodles',
  'glass noodle', 'glass noodles', 'cellophane noodles', 'bean thread noodles',
  'kelp noodle', 'kelp noodles', 'zucchini noodle', 'zucchini noodles',
  'shirataki noodles', 'sweet potato noodles',
  'tamari', 'coconut aminos', 'gluten-free soy sauce',
  'corn tortilla', 'corn tortillas',
];

/**
 * Normalizes an ingredient name for comparison
 */
function normalizeForComparison(name: string): string {
  return name.toLowerCase().trim();
}

/**
 * Checks if an ingredient matches any exception in the list
 * Only returns true if the ingredient IS the exception or CONTAINS the exception
 * (e.g., "coconut milk" matches exception "coconut milk", but "milk" alone does not)
 */
function matchesException(ingredientName: string, exceptions: string[]): boolean {
  const normalized = normalizeForComparison(ingredientName);
  return exceptions.some(exception => {
    const normalizedEx = normalizeForComparison(exception);
    // Only match if ingredient equals or contains the exception phrase
    // NOT if the exception contains the ingredient (that would be too broad)
    return normalized === normalizedEx || normalized.includes(normalizedEx);
  });
}

/**
 * Checks if an ingredient matches any item in a list, respecting exceptions
 */
function ingredientMatches(
  ingredientName: string,
  list: string[],
  exceptions: string[] = []
): boolean {
  const normalized = normalizeForComparison(ingredientName);

  // Check exceptions first - if it matches an exception, it's NOT restricted
  if (exceptions.length > 0 && matchesException(ingredientName, exceptions)) {
    return false;
  }

  return list.some(item => {
    const normalizedItem = normalizeForComparison(item);
    // Check for exact match or if ingredient contains the restricted item
    // We only check if the ingredient CONTAINS the item, not the reverse
    // This prevents "salt" from matching "salted butter"
    return normalized === normalizedItem ||
           normalized.includes(normalizedItem);
  });
}

/**
 * Checks if any ingredient in the list matches the restricted ingredients
 */
function hasIngredientFrom(
  ingredients: Ingredient[],
  restrictedList: string[],
  exceptions: string[] = []
): boolean {
  return ingredients.some(ing => ingredientMatches(ing.name, restrictedList, exceptions));
}

/**
 * Detects dietary badges for a recipe based on its ingredients
 *
 * @param ingredients - Array of ingredients to analyze
 * @returns Array of applicable dietary badges
 */
export function detectDietaryBadges(ingredients: Ingredient[]): DietaryBadge[] {
  const badges: DietaryBadge[] = [];

  const hasMeat = hasIngredientFrom(ingredients, MEAT_INGREDIENTS);
  const hasDairy = hasIngredientFrom(ingredients, DAIRY_INGREDIENTS, DAIRY_EXCEPTIONS);
  const hasGluten = hasIngredientFrom(ingredients, GLUTEN_INGREDIENTS, GLUTEN_EXCEPTIONS);
  const hasNuts = hasIngredientFrom(ingredients, NUT_INGREDIENTS);

  // For animal ingredients, we need to check dairy with exceptions
  // We manually combine the checks since ANIMAL_INGREDIENTS includes DAIRY_INGREDIENTS
  const hasAnimalDairy = hasIngredientFrom(ingredients, DAIRY_INGREDIENTS, DAIRY_EXCEPTIONS);
  const hasAnimalMeat = hasIngredientFrom(ingredients, MEAT_INGREDIENTS);
  const hasEggsOrHoney = hasIngredientFrom(ingredients, ['egg', 'eggs', 'egg yolk', 'egg white', 'mayonnaise', 'mayo', 'honey']);
  const hasAnimal = hasAnimalDairy || hasAnimalMeat || hasEggsOrHoney;

  // Vegetarian: no meat/fish
  if (!hasMeat) {
    badges.push('vegetarian');
  }

  // Vegan: no animal products at all
  if (!hasAnimal) {
    badges.push('vegan');
  }

  // Gluten-free: no gluten-containing ingredients
  if (!hasGluten) {
    badges.push('gluten-free');
  }

  // Dairy-free: no dairy products
  if (!hasDairy) {
    badges.push('dairy-free');
  }

  // Nut-free: no nuts
  if (!hasNuts) {
    badges.push('nut-free');
  }

  return badges;
}

/**
 * Configuration for badge display
 * Updated to use Fresh Market design system colors
 */
export const BADGE_CONFIG: Record<DietaryBadge, { label: string; color: string; icon: string; customStyle?: Record<string, string> }> = {
  'vegetarian': {
    label: 'Vegetarian',
    color: 'badge-vegetarian',
    icon: '🌿',
    customStyle: {
      background: 'rgba(107, 143, 113, 0.12)',
      color: 'var(--color-sage-dark)',
      borderColor: 'var(--color-sage-light)',
    },
  },
  'vegan': {
    label: 'Vegan',
    color: 'badge-vegan',
    icon: '🌱',
    customStyle: {
      background: 'rgba(82, 200, 147, 0.12)',
      color: 'var(--color-mint)',
      borderColor: 'var(--color-mint)',
    },
  },
  'gluten-free': {
    label: 'Gluten-Free',
    color: 'badge-gluten-free',
    icon: '🌾',
    customStyle: {
      background: 'rgba(244, 184, 96, 0.12)',
      color: 'var(--color-honey-dark)',
      borderColor: 'var(--color-honey)',
    },
  },
  'dairy-free': {
    label: 'Dairy-Free',
    color: 'badge-dairy-free',
    icon: '🥛',
    customStyle: {
      background: 'rgba(138, 170, 143, 0.12)',
      color: 'var(--color-sage)',
      borderColor: 'var(--color-sage-light)',
    },
  },
  'nut-free': {
    label: 'Nut-Free',
    color: 'badge-nut-free',
    icon: '🥜',
    customStyle: {
      background: 'rgba(217, 119, 87, 0.12)',
      color: 'var(--color-terracotta-dark)',
      borderColor: 'var(--color-terracotta)',
    },
  },
};

/**
 * Gets display-friendly badge information
 */
export function getBadgeInfo(badge: DietaryBadge) {
  return BADGE_CONFIG[badge];
}
