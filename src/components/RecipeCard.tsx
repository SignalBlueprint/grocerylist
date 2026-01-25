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
      <div className="card" style={{ padding: 'var(--space-lg)' }}>
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h3 className="font-medium" style={{
              color: 'var(--foreground)',
              fontSize: '1rem',
              marginBottom: 'var(--space-xs)'
            }}>
              {recipe.name}
            </h3>
            <p className="text-sm" style={{ color: 'var(--color-neutral-500)' }}>
              {recipe.cuisine}
            </p>
            {dietaryBadges.length > 0 && (
              <div className="mt-2">
                <DietaryBadgeList badges={dietaryBadges} maxDisplay={3} />
              </div>
            )}
          </div>
          <button
            onClick={onRemove}
            className="btn-ghost p-1 ml-2"
            style={{
              color: 'var(--color-neutral-400)',
              borderRadius: 'var(--radius-md)'
            }}
            aria-label="Remove recipe"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-3 mt-4 pt-3" style={{
          borderTop: '1px solid var(--color-neutral-200)'
        }}>
          <label className="text-sm font-medium" style={{ color: 'var(--color-neutral-600)' }}>
            Servings:
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onServingsChange(Math.max(1, currentServings - 1))}
              className="w-8 h-8 flex items-center justify-center font-medium"
              style={{
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-neutral-100)',
                color: 'var(--color-sage)',
                transition: 'all var(--transition-fast)'
              }}
              aria-label="Decrease servings"
            >
              −
            </button>
            <span className="w-10 text-center font-semibold" style={{
              fontSize: '1.125rem',
              color: 'var(--foreground)'
            }}>
              {currentServings}
            </span>
            <button
              onClick={() => onServingsChange(currentServings + 1)}
              className="w-8 h-8 flex items-center justify-center font-medium"
              style={{
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-neutral-100)',
                color: 'var(--color-sage)',
                transition: 'all var(--transition-fast)'
              }}
              aria-label="Increase servings"
            >
              +
            </button>
          </div>
          <span className="text-xs ml-auto" style={{ color: 'var(--color-neutral-400)' }}>
            base: {recipe.servingsBase}
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
      className={`card card-interactive w-full text-left ${isSelected ? 'selected' : ''}`}
      style={{
        padding: 'var(--space-lg)',
        border: isSelected ? '2px solid var(--color-sage)' : '1px solid var(--color-neutral-200)',
        background: isSelected ? 'var(--color-neutral-50)' : 'white'
      }}
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate" style={{
            color: 'var(--foreground)',
            fontSize: '1rem',
            marginBottom: 'var(--space-xs)',
            fontFamily: 'var(--font-heading)'
          }}>
            {recipe.name}
          </h3>
          <p className="text-sm" style={{ color: 'var(--color-neutral-500)' }}>
            {recipe.cuisine}
          </p>
        </div>
        {isSelected && (
          <span className="text-xs px-2.5 py-1 font-medium whitespace-nowrap" style={{
            background: 'var(--color-sage)',
            color: 'white',
            borderRadius: 'var(--radius-full)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            ✓ Selected
          </span>
        )}
      </div>
      {dietaryBadges.length > 0 && (
        <div className="mt-3">
          <DietaryBadgeList badges={dietaryBadges} maxDisplay={4} />
        </div>
      )}
      {recipe.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {recipe.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-1"
              style={{
                background: 'var(--color-neutral-100)',
                color: 'var(--color-neutral-600)',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 500
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center gap-3 mt-3 pt-3" style={{
        borderTop: '1px solid var(--color-neutral-200)',
        fontSize: '0.8125rem',
        color: 'var(--color-neutral-500)'
      }}>
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {recipe.servingsBase}
        </span>
        <span style={{ color: 'var(--color-neutral-300)' }}>•</span>
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          {recipe.ingredients.length} items
        </span>
      </div>
    </button>
  );
}
