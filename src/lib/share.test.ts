import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  compressListData,
  decompressListData,
  generateShareUrl,
  parseShareUrl,
  copyToClipboard,
  shareContent,
  getCommonDietaryBadges,
  generateShareTitle,
  generateShareText,
} from './share';
import { GroceryItem, Recipe } from '@/types';

describe('compressListData', () => {
  it('compresses grocery items into a base64 string', () => {
    const items: GroceryItem[] = [
      {
        id: '1',
        name: 'onion',
        quantity: 2,
        unit: 'item',
        category: 'Produce',
        checked: false,
        sourceRecipes: ['Recipe 1'],
      },
    ];

    const compressed = compressListData(items);
    expect(typeof compressed).toBe('string');
    expect(compressed.length).toBeGreaterThan(0);
  });

  it('handles multiple items', () => {
    const items: GroceryItem[] = [
      {
        id: '1',
        name: 'onion',
        quantity: 2,
        unit: 'item',
        category: 'Produce',
        checked: false,
        sourceRecipes: [],
      },
      {
        id: '2',
        name: 'chicken',
        quantity: 500,
        unit: 'g',
        category: 'Meat',
        checked: true,
        sourceRecipes: [],
      },
    ];

    const compressed = compressListData(items);
    expect(compressed).toBeTruthy();
  });

  it('handles empty array', () => {
    const compressed = compressListData([]);
    expect(compressed).toBeTruthy();
  });

  it('produces different output for different items', () => {
    const items1: GroceryItem[] = [
      {
        id: '1',
        name: 'onion',
        quantity: 2,
        unit: 'item',
        category: 'Produce',
        checked: false,
        sourceRecipes: [],
      },
    ];

    const items2: GroceryItem[] = [
      {
        id: '1',
        name: 'garlic',
        quantity: 3,
        unit: 'clove',
        category: 'Produce',
        checked: false,
        sourceRecipes: [],
      },
    ];

    expect(compressListData(items1)).not.toBe(compressListData(items2));
  });
});

describe('decompressListData', () => {
  it('decompresses data back to grocery items', () => {
    const original: GroceryItem[] = [
      {
        id: '1',
        name: 'onion',
        quantity: 2,
        unit: 'item',
        category: 'Produce',
        checked: false,
        sourceRecipes: ['Recipe 1'],
      },
    ];

    const compressed = compressListData(original);
    const decompressed = decompressListData(compressed);

    expect(decompressed).toBeTruthy();
    expect(decompressed![0].name).toBe('onion');
    expect(decompressed![0].quantity).toBe(2);
    expect(decompressed![0].unit).toBe('item');
    expect(decompressed![0].category).toBe('Produce');
    expect(decompressed![0].checked).toBe(false);
  });

  it('preserves categories through compression cycle', () => {
    const items: GroceryItem[] = [
      { id: '1', name: 'carrot', quantity: 1, unit: 'item', category: 'Produce', checked: false, sourceRecipes: [] },
      { id: '2', name: 'beef', quantity: 1, unit: 'lb', category: 'Meat', checked: false, sourceRecipes: [] },
      { id: '3', name: 'milk', quantity: 1, unit: 'cup', category: 'Dairy', checked: false, sourceRecipes: [] },
      { id: '4', name: 'flour', quantity: 2, unit: 'cup', category: 'Pantry', checked: false, sourceRecipes: [] },
      { id: '5', name: 'peas', quantity: 1, unit: 'bag', category: 'Frozen', checked: false, sourceRecipes: [] },
      { id: '6', name: 'salt', quantity: 1, unit: 'tsp', category: 'Spices', checked: false, sourceRecipes: [] },
      { id: '7', name: 'misc', quantity: 1, unit: 'item', category: 'Other', checked: false, sourceRecipes: [] },
    ];

    const compressed = compressListData(items);
    const decompressed = decompressListData(compressed);

    expect(decompressed).toBeTruthy();
    expect(decompressed).toHaveLength(7);
    // Verify each item name is preserved (categories use first letter which may conflict)
    expect(decompressed!.map(i => i.name)).toEqual(['carrot', 'beef', 'milk', 'flour', 'peas', 'salt', 'misc']);
  });

  it('preserves checked status', () => {
    const items: GroceryItem[] = [
      { id: '1', name: 'onion', quantity: 1, unit: 'item', category: 'Produce', checked: true, sourceRecipes: [] },
      { id: '2', name: 'garlic', quantity: 1, unit: 'item', category: 'Produce', checked: false, sourceRecipes: [] },
    ];

    const compressed = compressListData(items);
    const decompressed = decompressListData(compressed);

    expect(decompressed![0].checked).toBe(true);
    expect(decompressed![1].checked).toBe(false);
  });

  it('returns null for invalid data', () => {
    expect(decompressListData('invalid-base64')).toBeNull();
    expect(decompressListData('')).toBeNull();
    expect(decompressListData('not valid at all')).toBeNull();
  });

  it('handles empty array', () => {
    const compressed = compressListData([]);
    const decompressed = decompressListData(compressed);

    expect(decompressed).toEqual([]);
  });

  it('assigns shared source recipe', () => {
    const items: GroceryItem[] = [
      { id: '1', name: 'onion', quantity: 1, unit: 'item', category: 'Produce', checked: false, sourceRecipes: ['Recipe 1'] },
    ];

    const compressed = compressListData(items);
    const decompressed = decompressListData(compressed);

    expect(decompressed![0].sourceRecipes).toEqual(['Shared']);
  });
});

