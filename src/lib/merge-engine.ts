import { Ingredient, GroceryItem, IngredientCategory } from '@/types';

// Category detection patterns - keywords mapped to categories
const CATEGORY_PATTERNS: Record<IngredientCategory, string[]> = {
  Produce: [
    'onion', 'garlic', 'tomato', 'potato', 'carrot', 'celery', 'lettuce',
    'spinach', 'kale', 'broccoli', 'cauliflower', 'pepper', 'cucumber',
    'zucchini', 'squash', 'mushroom', 'asparagus', 'green bean', 'pea',
    'corn', 'cabbage', 'brussels', 'artichoke', 'beet', 'radish',
    'turnip', 'parsnip', 'leek', 'shallot', 'ginger', 'lemon', 'lime',
    'orange', 'apple', 'banana', 'grape', 'strawberry', 'blueberry',
    'raspberry', 'blackberry', 'mango', 'pineapple', 'watermelon',
    'cantaloupe', 'honeydew', 'avocado', 'cilantro', 'parsley', 'basil',
    'mint', 'dill', 'thyme', 'rosemary', 'sage', 'oregano', 'chive',
    'scallion', 'green onion', 'spring onion', 'bean sprout', 'bok choy',
    'eggplant', 'fennel', 'okra', 'jalapeno', 'serrano', 'habanero',
    'poblano', 'bell pepper', 'romaine', 'arugula', 'watercress',
    'endive', 'radicchio', 'escarole', 'collard', 'swiss chard',
    'fresh', 'lemon juice', 'lime juice',
  ],
  Meat: [
    'chicken', 'beef', 'pork', 'lamb', 'turkey', 'duck', 'goose',
    'venison', 'bison', 'rabbit', 'veal', 'bacon', 'ham', 'sausage',
    'salami', 'pepperoni', 'prosciutto', 'pancetta', 'chorizo',
    'ground beef', 'ground pork', 'ground turkey', 'ground chicken',
    'steak', 'roast', 'chop', 'rib', 'loin', 'tenderloin', 'brisket',
    'shank', 'shoulder', 'breast', 'thigh', 'drumstick', 'wing',
    'fish', 'salmon', 'tuna', 'cod', 'halibut', 'tilapia', 'trout',
    'bass', 'snapper', 'mahi', 'swordfish', 'shrimp', 'prawn',
    'crab', 'lobster', 'scallop', 'clam', 'mussel', 'oyster',
    'squid', 'calamari', 'octopus', 'anchovy',
  ],
  Dairy: [
    'milk', 'cream', 'butter', 'cheese', 'yogurt', 'sour cream',
    'cream cheese', 'cottage cheese', 'ricotta', 'mozzarella',
    'parmesan', 'cheddar', 'feta', 'gouda', 'brie', 'camembert',
    'gruyere', 'swiss', 'provolone', 'monterey jack', 'colby',
    'american cheese', 'blue cheese', 'gorgonzola', 'mascarpone',
    'half and half', 'heavy cream', 'whipping cream', 'buttermilk',
    'evaporated milk', 'condensed milk', 'egg', 'eggs',
  ],
  Pantry: [
    'flour', 'sugar', 'salt', 'oil', 'vinegar', 'soy sauce',
    'pasta', 'spaghetti', 'penne', 'fettuccine', 'linguine', 'rigatoni',
    'rice', 'quinoa', 'couscous', 'bulgur', 'barley', 'oats',
    'bread', 'crouton', 'breadcrumb', 'tortilla', 'pita', 'naan',
    'bean', 'lentil', 'chickpea', 'black bean', 'kidney bean',
    'cannellini', 'pinto', 'navy bean', 'split pea',
    'tomato paste', 'tomato sauce', 'crushed tomato', 'diced tomato',
    'broth', 'stock', 'bouillon', 'coconut milk', 'coconut cream',
    'peanut butter', 'almond butter', 'tahini', 'honey', 'maple syrup',
    'molasses', 'corn syrup', 'agave', 'jam', 'jelly', 'preserve',
    'mustard', 'ketchup', 'mayo', 'mayonnaise', 'relish', 'pickle',
    'olive', 'caper', 'anchovy paste', 'worcestershire', 'hot sauce',
    'sriracha', 'fish sauce', 'oyster sauce', 'hoisin', 'teriyaki',
    'soy', 'tamari', 'miso', 'sake', 'mirin', 'rice wine',
    'balsamic', 'red wine vinegar', 'white wine vinegar', 'apple cider',
    'nut', 'almond', 'walnut', 'pecan', 'cashew', 'peanut', 'pistachio',
    'seed', 'sesame', 'sunflower', 'pumpkin seed', 'flax', 'chia',
    'cornstarch', 'baking powder', 'baking soda', 'yeast', 'gelatin',
    'vanilla', 'cocoa', 'chocolate', 'chip', 'raisin', 'dried fruit',
    'cereal', 'granola', 'cracker', 'chip', 'pretzel', 'popcorn',
    'taco shell', 'tortilla chip', 'salsa', 'guacamole',
    'brown sugar', 'powdered sugar', 'white sugar', 'cane sugar',
    'vegetable oil', 'canola oil', 'olive oil', 'sesame oil', 'coconut oil',
    'peanut oil', 'avocado oil', 'grapeseed oil', 'sunflower oil',
    'tamarind', 'arborio', 'jasmine rice', 'basmati', 'white wine',
    'red wine', 'marsala', 'sherry',
  ],
  Frozen: [
    'frozen', 'ice cream', 'sorbet', 'gelato', 'popsicle',
    'frozen vegetable', 'frozen fruit', 'frozen berry',
    'frozen pizza', 'frozen dinner', 'frozen meal',
    'frozen pea', 'frozen corn', 'frozen spinach',
    'ice', 'frozen yogurt',
  ],
  Spices: [
    'cumin', 'coriander', 'paprika', 'chili powder', 'cayenne',
    'cinnamon', 'nutmeg', 'clove', 'allspice', 'cardamom', 'ginger powder',
    'turmeric', 'curry', 'garam masala', 'five spice', 'za\'atar',
    'oregano', 'basil', 'thyme', 'rosemary', 'sage', 'marjoram',
    'tarragon', 'dill', 'bay leaf', 'fennel seed', 'caraway',
    'mustard seed', 'celery seed', 'poppy seed', 'sesame seed',
    'black pepper', 'white pepper', 'pink pepper', 'szechuan pepper',
    'red pepper flake', 'crushed red pepper', 'chili flake',
    'garlic powder', 'onion powder', 'smoked paprika', 'ancho',
    'chipotle', 'adobo', 'jerk', 'cajun', 'creole', 'old bay',
    'italian seasoning', 'herbs de provence', 'poultry seasoning',
    'pumpkin pie spice', 'apple pie spice', 'chai spice',
    'vanilla extract', 'almond extract', 'peppermint extract',
    'dried oregano', 'dried basil', 'dried thyme', 'dried dill',
    'dried parsley', 'dried rosemary', 'dried sage', 'dried mint',
    'saffron', 'sumac', 'fenugreek', 'asafoetida', 'nigella',
    'star anise', 'juniper', 'lavender', 'lemongrass',
    'salt', 'kosher salt', 'sea salt', 'flaky salt', 'finishing salt',
    'msg', 'seasoning', 'spice blend', 'rub', 'marinade',
  ],
  Other: [],
};

