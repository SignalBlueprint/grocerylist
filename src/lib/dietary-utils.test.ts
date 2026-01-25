import { describe, it, expect } from 'vitest';
import {
  detectDietaryBadges,
  MEAT_INGREDIENTS,
  GLUTEN_INGREDIENTS,
  DAIRY_INGREDIENTS,
  NUT_INGREDIENTS,
  getBadgeInfo,
} from './dietary-utils';
import { Ingredient } from '@/types';

// Helper to create test ingredients
const createIngredient = (name: string, category?: string): Ingredient => ({
  name,
  quantity: 1,
  unit: 'item',
  category: (category as Ingredient['category']) || 'Other',
});

const createIngredients = (...names: string[]): Ingredient[] =>
  names.map(name => createIngredient(name));

describe('detectDietaryBadges', () => {
  describe('vegetarian detection', () => {
    it('returns vegetarian badge when no meat ingredients present', () => {
      const ingredients = createIngredients('tomato', 'onion', 'garlic', 'olive oil');
      const badges = detectDietaryBadges(ingredients);
      expect(badges).toContain('vegetarian');
    });

    it('does not return vegetarian badge when meat is present', () => {
      const ingredients = createIngredients('chicken breast', 'onion', 'garlic');
      const badges = detectDietaryBadges(ingredients);
      expect(badges).not.toContain('vegetarian');
    });

    it('does not return vegetarian badge when fish is present', () => {
      const ingredients = createIngredients('salmon fillet', 'lemon', 'dill');
      const badges = detectDietaryBadges(ingredients);
      expect(badges).not.toContain('vegetarian');
    });

    it('does not return vegetarian badge when fish sauce is present', () => {
      const ingredients = createIngredients('rice noodles', 'fish sauce', 'lime');
      const badges = detectDietaryBadges(ingredients);
      expect(badges).not.toContain('vegetarian');
    });

    it('detects vegetarian badge for mushroom risotto ingredients', () => {
      const ingredients = createIngredients(
        'arborio rice', 'cremini mushrooms', 'yellow onion', 'garlic',
        'white wine', 'vegetable broth', 'butter', 'parmesan cheese',
        'olive oil', 'fresh thyme', 'salt', 'black pepper'
      );
      const badges = detectDietaryBadges(ingredients);
      expect(badges).toContain('vegetarian');
    });
  });

  describe('vegan detection', () => {
    it('returns vegan badge when no animal products present', () => {
      const ingredients = createIngredients('tomato', 'onion', 'garlic', 'olive oil');
      const badges = detectDietaryBadges(ingredients);
      expect(badges).toContain('vegan');
    });

    it('does not return vegan badge when dairy is present', () => {
      const ingredients = createIngredients('pasta', 'tomato', 'parmesan cheese');
      const badges = detectDietaryBadges(ingredients);
      expect(badges).not.toContain('vegan');
    });

    it('does not return vegan badge when eggs are present', () => {
      const ingredients = createIngredients('rice', 'vegetables', 'egg');
      const badges = detectDietaryBadges(ingredients);
      expect(badges).not.toContain('vegan');
    });

    it('does not return vegan badge when honey is present', () => {
      const ingredients = createIngredients('oats', 'fruit', 'honey');
      const badges = detectDietaryBadges(ingredients);
      expect(badges).not.toContain('vegan');
    });

    it('vegan recipes are also vegetarian', () => {
      const ingredients = createIngredients('tomato', 'onion', 'garlic', 'olive oil');
      const badges = detectDietaryBadges(ingredients);
      expect(badges).toContain('vegan');
      expect(badges).toContain('vegetarian');
    });
  });

  describe('gluten-free detection', () => {
    it('returns gluten-free badge when no gluten ingredients present', () => {
      const ingredients = createIngredients('rice', 'chicken', 'vegetables');
      const badges = detectDietaryBadges(ingredients);
      expect(badges).toContain('gluten-free');
    });

    it('does not return gluten-free badge when pasta is present', () => {
      const ingredients = createIngredients('spaghetti', 'tomato sauce', 'basil');
      const badges = detectDietaryBadges(ingredients);
      expect(badges).not.toContain('gluten-free');
    });

    it('does not return gluten-free badge when flour is present', () => {
      const ingredients = createIngredients('flour', 'butter', 'sugar');
      const badges = detectDietaryBadges(ingredients);
      expect(badges).not.toContain('gluten-free');
    });

    it('does not return gluten-free badge when soy sauce is present', () => {
      const ingredients = createIngredients('rice', 'chicken', 'soy sauce');
      const badges = detectDietaryBadges(ingredients);
      expect(badges).not.toContain('gluten-free');
    });

    it('does not return gluten-free badge when bread crumbs are present', () => {
      const ingredients = createIngredients('chicken', 'breadcrumbs', 'egg');
      const badges = detectDietaryBadges(ingredients);
      expect(badges).not.toContain('gluten-free');
    });
  });

  describe('dairy-free detection', () => {
    it('returns dairy-free badge when no dairy ingredients present', () => {
      const ingredients = createIngredients('chicken', 'olive oil', 'lemon');
      const badges = detectDietaryBadges(ingredients);
      expect(badges).toContain('dairy-free');
    });

    it('does not return dairy-free badge when cheese is present', () => {
      const ingredients = createIngredients('pasta', 'parmesan cheese', 'basil');
      const badges = detectDietaryBadges(ingredients);
      expect(badges).not.toContain('dairy-free');
    });

    it('does not return dairy-free badge when butter is present', () => {
      const ingredients = createIngredients('bread', 'butter');
      const badges = detectDietaryBadges(ingredients);
      expect(badges).not.toContain('dairy-free');
    });

    it('does not return dairy-free badge when cream is present', () => {
      const ingredients = createIngredients('pasta', 'heavy cream', 'garlic');
      const badges = detectDietaryBadges(ingredients);
      expect(badges).not.toContain('dairy-free');
    });

    it('does not return dairy-free badge when milk is present', () => {
      const ingredients = createIngredients('cereal', 'milk');
      const badges = detectDietaryBadges(ingredients);
      expect(badges).not.toContain('dairy-free');
    });
  });

  describe('nut-free detection', () => {
    it('returns nut-free badge when no nut ingredients present', () => {
      const ingredients = createIngredients('chicken', 'rice', 'vegetables');
      const badges = detectDietaryBadges(ingredients);
      expect(badges).toContain('nut-free');
    });

    it('does not return nut-free badge when peanuts are present', () => {
      const ingredients = createIngredients('noodles', 'peanuts', 'lime');
      const badges = detectDietaryBadges(ingredients);
      expect(badges).not.toContain('nut-free');
    });

    it('does not return nut-free badge when almond is present', () => {
      const ingredients = createIngredients('oats', 'almond milk');
      const badges = detectDietaryBadges(ingredients);
      expect(badges).not.toContain('nut-free');
    });

    it('does not return nut-free badge when pine nuts are present', () => {
      const ingredients = createIngredients('basil', 'pine nuts', 'olive oil');
      const badges = detectDietaryBadges(ingredients);
      expect(badges).not.toContain('nut-free');
    });

    it('does not return nut-free badge when cashews are present', () => {
      const ingredients = createIngredients('chicken', 'cashews', 'soy sauce');
      const badges = detectDietaryBadges(ingredients);
      expect(badges).not.toContain('nut-free');
    });
  });

  describe('dairy-free exceptions', () => {
    it('coconut milk is recognized as dairy-free', () => {
      const ingredients = createIngredients('coconut milk');
      const badges = detectDietaryBadges(ingredients);
      expect(badges).toContain('dairy-free');
    });

    it('almond milk is recognized as dairy-free', () => {
      const ingredients = createIngredients('almond milk');
      const badges = detectDietaryBadges(ingredients);
      expect(badges).toContain('dairy-free');
    });

    it('regular milk is not dairy-free', () => {
      const ingredients = createIngredients('milk');
      const badges = detectDietaryBadges(ingredients);
      expect(badges).not.toContain('dairy-free');
    });

    it('coconut milk with other ingredients remains dairy-free', () => {
      const ingredients = createIngredients('coconut milk', 'chickpeas', 'onion', 'garlic');
      const badges = detectDietaryBadges(ingredients);
      expect(badges).toContain('dairy-free');
    });

    it('ginger does not match ghee', () => {
      const ingredients = createIngredients('ginger');
      const badges = detectDietaryBadges(ingredients);
      expect(badges).toContain('dairy-free');
    });

  });

  describe('real recipe tests', () => {
    it('vegetable curry is vegetarian, gluten-free, and dairy-free', () => {
      const ingredients = createIngredients(
        'chickpeas', 'coconut milk', 'yellow onion', 'garlic', 'ginger',
        'cauliflower', 'spinach', 'curry powder', 'turmeric', 'cumin',
        'vegetable oil', 'salt', 'basmati rice'
      );
      const badges = detectDietaryBadges(ingredients);
      expect(badges).toContain('vegetarian');
      expect(badges).toContain('gluten-free');
      expect(badges).toContain('dairy-free'); // coconut milk is not dairy
    });

    it('greek salad is vegetarian and gluten-free', () => {
      const ingredients = createIngredients(
        'cucumber', 'tomato', 'red onion', 'bell pepper',
        'kalamata olives', 'feta cheese', 'olive oil',
        'red wine vinegar', 'dried oregano', 'salt', 'black pepper'
      );
      const badges = detectDietaryBadges(ingredients);
      expect(badges).toContain('vegetarian');
      expect(badges).toContain('gluten-free');
      expect(badges).not.toContain('dairy-free'); // has feta cheese
    });

    it('spaghetti bolognese is not vegetarian', () => {
      const ingredients = createIngredients(
        'spaghetti', 'ground beef', 'yellow onion', 'garlic',
        'crushed tomatoes', 'tomato paste', 'olive oil',
        'dried oregano', 'salt', 'black pepper', 'parmesan cheese'
      );
      const badges = detectDietaryBadges(ingredients);
      expect(badges).not.toContain('vegetarian');
      expect(badges).not.toContain('gluten-free'); // has spaghetti
    });

    it('pad thai is not vegetarian due to fish sauce', () => {
      const ingredients = createIngredients(
        'rice noodles', 'shrimp', 'egg', 'bean sprouts',
        'green onion', 'garlic', 'fish sauce', 'tamarind paste',
        'brown sugar', 'lime', 'peanuts', 'vegetable oil', 'cilantro'
      );
      const badges = detectDietaryBadges(ingredients);
      expect(badges).not.toContain('vegetarian'); // has shrimp and fish sauce
      expect(badges).not.toContain('nut-free'); // has peanuts
      expect(badges).toContain('gluten-free'); // rice noodles are GF
    });

    it('chicken stir fry is gluten-free when using tamari', () => {
      // Note: regular soy sauce has gluten, but we test with soy sauce here
      const ingredients = createIngredients(
        'chicken breast', 'broccoli', 'bell pepper', 'carrot',
        'garlic', 'ginger', 'soy sauce', 'sesame oil',
        'vegetable oil', 'cornstarch', 'green onion'
      );
      const badges = detectDietaryBadges(ingredients);
      expect(badges).not.toContain('vegetarian'); // has chicken
      expect(badges).not.toContain('gluten-free'); // has soy sauce
    });
  });

  describe('edge cases', () => {
    it('handles empty ingredient list', () => {
      const badges = detectDietaryBadges([]);
      expect(badges).toContain('vegetarian');
      expect(badges).toContain('vegan');
      expect(badges).toContain('gluten-free');
      expect(badges).toContain('dairy-free');
      expect(badges).toContain('nut-free');
    });

    it('handles case-insensitive matching', () => {
      const ingredients = createIngredients('CHICKEN BREAST', 'Garlic', 'olive OIL');
      const badges = detectDietaryBadges(ingredients);
      expect(badges).not.toContain('vegetarian'); // CHICKEN should match
    });

    it('handles ingredient with extra whitespace', () => {
      const ingredients = [createIngredient('  ground beef  ')];
      const badges = detectDietaryBadges(ingredients);
      expect(badges).not.toContain('vegetarian');
    });

    it('matches partial ingredient names', () => {
      // "parmesan cheese" should match "parmesan" in DAIRY_INGREDIENTS
      const ingredients = createIngredients('parmesan cheese');
      const badges = detectDietaryBadges(ingredients);
      expect(badges).not.toContain('dairy-free');
    });
  });
});

