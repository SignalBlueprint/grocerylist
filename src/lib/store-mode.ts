import { IngredientCategory } from '@/types';

/**
 * Store layout configurations for different store types
 * The order reflects typical grocery store aisle arrangement
 */
export const STORE_LAYOUTS = {
  /**
   * Default layout based on typical US grocery store:
   * - Produce is usually at the entrance
   * - Dairy is often along the back wall
   * - Meat is adjacent to dairy
   * - Frozen is typically in aisles or along a wall
   * - Pantry items are in center aisles
   * - Spices are usually in the baking/pantry section
   * - Other items vary
   */
  default: [
    'Produce',
    'Dairy',
    'Meat',
    'Frozen',
    'Pantry',
    'Spices',
    'Other',
  ] as IngredientCategory[],

  /**
   * Perimeter-first layout (shop the edges first)
   * Good for fresh food focused shopping
   */
  perimeterFirst: [
    'Produce',
    'Meat',
    'Dairy',
    'Frozen',
    'Pantry',
    'Spices',
    'Other',
  ] as IngredientCategory[],
};

export type StoreLayoutName = keyof typeof STORE_LAYOUTS;

/**
 * Default category order when store mode is OFF
 * This is the standard order used in the app
 */
export const DEFAULT_CATEGORY_ORDER: IngredientCategory[] = [
  'Produce',
  'Meat',
  'Dairy',
  'Pantry',
  'Frozen',
  'Spices',
  'Other',
];

/**
 * Reorders categories based on the selected store layout
 *
 * @param categories - Array of categories to reorder
 * @param layout - The store layout to use (defaults to 'default')
 * @returns Categories sorted according to store layout
 */
export function reorderByStoreLayout(
  categories: IngredientCategory[],
  layout: StoreLayoutName = 'default'
): IngredientCategory[] {
  const layoutOrder = STORE_LAYOUTS[layout];

  return [...categories].sort((a, b) => {
    const indexA = layoutOrder.indexOf(a);
    const indexB = layoutOrder.indexOf(b);

    // If category not in layout, put it at the end
    const orderA = indexA === -1 ? layoutOrder.length : indexA;
    const orderB = indexB === -1 ? layoutOrder.length : indexB;

    return orderA - orderB;
  });
}

/**
 * Gets the display name for a store layout
 */
export function getLayoutDisplayName(layout: StoreLayoutName): string {
  const names: Record<StoreLayoutName, string> = {
    default: 'Standard Store Layout',
    perimeterFirst: 'Perimeter First',
  };
  return names[layout];
}

/**
 * LocalStorage key for persisting store mode preference
 */
export const STORE_MODE_STORAGE_KEY = 'grocery-store-mode';

/**
 * LocalStorage key for persisting layout preference
 */
export const STORE_LAYOUT_STORAGE_KEY = 'grocery-store-layout';

/**
 * Saves store mode preference to localStorage
 */
export function saveStoreModePreference(enabled: boolean): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORE_MODE_STORAGE_KEY, JSON.stringify(enabled));
  }
}

/**
 * Loads store mode preference from localStorage
 */
export function loadStoreModePreference(): boolean {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORE_MODE_STORAGE_KEY);
    if (saved !== null) {
      try {
        return JSON.parse(saved);
      } catch {
        return false;
      }
    }
  }
  return false;
}