/**
 * Detects the category of an ingredient based on its name
 */
export function detectCategory(name: string): IngredientCategory {
  const normalizedName = name.toLowerCase().trim();

  // Check each category's patterns
  for (const [category, patterns] of Object.entries(CATEGORY_PATTERNS)) {
    if (category === 'Other') continue;

    for (const pattern of patterns) {
      if (normalizedName.includes(pattern)) {
        return category as IngredientCategory;
      }
    }
  }

  return 'Other';
}

// Synonym map for common ingredient name variations
const SYNONYMS: Record<string, string> = {
  'scallions': 'green onion',
  'scallion': 'green onion',
  'spring onion': 'green onion',
  'spring onions': 'green onion',
  'capsicum': 'bell pepper',
  'bell peppers': 'bell pepper',
  'cilantro': 'coriander',
  'coriander leaves': 'coriander',
  'fresh coriander': 'coriander',
  'garlic clove': 'garlic',
  'garlic cloves': 'garlic',
  'onions': 'onion',
  'tomatoes': 'tomato',
  'carrots': 'carrot',
  'eggs': 'egg',
  'lemons': 'lemon',
  'limes': 'lime',
};

// Unit normalization map
const UNIT_SYNONYMS: Record<string, string> = {
  'tablespoon': 'tbsp',
  'tablespoons': 'tbsp',
  'teaspoon': 'tsp',
  'teaspoons': 'tsp',
  'grams': 'g',
  'gram': 'g',
  'ounces': 'oz',
  'ounce': 'oz',
  'piece': 'item',
  'pieces': 'item',
  'items': 'item',
  'clove': 'clove',
  'cloves': 'clove',
  'cups': 'cup',
  'pounds': 'lb',
  'pound': 'lb',
  'milliliters': 'ml',
  'milliliter': 'ml',
};

