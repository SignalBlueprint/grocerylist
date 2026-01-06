import { describe, it, expect } from 'vitest';
import {
  normalizeIngredientName,
  normalizeUnit,
  scaleIngredients,
  roundQuantity,
  mergeIngredients,
  groupByCategory,
  formatQuantity,
  exportAsText,
} from './merge-engine';
import { Ingredient, GroceryItem } from '@/types';

describe('normalizeIngredientName', () => {
  it('converts to lowercase and trims whitespace', () => {
    expect(normalizeIngredientName('  Yellow Onion  ')).toBe('yellow onion');
  });

  it('applies synonym mappings', () => {
    expect(normalizeIngredientName('scallions')).toBe('green onion');
    expect(normalizeIngredientName('Scallion')).toBe('green onion');
    expect(normalizeIngredientName('capsicum')).toBe('bell pepper');
    expect(normalizeIngredientName('cilantro')).toBe('coriander');
    expect(normalizeIngredientName('garlic clove')).toBe('garlic');
    expect(normalizeIngredientName('garlic cloves')).toBe('garlic');
  });

  it('returns original name when no synonym exists', () => {
    expect(normalizeIngredientName('chicken breast')).toBe('chicken breast');
  });
});

describe('normalizeUnit', () => {
  it('normalizes common unit variations', () => {
    expect(normalizeUnit('tablespoon')).toBe('tbsp');
    expect(normalizeUnit('tablespoons')).toBe('tbsp');
    expect(normalizeUnit('teaspoon')).toBe('tsp');
    expect(normalizeUnit('teaspoons')).toBe('tsp');
    expect(normalizeUnit('grams')).toBe('g');
    expect(normalizeUnit('ounces')).toBe('oz');
    expect(normalizeUnit('piece')).toBe('item');
    expect(normalizeUnit('pieces')).toBe('item');
  });

  it('preserves already normalized units', () => {
    expect(normalizeUnit('tbsp')).toBe('tbsp');
    expect(normalizeUnit('cup')).toBe('cup');
    expect(normalizeUnit('g')).toBe('g');
  });
});

describe('scaleIngredients', () => {
  it('scales quantities by the given ratio', () => {
    const ingredients: Ingredient[] = [
      { name: 'flour', quantity: 2, unit: 'cup', category: 'Pantry' },
      { name: 'sugar', quantity: 1, unit: 'cup', category: 'Pantry' },
    ];

    const scaled = scaleIngredients(ingredients, 2);

    expect(scaled[0].quantity).toBe(4);
    expect(scaled[1].quantity).toBe(2);
  });

  it('handles fractional ratios', () => {
    const ingredients: Ingredient[] = [
      { name: 'salt', quantity: 1, unit: 'tsp', category: 'Spices' },
    ];

    const scaled = scaleIngredients(ingredients, 0.5);

    expect(scaled[0].quantity).toBe(0.5);
  });

  it('preserves other ingredient properties', () => {
    const ingredients: Ingredient[] = [
      { name: 'onion', quantity: 1, unit: 'item', notes: 'diced', category: 'Produce' },
    ];

    const scaled = scaleIngredients(ingredients, 2);

    expect(scaled[0].name).toBe('onion');
    expect(scaled[0].unit).toBe('item');
    expect(scaled[0].notes).toBe('diced');
    expect(scaled[0].category).toBe('Produce');
  });
});

