'use client';

import { useState } from 'react';
import { Recipe, Ingredient, IngredientCategory } from '@/types';
import { detectCategory } from '@/lib/merge-engine';

interface RecipeManagerProps {
  recipe?: Recipe;
  onSave: (recipe: Omit<Recipe, 'id'> & { id?: string }) => void;
  onCancel: () => void;
}

const CATEGORIES: IngredientCategory[] = [
  'Produce',
  'Meat',
  'Dairy',
  'Pantry',
  'Frozen',
  'Spices',
  'Other',
];

const CUISINE_OPTIONS = [
  'American',
  'Asian',
  'Chinese',
  'French',
  'Indian',
  'Italian',
  'Japanese',
  'Korean',
  'Mediterranean',
  'Mexican',
  'Thai',
  'Vietnamese',
  'Other',
];

export function RecipeManager({ recipe, onSave, onCancel }: RecipeManagerProps) {
  const [name, setName] = useState(recipe?.name || '');
  const [cuisine, setCuisine] = useState(recipe?.cuisine || 'American');
  const [tags, setTags] = useState<string[]>(recipe?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [servingsBase, setServingsBase] = useState(recipe?.servingsBase || 4);
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    recipe?.ingredients || []
  );
  const [newIngredient, setNewIngredient] = useState<Partial<Ingredient>>({
    name: '',
    quantity: 1,
    unit: 'item',
    category: 'Other',
    notes: '',
  });

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleAddIngredient = () => {
    if (newIngredient.name?.trim()) {
      const category = newIngredient.category || detectCategory(newIngredient.name);
      setIngredients([
        ...ingredients,
        {
          name: newIngredient.name.trim(),
          quantity: newIngredient.quantity || 1,
          unit: newIngredient.unit || 'item',
          category,
          notes: newIngredient.notes?.trim() || undefined,
        },
      ]);
      setNewIngredient({
        name: '',
        quantity: 1,
        unit: 'item',
        category: 'Other',
        notes: '',
      });
    }
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!name.trim() || ingredients.length === 0) {
      alert('Please provide a recipe name and at least one ingredient.');
      return;
    }

    onSave({
      id: recipe?.id,
      name: name.trim(),
      cuisine,
      tags,
      servingsBase,
      ingredients,
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        {recipe ? 'Edit Recipe' : 'Create New Recipe'}
      </h2>

      {/* Basic Info */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Recipe Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Spaghetti Bolognese"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cuisine
            </label>
            <select
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              {CUISINE_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Base Servings
            </label>
            <input
              type="number"
              value={servingsBase}
              onChange={(e) => setServingsBase(parseInt(e.target.value) || 1)}
              min="1"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tags
          </label>
          <div className="flex gap-2 mb-2 flex-wrap">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded"
              >
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-red-600"
                  aria-label={`Remove tag ${tag}`}
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              placeholder="Add a tag"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Ingredients */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
          Ingredients ({ingredients.length})
        </h3>

        {ingredients.length > 0 && (
          <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
            {ingredients.map((ing, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded"
              >
                <span className="flex-1 text-sm dark:text-white">
                  {ing.quantity} {ing.unit} {ing.name}
                  {ing.notes && (
                    <span className="text-gray-400 ml-1">({ing.notes})</span>
                  )}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {ing.category}
                </span>
                <button
                  onClick={() => handleRemoveIngredient(index)}
                  className="text-red-500 hover:text-red-700 p-1"
                  aria-label="Remove ingredient"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-12 gap-2 items-end">
          <div className="col-span-2">
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Qty</label>
            <input
              type="number"
              value={newIngredient.quantity || ''}
              onChange={(e) =>
                setNewIngredient({ ...newIngredient, quantity: parseFloat(e.target.value) || 1 })
              }
              min="0.25"
              step="0.25"
              className="w-full px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Unit</label>
            <input
              type="text"
              value={newIngredient.unit || ''}
              onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
              placeholder="item"
              className="w-full px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="col-span-4">
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Name</label>
            <input
              type="text"
              value={newIngredient.name || ''}
              onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
              placeholder="Ingredient name"
              className="w-full px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Category</label>
            <select
              value={newIngredient.category || 'Other'}
              onChange={(e) =>
                setNewIngredient({ ...newIngredient, category: e.target.value as IngredientCategory })
              }
              className="w-full px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <button
              type="button"
              onClick={handleAddIngredient}
              className="w-full py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        </div>
        <div className="mt-2">
          <input
            type="text"
            value={newIngredient.notes || ''}
            onChange={(e) => setNewIngredient({ ...newIngredient, notes: e.target.value })}
            placeholder="Notes (optional, e.g., diced, minced)"
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t dark:border-gray-700">
        <button
          onClick={onCancel}
          className="px-6 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {recipe ? 'Save Changes' : 'Create Recipe'}
        </button>
      </div>
    </div>
  );
}

interface RecipeImportExportProps {
  recipes: Recipe[];
  onImport: (recipes: Recipe[]) => void;
}

export function RecipeImportExport({ recipes, onImport }: RecipeImportExportProps) {
  const handleExport = () => {
    const data = JSON.stringify(recipes, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recipes.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          // Validate and add unique IDs
          const validRecipes = imported
            .filter(
              (r): r is Recipe =>
                typeof r.name === 'string' &&
                Array.isArray(r.ingredients)
            )
            .map((r) => ({
              ...r,
              id: r.id || Math.random().toString(36).substring(2, 11),
            }));
          onImport(validRecipes);
          alert(`Imported ${validRecipes.length} recipes!`);
        }
      } catch {
        alert('Failed to import recipes. Please check the file format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleExport}
        className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-500 flex items-center gap-1"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Export
      </button>
      <label className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-500 flex items-center gap-1 cursor-pointer">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        Import
        <input
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
      </label>
    </div>
  );
}
