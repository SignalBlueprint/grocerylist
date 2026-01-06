'use client';

import { useState, useMemo } from 'react';
import { Recipe, SelectedRecipe } from '@/types';
import { RecipeCard } from './RecipeCard';

interface RecipeListProps {
  recipes: Recipe[];
  selectedRecipes: SelectedRecipe[];
  onSelectRecipe: (recipeId: string) => void;
}

export function RecipeList({
  recipes,
  selectedRecipes,
  onSelectRecipe,
}: RecipeListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    recipes.forEach((recipe) => {
      recipe.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [recipes]);

  // Get all unique cuisines
  const allCuisines = useMemo(() => {
    const cuisines = new Set<string>();
    recipes.forEach((recipe) => cuisines.add(recipe.cuisine));
    return Array.from(cuisines).sort();
  }, [recipes]);

  // Filter recipes based on search and tag
  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      const matchesSearch =
        searchQuery === '' ||
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesTag =
        selectedTag === '' ||
        recipe.tags.includes(selectedTag) ||
        recipe.cuisine === selectedTag;

      return matchesSearch && matchesTag;
    });
  }, [recipes, searchQuery, selectedTag]);

  const selectedIds = new Set(selectedRecipes.map((sr) => sr.recipeId));

  return (
    <div className="flex flex-col h-full">
      {/* Search and Filter */}
      <div className="mb-4 space-y-3">
        <input
          type="text"
          placeholder="Search recipes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTag('')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              selectedTag === ''
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {allCuisines.map((cuisine) => (
            <button
              key={cuisine}
              onClick={() => setSelectedTag(cuisine === selectedTag ? '' : cuisine)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                selectedTag === cuisine
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cuisine}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? '' : tag)}
              className={`px-2 py-0.5 text-xs rounded transition-colors ${
                selectedTag === tag
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Recipe List */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {filteredRecipes.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No recipes found</p>
        ) : (
          filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isSelected={selectedIds.has(recipe.id)}
              onSelect={() => onSelectRecipe(recipe.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
