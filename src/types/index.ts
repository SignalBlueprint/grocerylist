export type IngredientCategory =
  | 'Produce'
  | 'Pantry'
  | 'Dairy'
  | 'Meat'
  | 'Frozen'
  | 'Spices'
  | 'Other';

export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
  notes?: string;
  category?: IngredientCategory;
}

export interface Recipe {
  id: string;
  name: string;
  cuisine: string;
  tags: string[];
  servingsBase: number;
  ingredients: Ingredient[];
}

export interface SelectedRecipe {
  recipeId: string;
  servings: number;
}

export interface GroceryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: IngredientCategory;
  notes?: string;
  checked: boolean;
  sourceRecipes: string[];
}

export interface AppState {
  selectedRecipes: SelectedRecipe[];
  groceryList: GroceryItem[];
}