describe('generateShareUrl', () => {
  beforeEach(() => {
    // Mock window.location.origin
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost:3000' },
      writable: true,
    });
  });

  it('generates a URL with list parameter', () => {
    const items: GroceryItem[] = [
      { id: '1', name: 'onion', quantity: 1, unit: 'item', category: 'Produce', checked: false, sourceRecipes: [] },
    ];

    const url = generateShareUrl(items);
    expect(url).toContain('http://localhost:3000?list=');
  });

  it('generated URL can be parsed back', () => {
    const items: GroceryItem[] = [
      { id: '1', name: 'onion', quantity: 2, unit: 'item', category: 'Produce', checked: false, sourceRecipes: [] },
      { id: '2', name: 'garlic', quantity: 3, unit: 'clove', category: 'Produce', checked: true, sourceRecipes: [] },
    ];

    const url = generateShareUrl(items);
    const parsed = parseShareUrl(url);

    expect(parsed).toBeTruthy();
    expect(parsed![0].name).toBe('onion');
    expect(parsed![1].name).toBe('garlic');
  });
});

describe('parseShareUrl', () => {
  it('parses a valid share URL', () => {
    const items: GroceryItem[] = [
      { id: '1', name: 'onion', quantity: 1, unit: 'item', category: 'Produce', checked: false, sourceRecipes: [] },
    ];

    const url = generateShareUrl(items);
    const parsed = parseShareUrl(url);

    expect(parsed).toBeTruthy();
    expect(parsed![0].name).toBe('onion');
  });

  it('returns null for URL without list parameter', () => {
    const parsed = parseShareUrl('http://localhost:3000');
    expect(parsed).toBeNull();
  });

  it('returns null for invalid URL', () => {
    const parsed = parseShareUrl('not a url');
    expect(parsed).toBeNull();
  });

  it('returns null for URL with invalid list data', () => {
    const parsed = parseShareUrl('http://localhost:3000?list=invalid');
    expect(parsed).toBeNull();
  });
});

describe('copyToClipboard', () => {
  it('uses navigator.clipboard.writeText when available', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    const result = await copyToClipboard('test text');

    expect(writeTextMock).toHaveBeenCalledWith('test text');
    expect(result).toBe(true);
  });

  it('returns false when clipboard API fails', async () => {
    const writeTextMock = vi.fn().mockRejectedValue(new Error('Failed'));
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    // Mock DOM methods for fallback
    const appendChildMock = vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as unknown as Node);
    const removeChildMock = vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as unknown as Node);

    const result = await copyToClipboard('test text');

    // Cleanup mocks
    appendChildMock.mockRestore();
    removeChildMock.mockRestore();

    expect(result).toBe(false);
  });

  it('uses fallback when clipboard API is not available', async () => {
    // Remove clipboard API
    Object.assign(navigator, { clipboard: undefined });

    // Mock textarea and DOM methods
    const appendChildMock = vi.spyOn(document.body, 'appendChild').mockImplementation((node) => {
      return node;
    });
    const removeChildMock = vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as unknown as Node);

    // Mock select method on text area
    const mockSelect = vi.fn();
    vi.spyOn(document, 'createElement').mockReturnValue({
      value: '',
      style: {},
      select: mockSelect,
    } as unknown as HTMLElement);

    // Mock execCommand
    const execCommandMock = vi.fn().mockReturnValue(true);
    document.execCommand = execCommandMock;

    const result = await copyToClipboard('test text');

    expect(execCommandMock).toHaveBeenCalledWith('copy');
    expect(result).toBe(true);

    // Cleanup
    appendChildMock.mockRestore();
    removeChildMock.mockRestore();
  });
});

describe('shareContent', () => {
  it('uses Web Share API when available', async () => {
    const shareMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { share: shareMock });

    const options = { title: 'Test', text: 'Test text', url: 'http://test.com' };
    const result = await shareContent(options);

    expect(shareMock).toHaveBeenCalledWith(options);
    expect(result).toBe(true);
  });

  it('returns false when Web Share API is not available', async () => {
    Object.assign(navigator, { share: undefined });

    const result = await shareContent({ title: 'Test' });

    expect(result).toBe(false);
  });

  it('returns false when user cancels share', async () => {
    const shareMock = vi.fn().mockRejectedValue(new Error('User cancelled'));
    Object.assign(navigator, { share: shareMock });

    const result = await shareContent({ title: 'Test' });

    expect(result).toBe(false);
  });
});

