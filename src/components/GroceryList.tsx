'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { GroceryItem, IngredientCategory } from '@/types';
import { groupByCategory, formatQuantity, exportAsText } from '@/lib/merge-engine';
import { reorderByStoreLayout, STORE_LAYOUTS } from '@/lib/store-mode';
import { StoreModeToggle } from './StoreModeToggle';
import { Confetti } from './Confetti';

interface GroceryListProps {
  items: GroceryItem[];
  onToggleItem: (itemId: string) => void;
  onUpdateItem: (itemId: string, updates: Partial<GroceryItem>) => void;
  onDeleteItem: (itemId: string) => void;
  onAddItem: (item: Omit<GroceryItem, 'id' | 'checked' | 'sourceRecipes'>) => void;
  onReset: () => void;
  storeMode?: boolean;
  onToggleStoreMode?: () => void;
}

const DEFAULT_CATEGORIES: IngredientCategory[] = [
  'Produce',
  'Meat',
  'Dairy',
  'Pantry',
  'Frozen',
  'Spices',
  'Other',
];

interface EditingState {
  itemId: string;
  field: 'name' | 'quantity' | 'unit' | 'category';
}

export function GroceryList({
  items,
  onToggleItem,
  onUpdateItem,
  onDeleteItem,
  onAddItem,
  onReset,
  storeMode = false,
  onToggleStoreMode,
}: GroceryListProps) {
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(
    new Set()
  );
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: 1,
    unit: 'item',
    category: 'Other' as IngredientCategory,
  });
  const [showCelebration, setShowCelebration] = useState(false);
  const prevRemainingRef = useRef<number | null>(null);

  const grouped = groupByCategory(items);

  // Compute ordered categories based on store mode
  const categories = useMemo(() => {
    if (storeMode) {
      return reorderByStoreLayout(DEFAULT_CATEGORIES, 'default');
    }
    return DEFAULT_CATEGORIES;
  }, [storeMode]);

  // Calculate remaining items for store mode progress
  const remainingCount = items.filter((i) => !i.checked).length;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? ((totalCount - remainingCount) / totalCount) * 100 : 0;

  // Trigger celebration when all items are checked in store mode
  useEffect(() => {
    if (storeMode && totalCount > 0 && remainingCount === 0 && prevRemainingRef.current !== 0) {
      setShowCelebration(true);
      // Reset celebration after animation completes
      const timer = setTimeout(() => setShowCelebration(false), 4000);
      return () => clearTimeout(timer);
    }
    prevRemainingRef.current = remainingCount;
  }, [storeMode, remainingCount, totalCount]);

  const toggleCategory = (category: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const startEditing = (
    itemId: string,
    field: 'name' | 'quantity' | 'unit' | 'category',
    currentValue: string | number
  ) => {
    setEditing({ itemId, field });
    setEditValue(String(currentValue));
  };

  const saveEdit = () => {
    if (!editing) return;

    const updates: Partial<GroceryItem> = {};
    if (editing.field === 'quantity') {
      const num = parseFloat(editValue);
      if (!isNaN(num) && num > 0) {
        updates.quantity = num;
      }
    } else if (editing.field === 'category') {
      updates.category = editValue as IngredientCategory;
    } else {
      updates[editing.field] = editValue;
    }

    if (Object.keys(updates).length > 0) {
      onUpdateItem(editing.itemId, updates);
    }
    setEditing(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      setEditing(null);
    }
  };

  const handleCopyToClipboard = async () => {
    const text = exportAsText(grouped);
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const text = exportAsText(grouped);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'grocery-list.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.open('/print', '_blank');
  };

  const handleAddItem = () => {
    if (newItem.name.trim()) {
      onAddItem({
        name: newItem.name.trim(),
        quantity: newItem.quantity,
        unit: newItem.unit,
        category: newItem.category,
      });
      setNewItem({
        name: '',
        quantity: 1,
        unit: 'item',
        category: 'Other',
      });
      setShowAddForm(false);
    }
  };

  const checkedCount = items.filter((i) => i.checked).length;

  return (
    <div className="flex flex-col h-full">
      {/* Confetti Celebration */}
      <Confetti active={showCelebration} duration={4000} />

      {/* Store Mode Progress Header */}
      {storeMode && totalCount > 0 && (
        <div className="sticky top-0 z-10 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg p-4 mb-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="font-semibold">Shopping Mode</span>
            </div>
            <span className="text-lg font-bold">
              {remainingCount} of {totalCount} remaining
            </span>
          </div>
          <div className="w-full bg-white/30 rounded-full h-3">
            <div
              className="bg-white rounded-full h-3 transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {remainingCount === 0 && (
            <p className="text-center mt-2 text-sm font-medium animate-pulse">
              All done! Great shopping trip!
            </p>
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Grocery List</h2>
          <p className="text-sm text-gray-500">
            {checkedCount}/{items.length} items checked
          </p>
        </div>
        <div className="flex gap-2">
          {/* Store Mode Toggle */}
          {onToggleStoreMode && (
            <StoreModeToggle enabled={storeMode} onToggle={onToggleStoreMode} />
          )}
          <button
            onClick={handleCopyToClipboard}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Copy to clipboard"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          <button
            onClick={handleDownload}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Download as .txt"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
          <button
            onClick={handlePrint}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Print-friendly view"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
          </button>
          <button
            onClick={onReset}
            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            title="Reset all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Add Item Button */}
      {!showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="mb-4 w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg hover:border-gray-400 hover:text-gray-600 transition-colors"
        >
          + Add custom item
        </button>
      )}

      {/* Add Item Form */}
      {showAddForm && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 gap-2 mb-2">
            <input
              type="text"
              placeholder="Item name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="col-span-2 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <input
              type="number"
              placeholder="Qty"
              value={newItem.quantity}
              onChange={(e) =>
                setNewItem({ ...newItem, quantity: parseFloat(e.target.value) || 1 })
              }
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0.25"
              step="0.25"
            />
            <input
              type="text"
              placeholder="Unit"
              value={newItem.unit}
              onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={newItem.category}
              onChange={(e) =>
                setNewItem({ ...newItem, category: e.target.value as IngredientCategory })
              }
              className="col-span-2 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddItem}
              className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Add Item
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="py-2 px-4 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Grocery Items by Category */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {categories.map((category) => {
          const categoryItems = grouped[category];
          if (categoryItems.length === 0) return null;

          const isCollapsed = collapsedCategories.has(category);
          const checkedInCategory = categoryItems.filter((i) => i.checked).length;

          return (
            <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      isCollapsed ? '' : 'rotate-90'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                  <span className="font-medium text-gray-900">{category}</span>
                </div>
                <span className="text-sm text-gray-500">
                  {checkedInCategory}/{categoryItems.length}
                </span>
              </button>

              {!isCollapsed && (
                <div className="divide-y divide-gray-100">
                  {categoryItems.map((item) => (
                    <div
                      key={item.id}
                      data-testid={`grocery-item-${item.id}`}
                      data-grocery-item
                      className={`px-4 py-3 flex items-center gap-3 transition-all duration-300 ${
                        item.checked
                          ? storeMode
                            ? 'bg-green-50 opacity-60'
                            : 'bg-gray-50'
                          : 'hover:bg-gray-50'
                      } ${storeMode && item.checked ? 'order-last' : ''}`}
                    >
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => onToggleItem(item.id)}
                        className={`w-5 h-5 rounded border-gray-300 focus:ring-2 transition-colors ${
                          storeMode
                            ? 'text-green-600 focus:ring-green-500'
                            : 'text-blue-600 focus:ring-blue-500'
                        }`}
                      />

                      {/* Item Details */}
                      <div
                        className={`flex-1 ${
                          item.checked ? 'line-through text-gray-400' : ''
                        }`}
                      >
                        {/* Quantity */}
                        {editing?.itemId === item.id && editing.field === 'quantity' ? (
                          <input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={saveEdit}
                            onKeyDown={handleKeyDown}
                            className="w-16 px-1 border border-blue-500 rounded"
                            autoFocus
                            min="0.25"
                            step="0.25"
                          />
                        ) : (
                          <span
                            onClick={() => startEditing(item.id, 'quantity', item.quantity)}
                            className="cursor-pointer hover:bg-blue-100 px-1 rounded"
                          >
                            {formatQuantity(item.quantity)}
                          </span>
                        )}{' '}
                        {/* Unit */}
                        {editing?.itemId === item.id && editing.field === 'unit' ? (
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={saveEdit}
                            onKeyDown={handleKeyDown}
                            className="w-16 px-1 border border-blue-500 rounded"
                            autoFocus
                          />
                        ) : (
                          <span
                            onClick={() => startEditing(item.id, 'unit', item.unit)}
                            className="cursor-pointer hover:bg-blue-100 px-1 rounded"
                          >
                            {item.unit}
                          </span>
                        )}{' '}
                        {/* Name */}
                        {editing?.itemId === item.id && editing.field === 'name' ? (
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={saveEdit}
                            onKeyDown={handleKeyDown}
                            className="w-40 px-1 border border-blue-500 rounded"
                            autoFocus
                          />
                        ) : (
                          <span
                            onClick={() => startEditing(item.id, 'name', item.name)}
                            className="cursor-pointer hover:bg-blue-100 px-1 rounded font-medium"
                          >
                            {item.name}
                          </span>
                        )}
                        {item.notes && (
                          <span className="text-gray-400 text-sm ml-1">
                            ({item.notes})
                          </span>
                        )}
                      </div>

                      {/* Category Selector */}
                      {editing?.itemId === item.id && editing.field === 'category' ? (
                        <select
                          value={editValue}
                          onChange={(e) => {
                            setEditValue(e.target.value);
                            setTimeout(saveEdit, 0);
                          }}
                          onBlur={saveEdit}
                          className="text-xs px-2 py-1 border border-blue-500 rounded"
                          autoFocus
                        >
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <button
                          onClick={() => startEditing(item.id, 'category', item.category)}
                          className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded hover:bg-gray-100"
                        >
                          {item.category}
                        </button>
                      )}

                      {/* Delete Button */}
                      <button
                        onClick={() => onDeleteItem(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        aria-label="Delete item"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
