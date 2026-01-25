'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Recipe, SelectedRecipe, GroceryItem, IngredientCategory } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { scaleIngredients, mergeIngredients } from '@/lib/merge-engine';
import { parseShareUrl } from '@/lib/share';
import {
  loadStoreModePreference,
  saveStoreModePreference,
} from '@/lib/store-mode';
import { RecipeList } from '@/components/RecipeList';
import { SelectedRecipes } from '@/components/SelectedRecipes';
import { GroceryList } from '@/components/GroceryList';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ShareModal } from '@/components/ShareModal';
import { RecipeManager, RecipeImportExport } from '@/components/RecipeManager';
import { AppSkeleton } from '@/components/Skeleton';
import { Providers } from './providers';
import recipesData from '../../data/recipes.json';

const defaultRecipes: Recipe[] = recipesData as Recipe[];

type View = 'recipes' | 'list';

function HomeContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<View>('recipes');
  const [selectedRecipes, setSelectedRecipes, clearSelectedRecipes] = useLocalStorage<SelectedRecipe[]>(
    'grocery-app-selected-recipes',
    []
  );
  const [customRecipes, setCustomRecipes] = useLocalStorage<Recipe[]>(
    'grocery-app-custom-recipes',
    []
  );
  const [groceryList, setGroceryListRaw, clearGroceryList] = useLocalStorage<GroceryItem[]>(
    'grocery-app-grocery-list',
    []
  );
  const [groceryListState, setGroceryList, { undo, redo, canUndo, canRedo, reset: resetHistory }] =
    useUndoRedo<GroceryItem[]>(groceryList);

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showRecipeManager, setShowRecipeManager] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [storeMode, setStoreMode] = useState(() => loadStoreModePreference());

  // Handle store mode toggle
  const handleToggleStoreMode = useCallback(() => {
    setStoreMode((prev) => {
      const newValue = !prev;
      saveStoreModePreference(newValue);
      return newValue;
    });
  }, []);

  // Combine default and custom recipes
  const allRecipes = useMemo(
    () => [...defaultRecipes, ...customRecipes],
    [customRecipes]
  );

  const recipeMap = useMemo(() => new Map(allRecipes.map((r) => [r.id, r])), [allRecipes]);

  // Sync undo/redo state with localStorage
  useEffect(() => {
    setGroceryListRaw(groceryListState);
  }, [groceryListState, setGroceryListRaw]);

  // Initialize from localStorage and check for shared lists
  useEffect(() => {
    // Check for shared list in URL
    if (typeof window !== 'undefined') {
      const sharedList = parseShareUrl(window.location.href);
      if (sharedList && sharedList.length > 0) {
        setGroceryList(sharedList);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setView('list');
        // Clean up URL
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
    setIsLoading(false);
  }, [setGroceryList]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        if (e.shiftKey && canRedo) {
          e.preventDefault();
          redo();
        } else if (!e.shiftKey && canUndo) {
          e.preventDefault();
          undo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, canUndo, canRedo]);

  const handleSelectRecipe = useCallback(
    (recipeId: string) => {
      setSelectedRecipes((prev) => {
        const exists = prev.find((sr) => sr.recipeId === recipeId);
        if (exists) {
          return prev.filter((sr) => sr.recipeId !== recipeId);
        }
        const recipe = recipeMap.get(recipeId);
        return [...prev, { recipeId, servings: recipe?.servingsBase ?? 4 }];
      });
    },
    [setSelectedRecipes, recipeMap]
  );

  const handleRemoveRecipe = useCallback(
    (recipeId: string) => {
      setSelectedRecipes((prev) => prev.filter((sr) => sr.recipeId !== recipeId));
    },
    [setSelectedRecipes]
  );

  const handleServingsChange = useCallback(
    (recipeId: string, servings: number) => {
      setSelectedRecipes((prev) =>
        prev.map((sr) => (sr.recipeId === recipeId ? { ...sr, servings } : sr))
      );
    },
    [setSelectedRecipes]
  );

  const handleGenerateList = useCallback(() => {
    const allIngredients: Array<{
      name: string;
      quantity: number;
      unit: string;
      notes?: string;
      category?: IngredientCategory;
      sourceRecipe: string;
    }> = [];

    for (const selected of selectedRecipes) {
      const recipe = recipeMap.get(selected.recipeId);
      if (!recipe) continue;

      const ratio = selected.servings / recipe.servingsBase;
      const scaled = scaleIngredients(recipe.ingredients, ratio);

      for (const ing of scaled) {
        allIngredients.push({
          ...ing,
          sourceRecipe: recipe.name,
        });
      }
    }

    const merged = mergeIngredients(allIngredients);
    resetHistory(merged);
    setView('list');
  }, [selectedRecipes, recipeMap, resetHistory]);

  const handleToggleItem = useCallback(
    (itemId: string) => {
      setGroceryList((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, checked: !item.checked } : item
        )
      );
    },
    [setGroceryList]
  );

  const handleUpdateItem = useCallback(
    (itemId: string, updates: Partial<GroceryItem>) => {
      setGroceryList((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, ...updates } : item))
      );
    },
    [setGroceryList]
  );

  const handleDeleteItem = useCallback(
    (itemId: string) => {
      setGroceryList((prev) => prev.filter((item) => item.id !== itemId));
    },
    [setGroceryList]
  );

  const handleAddItem = useCallback(
    (item: Omit<GroceryItem, 'id' | 'checked' | 'sourceRecipes'>) => {
      const newItem: GroceryItem = {
        ...item,
        id: Math.random().toString(36).substring(2, 11),
        checked: false,
        sourceRecipes: ['Custom'],
      };
      setGroceryList((prev) => [...prev, newItem]);
    },
    [setGroceryList]
  );

  const handleReset = useCallback(() => {
    if (confirm('Are you sure you want to reset everything?')) {
      clearSelectedRecipes();
      clearGroceryList();
      resetHistory([]);
      setView('recipes');
    }
  }, [clearSelectedRecipes, clearGroceryList, resetHistory]);

  const handleSaveRecipe = useCallback(
    (recipeData: Omit<Recipe, 'id'> & { id?: string }) => {
      const recipe: Recipe = {
        ...recipeData,
        id: recipeData.id || `custom-${Date.now()}`,
      };

      if (recipeData.id) {
        // Editing existing recipe
        setCustomRecipes((prev) =>
          prev.map((r) => (r.id === recipeData.id ? recipe : r))
        );
      } else {
        // Adding new recipe
        setCustomRecipes((prev) => [...prev, recipe]);
      }

      setShowRecipeManager(false);
      setEditingRecipe(null);
    },
    [setCustomRecipes]
  );

  const handleImportRecipes = useCallback(
    (recipes: Recipe[]) => {
      setCustomRecipes((prev) => {
        const existingIds = new Set(prev.map((r) => r.id));
        const newRecipes = recipes.filter((r) => !existingIds.has(r.id));
        return [...prev, ...newRecipes];
      });
    },
    [setCustomRecipes]
  );

  if (isLoading) {
    return <AppSkeleton />;
  }

  return (
    <>
      {/* Skip link for accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <main id="main-content" className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Grocery List Generator
            </h1>
            <div className="flex items-center gap-2">
              {view === 'list' && groceryListState.length > 0 && (
                <>
                  <button
                    onClick={undo}
                    disabled={!canUndo}
                    className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Undo"
                    title="Undo (Ctrl+Z)"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                  </button>
                  <button
                    onClick={redo}
                    disabled={!canRedo}
                    className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Redo"
                    title="Redo (Ctrl+Shift+Z)"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    aria-label="Share list"
                    title="Share"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </button>
                  <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />
                </>
              )}
              <ThemeToggle />
              <button
                onClick={() => setView('recipes')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  view === 'recipes'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                aria-pressed={view === 'recipes'}
              >
                Recipes
              </button>
              <button
                onClick={() => setView('list')}
                disabled={groceryListState.length === 0}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  view === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                aria-pressed={view === 'list'}
              >
                List ({groceryListState.length})
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 py-6">
          {view === 'recipes' ? (
            <>
              <div className="hidden md:grid md:grid-cols-2 gap-6 h-[calc(100vh-140px)]">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Recipe Library
                    </h2>
                    <div className="flex items-center gap-2">
                      <RecipeImportExport
                        recipes={customRecipes}
                        onImport={handleImportRecipes}
                      />
                      <button
                        onClick={() => {
                          setEditingRecipe(null);
                          setShowRecipeManager(true);
                        }}
                        className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
                        aria-label="Create new recipe"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New
                      </button>
                    </div>
                  </div>
                  <RecipeList
                    recipes={allRecipes}
                    selectedRecipes={selectedRecipes}
                    onSelectRecipe={handleSelectRecipe}
                  />
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 overflow-hidden flex flex-col">
                  <SelectedRecipes
                    recipes={allRecipes}
                    selectedRecipes={selectedRecipes}
                    onRemoveRecipe={handleRemoveRecipe}
                    onServingsChange={handleServingsChange}
                    onGenerateList={handleGenerateList}
                  />
                </div>
              </div>

              <div className="md:hidden">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Recipe Library
                    </h2>
                    <button
                      onClick={() => {
                        setEditingRecipe(null);
                        setShowRecipeManager(true);
                      }}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      aria-label="Create new recipe"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                  <RecipeList
                    recipes={allRecipes}
                    selectedRecipes={selectedRecipes}
                    onSelectRecipe={handleSelectRecipe}
                  />
                </div>

                {selectedRecipes.length > 0 && (
                  <button
                    onClick={() => setMobileDrawerOpen(true)}
                    className="fixed bottom-4 left-4 right-4 py-4 bg-green-600 text-white font-medium rounded-xl shadow-lg z-20 touch-target"
                    aria-label={`View ${selectedRecipes.length} selected recipes and generate list`}
                  >
                    View Selected ({selectedRecipes.length}) & Generate List
                  </button>
                )}

                {mobileDrawerOpen && (
                  <div
                    className="fixed inset-0 z-30 bg-black/50"
                    onClick={() => setMobileDrawerOpen(false)}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Selected recipes"
                  >
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-2xl p-4 max-h-[80vh] overflow-y-auto swipe-hint"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4" />
                      <SelectedRecipes
                        recipes={allRecipes}
                        selectedRecipes={selectedRecipes}
                        onRemoveRecipe={handleRemoveRecipe}
                        onServingsChange={handleServingsChange}
                        onGenerateList={() => {
                          handleGenerateList();
                          setMobileDrawerOpen(false);
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6 min-h-[calc(100vh-140px)]">
              <button
                onClick={() => setView('recipes')}
                className="mb-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Recipes
              </button>
              <GroceryList
                items={groceryListState}
                onToggleItem={handleToggleItem}
                onUpdateItem={handleUpdateItem}
                onDeleteItem={handleDeleteItem}
                onAddItem={handleAddItem}
                onReset={handleReset}
                storeMode={storeMode}
                onToggleStoreMode={handleToggleStoreMode}
              />
            </div>
          )}
        </div>
      </main>

      {/* Share Modal */}
      <ShareModal
        items={groceryListState}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />

      {/* Recipe Manager Modal */}
      {showRecipeManager && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => {
            setShowRecipeManager(false);
            setEditingRecipe(null);
          }}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <RecipeManager
              recipe={editingRecipe || undefined}
              onSave={handleSaveRecipe}
              onCancel={() => {
                setShowRecipeManager(false);
                setEditingRecipe(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Live region for screen reader announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
    </>
  );
}

export default function Home() {
  return (
    <Providers>
      <HomeContent />
    </Providers>
  );
}
