'use client';

import { useEffect, useState, useMemo } from 'react';
import { GroceryItem, IngredientCategory } from '@/types';
import { groupByCategory, formatQuantity } from '@/lib/merge-engine';
import { reorderByStoreLayout, loadStoreModePreference } from '@/lib/store-mode';

const DEFAULT_CATEGORIES: IngredientCategory[] = [
  'Produce',
  'Meat',
  'Dairy',
  'Pantry',
  'Frozen',
  'Spices',
  'Other',
];

function useGroceryItems() {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadItems = () => {
      try {
        const stored = localStorage.getItem('grocery-app-grocery-list');
        if (mounted) {
          setItems(stored ? JSON.parse(stored) : []);
          setIsLoading(false);
        }
      } catch {
        if (mounted) {
          setItems([]);
          setIsLoading(false);
        }
      }
    };

    loadItems();

    return () => {
      mounted = false;
    };
  }, []);

  return { items, isLoading };
}

export default function PrintPage() {
  const { items, isLoading } = useGroceryItems();
  const [storeMode] = useState(() => loadStoreModePreference());

  const grouped = useMemo(() => groupByCategory(items), [items]);

  // Compute ordered categories based on store mode
  const categories = useMemo(() => {
    if (storeMode) {
      return reorderByStoreLayout(DEFAULT_CATEGORIES, 'default');
    }
    return DEFAULT_CATEGORIES;
  }, [storeMode]);

  useEffect(() => {
    if (!isLoading && items.length > 0) {
      window.print();
    }
  }, [isLoading, items.length]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No items in grocery list</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8 print:p-4">
      <style jsx global>{`
        @media print {
          @page {
            margin: 1cm;
          }
          body {
            font-size: 12pt;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <header className="mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold">Grocery List</h1>
        <p className="text-gray-500 text-sm">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
        {storeMode && (
          <p className="text-green-600 text-sm font-medium mt-1">
            Organized for store shopping
          </p>
        )}
      </header>

      <button
        onClick={() => window.print()}
        className="no-print mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Print
      </button>

      <div className="space-y-6">
        {categories.map((category) => {
          const categoryItems = grouped[category];
          if (categoryItems.length === 0) return null;

          return (
            <section key={category}>
              <h2 className="text-lg font-semibold border-b pb-1 mb-2">{category}</h2>
              <ul className="space-y-1">
                {categoryItems.map((item) => (
                  <li key={item.id} className="flex items-start gap-2">
                    <span className="inline-block w-4 h-4 border border-gray-400 mt-0.5 flex-shrink-0" />
                    <span className={item.checked ? 'line-through text-gray-400' : ''}>
                      <span className="font-medium">{formatQuantity(item.quantity)}</span>{' '}
                      {item.unit} {item.name}
                      {item.notes && (
                        <span className="text-gray-500 text-sm"> ({item.notes})</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <footer className="mt-8 pt-4 border-t text-sm text-gray-500 no-print">
        <p>Total items: {items.length}</p>
        <p>Checked: {items.filter((i) => i.checked).length}</p>
      </footer>
    </div>
  );
}
