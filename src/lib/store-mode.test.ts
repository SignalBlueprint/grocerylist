import { describe, it, expect } from 'vitest';
import {
  reorderByStoreLayout,
  STORE_LAYOUTS,
  DEFAULT_CATEGORY_ORDER,
  getLayoutDisplayName,
} from './store-mode';
import { IngredientCategory } from '@/types';

describe('reorderByStoreLayout', () => {
  it('reorders categories according to default store layout', () => {
    const categories: IngredientCategory[] = ['Pantry', 'Meat', 'Produce', 'Dairy'];
    const result = reorderByStoreLayout(categories, 'default');

    // Default layout: Produce, Dairy, Meat, Frozen, Pantry, Spices, Other
    expect(result).toEqual(['Produce', 'Dairy', 'Meat', 'Pantry']);
  });

  it('reorders categories according to perimeter-first layout', () => {
    const categories: IngredientCategory[] = ['Dairy', 'Pantry', 'Produce', 'Meat'];
    const result = reorderByStoreLayout(categories, 'perimeterFirst');

    // Perimeter layout: Produce, Meat, Dairy, Frozen, Pantry, Spices, Other
    expect(result).toEqual(['Produce', 'Meat', 'Dairy', 'Pantry']);
  });

  it('defaults to default layout when no layout specified', () => {
    const categories: IngredientCategory[] = ['Meat', 'Produce'];
    const result = reorderByStoreLayout(categories);

    expect(result).toEqual(['Produce', 'Meat']);
  });

  it('preserves all input categories', () => {
    const categories: IngredientCategory[] = ['Other', 'Spices', 'Frozen', 'Pantry', 'Dairy', 'Meat', 'Produce'];
    const result = reorderByStoreLayout(categories);

    expect(result).toHaveLength(categories.length);
    categories.forEach(cat => {
      expect(result).toContain(cat);
    });
  });

  it('handles empty array', () => {
    const result = reorderByStoreLayout([]);
    expect(result).toEqual([]);
  });

  it('handles single category', () => {
    const result = reorderByStoreLayout(['Dairy']);
    expect(result).toEqual(['Dairy']);
  });

  it('does not mutate original array', () => {
    const original: IngredientCategory[] = ['Meat', 'Produce'];
    const originalCopy = [...original];
    reorderByStoreLayout(original);

    expect(original).toEqual(originalCopy);
  });

  it('places unknown categories at the end', () => {
    // This shouldn't happen with our type system, but testing defensive behavior
    const categories = ['Produce', 'Meat'] as IngredientCategory[];
    const result = reorderByStoreLayout(categories);

    // Both should be in the result
    expect(result).toContain('Produce');
    expect(result).toContain('Meat');
  });
});

describe('STORE_LAYOUTS', () => {
  it('has a default layout', () => {
    expect(STORE_LAYOUTS.default).toBeDefined();
    expect(STORE_LAYOUTS.default.length).toBeGreaterThan(0);
  });

  it('has a perimeter-first layout', () => {
    expect(STORE_LAYOUTS.perimeterFirst).toBeDefined();
    expect(STORE_LAYOUTS.perimeterFirst.length).toBeGreaterThan(0);
  });

  it('default layout starts with Produce', () => {
    expect(STORE_LAYOUTS.default[0]).toBe('Produce');
  });

  it('default layout has Dairy before Meat', () => {
    const dairyIndex = STORE_LAYOUTS.default.indexOf('Dairy');
    const meatIndex = STORE_LAYOUTS.default.indexOf('Meat');
    expect(dairyIndex).toBeLessThan(meatIndex);
  });

  it('perimeter-first layout has Meat before Dairy', () => {
    const dairyIndex = STORE_LAYOUTS.perimeterFirst.indexOf('Dairy');
    const meatIndex = STORE_LAYOUTS.perimeterFirst.indexOf('Meat');
    expect(meatIndex).toBeLessThan(dairyIndex);
  });

  it('all layouts contain all standard categories', () => {
    const standardCategories: IngredientCategory[] = [
      'Produce', 'Meat', 'Dairy', 'Pantry', 'Frozen', 'Spices', 'Other'
    ];

    Object.values(STORE_LAYOUTS).forEach(layout => {
      standardCategories.forEach(cat => {
        expect(layout).toContain(cat);
      });
    });
  });
});

describe('DEFAULT_CATEGORY_ORDER', () => {
  it('contains all standard categories', () => {
    const standardCategories: IngredientCategory[] = [
      'Produce', 'Meat', 'Dairy', 'Pantry', 'Frozen', 'Spices', 'Other'
    ];

    standardCategories.forEach(cat => {
      expect(DEFAULT_CATEGORY_ORDER).toContain(cat);
    });
  });

  it('has no duplicates', () => {
    const uniqueCategories = new Set(DEFAULT_CATEGORY_ORDER);
    expect(uniqueCategories.size).toBe(DEFAULT_CATEGORY_ORDER.length);
  });
});

describe('getLayoutDisplayName', () => {
  it('returns display name for default layout', () => {
    const name = getLayoutDisplayName('default');
    expect(name).toBe('Standard Store Layout');
  });

  it('returns display name for perimeter-first layout', () => {
    const name = getLayoutDisplayName('perimeterFirst');
    expect(name).toBe('Perimeter First');
  });
});