/**
 * Normalizes an ingredient name by:
 * - Converting to lowercase
 * - Trimming whitespace
 * - Applying synonym mappings
 */
export function normalizeIngredientName(name: string): string {
  const normalized = name.toLowerCase().trim();
  return SYNONYMS[normalized] || normalized;
}

/**
 * Normalizes a unit string by:
 * - Converting to lowercase
 * - Trimming whitespace
 * - Applying unit synonym mappings
 */
export function normalizeUnit(unit: string): string {
  const normalized = unit.toLowerCase().trim();
  return UNIT_SYNONYMS[normalized] || normalized;
}

/**
 * Scales ingredients based on a serving ratio
 */
export function scaleIngredients(
  ingredients: Ingredient[],
  ratio: number
): Ingredient[] {
  return ingredients.map((ing) => ({
    ...ing,
    quantity: ing.quantity * ratio,
  }));
}

/**
 * Rounds a quantity intelligently based on the unit type:
 * - grams/oz: round to nearest whole
 * - cups/tbsp/tsp: round to nearest 0.25
 * - item: allow halves/quarters (round to 0.25)
 */
export function roundQuantity(quantity: number, unit: string): number {
  const normalizedUnit = normalizeUnit(unit);

  // Units that should round to whole numbers
  const wholeUnits = ['g', 'oz', 'ml'];
  if (wholeUnits.includes(normalizedUnit)) {
    return Math.round(quantity);
  }

  // Units that round to nearest 0.25
  return Math.round(quantity * 4) / 4;
}

/**
 * Creates a unique key for an ingredient based on normalized name and unit
 */
function createIngredientKey(name: string, unit: string): string {
  return `${normalizeIngredientName(name)}|${normalizeUnit(unit)}`;
}

// Unit conversion definitions - conversions within the same measurement system
interface UnitConversion {
  from: string;
  to: string;
  factor: number; // multiply 'from' by this to get 'to'
}

const UNIT_CONVERSIONS: UnitConversion[] = [
  // Volume conversions (US)
  { from: 'tbsp', to: 'tsp', factor: 3 },
  { from: 'cup', to: 'tbsp', factor: 16 },
  { from: 'cup', to: 'tsp', factor: 48 },
  { from: 'cup', to: 'ml', factor: 236.588 },
  { from: 'tbsp', to: 'ml', factor: 14.787 },
  { from: 'tsp', to: 'ml', factor: 4.929 },

  // Weight conversions
  { from: 'lb', to: 'oz', factor: 16 },
  { from: 'lb', to: 'g', factor: 453.592 },
  { from: 'oz', to: 'g', factor: 28.3495 },
  { from: 'kg', to: 'g', factor: 1000 },

  // Liquid volume
  { from: 'l', to: 'ml', factor: 1000 },
  { from: 'qt', to: 'cup', factor: 4 },
  { from: 'pt', to: 'cup', factor: 2 },
  { from: 'gal', to: 'qt', factor: 4 },
  { from: 'gal', to: 'cup', factor: 16 },
];