describe('roundQuantity', () => {
  it('rounds grams to nearest whole number', () => {
    expect(roundQuantity(100.4, 'g')).toBe(100);
    expect(roundQuantity(100.6, 'g')).toBe(101);
    expect(roundQuantity(100.5, 'grams')).toBe(101);
  });

  it('rounds ounces to nearest whole number', () => {
    expect(roundQuantity(4.3, 'oz')).toBe(4);
    expect(roundQuantity(4.7, 'oz')).toBe(5);
  });

  it('rounds cups to nearest 0.25', () => {
    expect(roundQuantity(1.1, 'cup')).toBe(1);
    expect(roundQuantity(1.13, 'cup')).toBe(1.25);
    expect(roundQuantity(1.38, 'cup')).toBe(1.5);
    expect(roundQuantity(1.63, 'cup')).toBe(1.75);
    expect(roundQuantity(1.88, 'cup')).toBe(2);
  });

  it('rounds tbsp to nearest 0.25', () => {
    expect(roundQuantity(2.1, 'tbsp')).toBe(2);
    expect(roundQuantity(2.15, 'tbsp')).toBe(2.25);
  });

  it('rounds items to nearest 0.25 (allows halves/quarters)', () => {
    expect(roundQuantity(1.1, 'item')).toBe(1);
    expect(roundQuantity(1.3, 'item')).toBe(1.25);
    expect(roundQuantity(1.5, 'item')).toBe(1.5);
  });
});

describe('mergeIngredients', () => {
  it('merges ingredients with same name and unit', () => {
    const ingredients = [
      { name: 'garlic', quantity: 2, unit: 'clove', category: 'Produce' as const, sourceRecipe: 'recipe1' },
      { name: 'garlic', quantity: 3, unit: 'clove', category: 'Produce' as const, sourceRecipe: 'recipe2' },
    ];

    const merged = mergeIngredients(ingredients);

    expect(merged).toHaveLength(1);
    expect(merged[0].name).toBe('garlic');
    expect(merged[0].quantity).toBe(5);
    expect(merged[0].unit).toBe('clove');
  });

  it('keeps separate lines for different units', () => {
    const ingredients = [
      { name: 'olive oil', quantity: 2, unit: 'tbsp', category: 'Pantry' as const, sourceRecipe: 'recipe1' },
      { name: 'olive oil', quantity: 0.25, unit: 'cup', category: 'Pantry' as const, sourceRecipe: 'recipe2' },
    ];

    const merged = mergeIngredients(ingredients);

    expect(merged).toHaveLength(2);
    expect(merged.find(m => m.unit === 'tbsp')?.quantity).toBe(2);
    expect(merged.find(m => m.unit === 'cup')?.quantity).toBe(0.25);
  });

  it('normalizes ingredient names during merge', () => {
    const ingredients = [
      { name: 'scallions', quantity: 2, unit: 'item', category: 'Produce' as const, sourceRecipe: 'recipe1' },
      { name: 'green onion', quantity: 3, unit: 'item', category: 'Produce' as const, sourceRecipe: 'recipe2' },
    ];

    const merged = mergeIngredients(ingredients);

    expect(merged).toHaveLength(1);
    expect(merged[0].name).toBe('green onion');
    expect(merged[0].quantity).toBe(5);
  });

  it('normalizes units during merge', () => {
    const ingredients = [
      { name: 'salt', quantity: 1, unit: 'teaspoon', category: 'Spices' as const, sourceRecipe: 'recipe1' },
      { name: 'salt', quantity: 0.5, unit: 'tsp', category: 'Spices' as const, sourceRecipe: 'recipe2' },
    ];

    const merged = mergeIngredients(ingredients);

    expect(merged).toHaveLength(1);
    expect(merged[0].quantity).toBe(1.5);
    expect(merged[0].unit).toBe('tsp');
  });

  it('collects notes from multiple sources', () => {
    const ingredients = [
      { name: 'onion', quantity: 1, unit: 'item', notes: 'diced', category: 'Produce' as const, sourceRecipe: 'recipe1' },
      { name: 'onion', quantity: 1, unit: 'item', notes: 'sliced', category: 'Produce' as const, sourceRecipe: 'recipe2' },
    ];

    const merged = mergeIngredients(ingredients);

    expect(merged[0].notes).toBe('diced, sliced');
  });

  it('tracks source recipes', () => {
    const ingredients = [
      { name: 'garlic', quantity: 2, unit: 'clove', category: 'Produce' as const, sourceRecipe: 'recipe1' },
      { name: 'garlic', quantity: 3, unit: 'clove', category: 'Produce' as const, sourceRecipe: 'recipe2' },
    ];

    const merged = mergeIngredients(ingredients);

    expect(merged[0].sourceRecipes).toContain('recipe1');
    expect(merged[0].sourceRecipes).toContain('recipe2');
  });

  it('defaults category to Other when not provided', () => {
    const ingredients = [
      { name: 'mystery item', quantity: 1, unit: 'item', sourceRecipe: 'recipe1' },
    ];

    const merged = mergeIngredients(ingredients as unknown as Parameters<typeof mergeIngredients>[0]);

    expect(merged[0].category).toBe('Other');
  });
});

