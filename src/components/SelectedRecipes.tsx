'use client';

import { Recipe, SelectedRecipe } from '@/types';
import { RecipeCard } from './RecipeCard';

interface SelectedRecipesProps {
  recipes: Recipe[];
  selectedRecipes: SelectedRecipe[];
  onRemoveRecipe: (recipeId: string) => void;
  onServingsChange: (recipeId: string, servings: number) => void;
  onGenerateList: () => void;
}

export function SelectedRecipes({
  recipes,
  selectedRecipes,
  onRemoveRecipe,
  onServingsChange,
  onGenerateList,
}: SelectedRecipesProps) {
  const recipeMap = new Map(recipes.map((r) => [r.id, r]));

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Selected Recipes ({selectedRecipes.length})
        </h2>
      </div>

      {selectedRecipes.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500 text-center">
            Select recipes from the list to get started
          </p>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto space-y-3 mb-4">
            {selectedRecipes.map((selected) => {
              const recipe = recipeMap.get(selected.recipeId);
              if (!recipe) return null;
              return (
                <RecipeCard
                  key={selected.recipeId}
                  recipe={recipe}
                  isSelected={true}
                  servings={selected.servings}
                  onSelect={() => {}}
                  onRemove={() => onRemoveRecipe(selected.recipeId)}
                  onServingsChange={(servings) =>
                    onServingsChange(selected.recipeId, servings)
                  }
                />
              );
            })}
          </div>
          <button
            onClick={onGenerateList}
            className="w-full py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm"
          >
            Generate Grocery List
          </button>
        </>
      )}
    </div>
  );
}