// Preferred units for display (larger units when possible)
const PREFERRED_UNITS: Record<string, { unit: string; minQuantity: number }[]> = {
  tsp: [
    { unit: 'cup', minQuantity: 48 },
    { unit: 'tbsp', minQuantity: 3 },
  ],
  tbsp: [
    { unit: 'cup', minQuantity: 16 },
  ],
  ml: [
    { unit: 'l', minQuantity: 1000 },
    { unit: 'cup', minQuantity: 236.588 },
  ],
  g: [
    { unit: 'kg', minQuantity: 1000 },
    { unit: 'lb', minQuantity: 453.592 },
  ],
  oz: [
    { unit: 'lb', minQuantity: 16 },
  ],
};

/**
 * Converts a quantity from one unit to another
 */
export function convertUnit(
  quantity: number,
  fromUnit: string,
  toUnit: string
): number | null {
  const from = normalizeUnit(fromUnit);
  const to = normalizeUnit(toUnit);

  if (from === to) return quantity;

  // Direct conversion
  const directConversion = UNIT_CONVERSIONS.find(
    (c) => c.from === from && c.to === to
  );
  if (directConversion) {
    return quantity * directConversion.factor;
  }

  // Reverse conversion
  const reverseConversion = UNIT_CONVERSIONS.find(
    (c) => c.from === to && c.to === from
  );
  if (reverseConversion) {
    return quantity / reverseConversion.factor;
  }

  // Try to find a path through an intermediate unit
  for (const conv1 of UNIT_CONVERSIONS) {
    if (conv1.from === from) {
      const intermediate = conv1.to;
      const conv2 = UNIT_CONVERSIONS.find(
        (c) => (c.from === intermediate && c.to === to) ||
               (c.to === intermediate && c.from === to)
      );
      if (conv2) {
        const intermediateQty = quantity * conv1.factor;
        if (conv2.from === intermediate) {
          return intermediateQty * conv2.factor;
        } else {
          return intermediateQty / conv2.factor;
        }
      }
    }
  }

  return null; // No conversion path found
}

/**
 * Attempts to convert to a more appropriate unit based on quantity
 */
export function optimizeUnit(
  quantity: number,
  unit: string
): { quantity: number; unit: string } {
  const normalizedUnit = normalizeUnit(unit);
  const preferences = PREFERRED_UNITS[normalizedUnit];

  if (!preferences) {
    return { quantity, unit: normalizedUnit };
  }

  for (const pref of preferences) {
    if (quantity >= pref.minQuantity) {
      const converted = convertUnit(quantity, normalizedUnit, pref.unit);
      if (converted !== null) {
        return { quantity: converted, unit: pref.unit };
      }
    }
  }

  return { quantity, unit: normalizedUnit };
}

/**
 * Checks if two units can be merged (are convertible)
 */
export function areUnitsConvertible(unit1: string, unit2: string): boolean {
  const u1 = normalizeUnit(unit1);
  const u2 = normalizeUnit(unit2);

  if (u1 === u2) return true;

  return convertUnit(1, u1, u2) !== null;
}

/**
 * Generates a unique ID for a grocery item
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

interface IngredientWithSource extends Ingredient {
  sourceRecipe: string;
}

/**
 * Merges ingredients from multiple recipes, combining quantities for matching name+unit pairs
 */