describe('groupByCategory', () => {
  it('groups items by their category', () => {
    const items: GroceryItem[] = [
      { id: '1', name: 'onion', quantity: 1, unit: 'item', category: 'Produce', checked: false, sourceRecipes: [] },
      { id: '2', name: 'chicken', quantity: 500, unit: 'g', category: 'Meat', checked: false, sourceRecipes: [] },
      { id: '3', name: 'garlic', quantity: 3, unit: 'clove', category: 'Produce', checked: false, sourceRecipes: [] },
    ];

    const grouped = groupByCategory(items);

    expect(grouped.Produce).toHaveLength(2);
    expect(grouped.Meat).toHaveLength(1);
    expect(grouped.Dairy).toHaveLength(0);
  });

  it('sorts items within each category by name', () => {
    const items: GroceryItem[] = [
      { id: '1', name: 'zucchini', quantity: 1, unit: 'item', category: 'Produce', checked: false, sourceRecipes: [] },
      { id: '2', name: 'apple', quantity: 2, unit: 'item', category: 'Produce', checked: false, sourceRecipes: [] },
      { id: '3', name: 'carrot', quantity: 3, unit: 'item', category: 'Produce', checked: false, sourceRecipes: [] },
    ];

    const grouped = groupByCategory(items);

    expect(grouped.Produce[0].name).toBe('apple');
    expect(grouped.Produce[1].name).toBe('carrot');
    expect(grouped.Produce[2].name).toBe('zucchini');
  });
});

describe('formatQuantity', () => {
  it('formats whole numbers without decimals', () => {
    expect(formatQuantity(1)).toBe('1');
    expect(formatQuantity(10)).toBe('10');
  });

  it('formats common fractions with unicode symbols', () => {
    expect(formatQuantity(0.25)).toBe('¼');
    expect(formatQuantity(0.5)).toBe('½');
    expect(formatQuantity(0.75)).toBe('¾');
  });

  it('formats mixed numbers with fractions', () => {
    expect(formatQuantity(1.5)).toBe('1½');
    expect(formatQuantity(2.25)).toBe('2¼');
    expect(formatQuantity(3.75)).toBe('3¾');
  });

  it('handles other decimals', () => {
    expect(formatQuantity(1.33)).toBe('1⅓');
    expect(formatQuantity(2.1)).toBe('2.1');
  });
});

describe('exportAsText', () => {
  it('exports grouped items with checkboxes', () => {
    const grouped = {
      Produce: [
        { id: '1', name: 'onion', quantity: 1, unit: 'item', category: 'Produce' as const, checked: false, sourceRecipes: [] },
      ],
      Meat: [
        { id: '2', name: 'chicken', quantity: 500, unit: 'g', category: 'Meat' as const, checked: true, sourceRecipes: [] },
      ],
      Dairy: [],
      Pantry: [],
      Frozen: [],
      Spices: [],
      Other: [],
    };

    const text = exportAsText(grouped);

    expect(text).toContain('== Produce ==');
    expect(text).toContain('[ ] 1 item onion');
    expect(text).toContain('== Meat ==');
    expect(text).toContain('[x] 500 g chicken');
  });

  it('excludes empty categories', () => {
    const grouped = {
      Produce: [
        { id: '1', name: 'onion', quantity: 1, unit: 'item', category: 'Produce' as const, checked: false, sourceRecipes: [] },
      ],
      Meat: [],
      Dairy: [],
      Pantry: [],
      Frozen: [],
      Spices: [],
      Other: [],
    };

    const text = exportAsText(grouped);

    expect(text).toContain('== Produce ==');
    expect(text).not.toContain('== Meat ==');
  });
});