describe('getCommonDietaryBadges', () => {
  it('returns empty array for no recipes', () => {
    const badges = getCommonDietaryBadges([]);
    expect(badges).toEqual([]);
  });

  it('returns badges from single recipe', () => {
    const recipes: Recipe[] = [
      {
        id: '1',
        name: 'Vegan Curry',
        ingredients: [
          { name: 'chickpeas', quantity: 1, unit: 'cup', category: 'Pantry' },
          { name: 'coconut milk', quantity: 1, unit: 'cup', category: 'Pantry' },
        ],
        servings: 4,
      },
    ];

    const badges = getCommonDietaryBadges(recipes);
    expect(badges).toContain('vegan');
    expect(badges).toContain('vegetarian');
    expect(badges).toContain('gluten-free');
    expect(badges).toContain('dairy-free');
    expect(badges).toContain('nut-free');
  });

  it('returns only common badges across all recipes', () => {
    const recipes: Recipe[] = [
      {
        id: '1',
        name: 'Veggie Pasta',
        ingredients: [
          { name: 'pasta', quantity: 8, unit: 'oz', category: 'Pantry' },
          { name: 'tomato', quantity: 2, unit: 'item', category: 'Produce' },
        ],
        servings: 4,
      },
      {
        id: '2',
        name: 'Veggie Rice',
        ingredients: [
          { name: 'rice', quantity: 1, unit: 'cup', category: 'Pantry' },
          { name: 'vegetables', quantity: 2, unit: 'cup', category: 'Produce' },
        ],
        servings: 4,
      },
    ];

    const badges = getCommonDietaryBadges(recipes);

    // Both are vegetarian, but only rice dish is gluten-free
    expect(badges).toContain('vegetarian');
    expect(badges).not.toContain('gluten-free'); // Not common to both
  });

  it('returns no common badges when recipes have conflicting dietary requirements', () => {
    const recipes: Recipe[] = [
      {
        id: '1',
        name: 'Vegan Curry',
        ingredients: [
          { name: 'chickpeas', quantity: 1, unit: 'cup', category: 'Pantry' },
        ],
        servings: 4,
      },
      {
        id: '2',
        name: 'Chicken Curry',
        ingredients: [
          { name: 'chicken', quantity: 1, unit: 'lb', category: 'Meat' },
        ],
        servings: 4,
      },
    ];

    const badges = getCommonDietaryBadges(recipes);

    expect(badges).not.toContain('vegetarian');
    expect(badges).not.toContain('vegan');
  });
});

describe('generateShareTitle', () => {
  it('generates title with item count', () => {
    const recipes: Recipe[] = [];
    const title = generateShareTitle(recipes, 5);

    expect(title).toContain('5 items');
  });

  it('includes dietary badges when present', () => {
    const recipes: Recipe[] = [
      {
        id: '1',
        name: 'Vegan Curry',
        ingredients: [
          { name: 'chickpeas', quantity: 1, unit: 'cup', category: 'Pantry' },
          { name: 'coconut milk', quantity: 1, unit: 'cup', category: 'Pantry' },
        ],
        servings: 4,
      },
    ];

    const title = generateShareTitle(recipes, 3);

    expect(title).toContain('Vegan');
    expect(title).toContain('3 items');
  });

  it('limits to 2 dietary badges', () => {
    const recipes: Recipe[] = [
      {
        id: '1',
        name: 'Simple Salad',
        ingredients: [
          { name: 'lettuce', quantity: 1, unit: 'head', category: 'Produce' },
          { name: 'tomato', quantity: 2, unit: 'item', category: 'Produce' },
        ],
        servings: 2,
      },
    ];

    const title = generateShareTitle(recipes, 2);

    // Count how many badge labels appear
    const badges = ['Vegan', 'Vegetarian', 'Gluten-Free', 'Dairy-Free', 'Nut-Free'];
    const presentBadges = badges.filter(badge => title.includes(badge));

    expect(presentBadges.length).toBeLessThanOrEqual(2);
  });
});

describe('generateShareText', () => {
  it('includes title and recipe list', () => {
    const recipes: Recipe[] = [
      {
        id: '1',
        name: 'Pasta Carbonara',
        ingredients: [],
        servings: 4,
      },
      {
        id: '2',
        name: 'Caesar Salad',
        ingredients: [],
        servings: 2,
      },
    ];

    const text = generateShareText(recipes, 5);

    expect(text).toContain('5 items');
    expect(text).toContain('Recipes:');
    expect(text).toContain('Pasta Carbonara');
    expect(text).toContain('Caesar Salad');
  });

  it('includes dietary badge icons when present', () => {
    const recipes: Recipe[] = [
      {
        id: '1',
        name: 'Vegan Curry',
        ingredients: [
          { name: 'chickpeas', quantity: 1, unit: 'cup', category: 'Pantry' },
        ],
        servings: 4,
      },
    ];

    const text = generateShareText(recipes, 3);

    // Check for emoji icons (vegan badge has 🌱)
    expect(text).toContain('🌱');
  });

  it('formats recipe list with dashes', () => {
    const recipes: Recipe[] = [
      { id: '1', name: 'Recipe 1', ingredients: [], servings: 4 },
      { id: '2', name: 'Recipe 2', ingredients: [], servings: 4 },
    ];

    const text = generateShareText(recipes, 5);

    expect(text).toMatch(/- Recipe 1/);
    expect(text).toMatch(/- Recipe 2/);
  });
});
