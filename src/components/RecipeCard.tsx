'use client';

import { useMemo } from 'react';
import { Recipe } from '@/types';
import { detectDietaryBadges } from '@/lib/dietary-utils';
import { DietaryBadgeList } from './DietaryBadge';

interface RecipeCardProps {
  recipe: Recipe;
  isSelected: boolean;
  servings?: number;
  onSelect: () => void;
  onRemove?: () => void;
  onServingsChange?: (servings: number) => void;
}

export function RecipeCard({
  recipe,
  isSelected,
  servings,
  onSelect,
  onRemove,
  onServingsChange,
}: RecipeCardProps) {
  const currentServings = servings ?? recipe.servingsBase;

  // Compute dietary badges from ingredients
  const dietaryBadges = useMemo(
    () => detectDietaryBadges(recipe.ingredients),
    [recipe.ingredients]
  );

  if (isSelected && onRemove && onServingsChange) {
    // Selected recipe card view
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-medium text-gray-900">{recipe.name}</h3>
            <p className="text-sm text-gray-500">{recipe.cuisine}</p>
            {dietaryBadges.length > 0 && (
              <div className="mt-1">
                <DietaryBadgeList badges={dietaryBadges} maxDisplay={3} />
              </div>
            )}
          </div>
          <button
            onClick={onRemove}
            className="text-gray-400 hover:text-red-500 transition-colors"
            aria-label="Remove recipe"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <label className="text-sm text-gray-600">Servings:</label>
          <button
            onClick={() => onServingsChange(Math.max(1, currentServings - 1))}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            aria-label="Decrease servings"
          >
            -
          </button>
          <span className="w-8 text-center font-medium">{currentServings}</span>
          <button
            onClick={() => onServingsChange(currentServings + 1)}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            aria-label="Increase servings"
          >
            +
          </button>
          <span className="text-xs text-gray-400 ml-2">
            (base: {recipe.servingsBase})
          </span>
        </div>
      </div>
    );
  }

  // Recipe list card view
  return (
    <button
      onClick={onSelect}
      data-testid={`recipe-card-${recipe.id}`}
      data-recipe-card
      className={`w-full text-left p-4 rounded-lg border transition-all ${
        isSelected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-gray-900">{recipe.name}</h3>
          <p className="text-sm text-gray-500">{recipe.cuisine}</p>
        </div>
        {isSelected && (
          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
            Selected
          </span>
        )}
      </div>
      {dietaryBadges.length > 0 && (
        <div className="mt-2">
          <DietaryBadgeList badges={dietaryBadges} maxDisplay={4} />
        </div>
      )}
      <div className="flex flex-wrap gap-1 mt-2">
        {recipe.tags.map((tag) => (
          <span
            key={tag}
            className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
          >
            {tag}
          </span>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-2">
        {recipe.servingsBase} servings • {recipe.ingredients.length} ingredients
      </p>
    </button>
  );
}