export function mergeIngredients(
  ingredientsWithSources: IngredientWithSource[]
): GroceryItem[] {
  const merged = new Map<string, {
    name: string;
    quantity: number;
    unit: string;
    category: IngredientCategory;
    notes: string[];
    sourceRecipes: Set<string>;
  }>();

  for (const ing of ingredientsWithSources) {
    const key = createIngredientKey(ing.name, ing.unit);
    const existing = merged.get(key);

    if (existing) {
      existing.quantity += ing.quantity;
      if (ing.notes && !existing.notes.includes(ing.notes)) {
        existing.notes.push(ing.notes);
      }
      existing.sourceRecipes.add(ing.sourceRecipe);
    } else {
      merged.set(key, {
        name: normalizeIngredientName(ing.name),
        quantity: ing.quantity,
        unit: normalizeUnit(ing.unit),
        category: ing.category || 'Other',
        notes: ing.notes ? [ing.notes] : [],
        sourceRecipes: new Set([ing.sourceRecipe]),
      });
    }
  }

  return Array.from(merged.values()).map((item) => ({
    id: generateId(),
    name: item.name,
    quantity: roundQuantity(item.quantity, item.unit),
    unit: item.unit,
    category: item.category,
    notes: item.notes.length > 0 ? item.notes.join(', ') : undefined,
    checked: false,
    sourceRecipes: Array.from(item.sourceRecipes),
  }));
}

/**
 * Groups grocery items by category
 */
export function groupByCategory(
  items: GroceryItem[]
): Record<IngredientCategory, GroceryItem[]> {
  const categories: IngredientCategory[] = [
    'Produce',
    'Meat',
    'Dairy',
    'Pantry',
    'Frozen',
    'Spices',
    'Other',
  ];

  const grouped: Record<IngredientCategory, GroceryItem[]> = {
    Produce: [],
    Meat: [],
    Dairy: [],
    Pantry: [],
    Frozen: [],
    Spices: [],
    Other: [],
  };

  for (const item of items) {
    const category = categories.includes(item.category)
      ? item.category
      : 'Other';
    grouped[category].push(item);
  }

  // Sort items within each category by name
  for (const category of categories) {
    grouped[category].sort((a, b) => a.name.localeCompare(b.name));
  }

  return grouped;
}

/**
 * Formats a quantity for display, removing unnecessary decimals
 */
export function formatQuantity(quantity: number): string {
  if (quantity === Math.floor(quantity)) {
    return quantity.toString();
  }

  // Handle common fractions
  const fractions: Record<number, string> = {
    0.25: '¼',
    0.5: '½',
    0.75: '¾',
    0.33: '⅓',
    0.67: '⅔',
  };

  const wholePart = Math.floor(quantity);
  const decimalPart = Math.round((quantity - wholePart) * 100) / 100;

  if (fractions[decimalPart]) {
    return wholePart > 0
      ? `${wholePart}${fractions[decimalPart]}`
      : fractions[decimalPart];
  }

  return quantity.toFixed(2).replace(/\.?0+$/, '');
}

/**
 * Formats a grocery item as a text line for export
 */
export function formatGroceryItemText(item: GroceryItem): string {
  const quantity = formatQuantity(item.quantity);
  const notes = item.notes ? ` (${item.notes})` : '';
  return `${quantity} ${item.unit} ${item.name}${notes}`;
}

/**
 * Exports the grocery list as plain text grouped by category
 */
export function exportAsText(
  groupedItems: Record<IngredientCategory, GroceryItem[]>
): string {
  const lines: string[] = [];
  const categories: IngredientCategory[] = [
    'Produce',
    'Meat',
    'Dairy',
    'Pantry',
    'Frozen',
    'Spices',
    'Other',
  ];

  for (const category of categories) {
    const items = groupedItems[category];
    if (items.length > 0) {
      lines.push(`\n== ${category} ==`);
      for (const item of items) {
        const checkbox = item.checked ? '[x]' : '[ ]';
        lines.push(`${checkbox} ${formatGroceryItemText(item)}`);
      }
    }
  }

  return lines.join('\n').trim();
}