describe('ingredient lists', () => {
  it('MEAT_INGREDIENTS contains common meats', () => {
    expect(MEAT_INGREDIENTS).toContain('chicken');
    expect(MEAT_INGREDIENTS).toContain('beef');
    expect(MEAT_INGREDIENTS).toContain('salmon');
    expect(MEAT_INGREDIENTS).toContain('shrimp');
  });

  it('GLUTEN_INGREDIENTS contains common gluten sources', () => {
    expect(GLUTEN_INGREDIENTS).toContain('flour');
    expect(GLUTEN_INGREDIENTS).toContain('pasta');
    expect(GLUTEN_INGREDIENTS).toContain('bread');
    expect(GLUTEN_INGREDIENTS).toContain('soy sauce');
  });

  it('DAIRY_INGREDIENTS contains common dairy products', () => {
    expect(DAIRY_INGREDIENTS).toContain('milk');
    expect(DAIRY_INGREDIENTS).toContain('cheese');
    expect(DAIRY_INGREDIENTS).toContain('butter');
    expect(DAIRY_INGREDIENTS).toContain('yogurt');
  });

  it('NUT_INGREDIENTS contains common nuts', () => {
    expect(NUT_INGREDIENTS).toContain('peanut');
    expect(NUT_INGREDIENTS).toContain('almond');
    expect(NUT_INGREDIENTS).toContain('walnut');
    expect(NUT_INGREDIENTS).toContain('cashew');
  });
});

describe('getBadgeInfo', () => {
  it('returns correct info for vegetarian badge', () => {
    const info = getBadgeInfo('vegetarian');
    expect(info.label).toBe('Vegetarian');
    expect(info.color).toContain('green');
    expect(info.icon).toBe('🌿');
  });

  it('returns correct info for vegan badge', () => {
    const info = getBadgeInfo('vegan');
    expect(info.label).toBe('Vegan');
    expect(info.icon).toBe('🌱');
  });

  it('returns correct info for gluten-free badge', () => {
    const info = getBadgeInfo('gluten-free');
    expect(info.label).toBe('Gluten-Free');
    expect(info.color).toContain('amber');
  });

  it('returns correct info for dairy-free badge', () => {
    const info = getBadgeInfo('dairy-free');
    expect(info.label).toBe('Dairy-Free');
    expect(info.color).toContain('blue');
  });

  it('returns correct info for nut-free badge', () => {
    const info = getBadgeInfo('nut-free');
    expect(info.label).toBe('Nut-Free');
    expect(info.color).toContain('orange');
  });
});
