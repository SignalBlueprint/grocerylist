'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { GroceryItem, IngredientCategory } from '@/types';
import { groupByCategory, formatQuantity, exportAsText } from '@/lib/merge-engine';
import { reorderByStoreLayout } from '@/lib/store-mode';
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
        <div
          className="sticky top-0 z-10 text-white mb-4"
          style={{
            background: 'linear-gradient(135deg, var(--color-mint) 0%, var(--color-sage) 100%)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-lg)',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="font-semibold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                Shopping Mode
              </span>
            </div>
            <span className="text-lg font-bold">
              {remainingCount} of {totalCount}
            </span>
          </div>
          <div className="w-full rounded-full h-3" style={{ background: 'rgba(255, 255, 255, 0.25)' }}>
            <div
              className="rounded-full h-3"
              style={{
                background: 'white',
                width: `${progressPercent}%`,
                transition: 'width 500ms cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
            />
          </div>
          {remainingCount === 0 && (
            <p className="text-center mt-3 text-sm font-medium animate-pulse text-white">
              ✓ All done! Great shopping trip!
            </p>
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold" style={{
            color: 'var(--foreground)',
            fontFamily: 'var(--font-heading)'
          }}>
            Grocery List
          </h2>
          <p className="text-sm" style={{ color: 'var(--color-neutral-500)' }}>
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
            className="btn-ghost p-2"
            title="Copy to clipboard"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          <button
            onClick={handleDownload}
            className="btn-ghost p-2"
            title="Download as .txt"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
          <button
            onClick={handlePrint}
            className="btn-ghost p-2"
            title="Print-friendly view"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
          </button>
          <button
            onClick={onReset}
            className="btn-ghost p-2"
            style={{ color: 'var(--color-terracotta)' }}
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
          className="mb-4 w-full py-3 border-2 border-dashed font-medium"
          style={{
            borderColor: 'var(--color-neutral-300)',
            color: 'var(--color-neutral-500)',
            borderRadius: 'var(--radius-lg)',
            transition: 'all var(--transition-fast)'
          }}
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add custom item
          </span>
        </button>
      )}

      {/* Add Item Form */}
      {showAddForm && (
        <div className="mb-4 card" style={{
          padding: 'var(--space-lg)',
          background: 'var(--color-neutral-50)'
        }}>
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
              className="btn-primary flex-1"
            >
              Add Item
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="btn-ghost px-4"
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
            <div key={category} className="card overflow-hidden" style={{ padding: 0 }}>
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between"
                style={{
                  padding: 'var(--space-md) var(--space-lg)',
                  background: 'var(--color-neutral-50)',
                  transition: 'background var(--transition-fast)'
                }}
              >
                <div className="flex items-center gap-2">
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      isCollapsed ? '' : 'rotate-90'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ color: 'var(--color-sage)' }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                  <span className="font-semibold" style={{
                    color: 'var(--foreground)',
                    fontFamily: 'var(--font-heading)'
                  }}>
                    {category}
                  </span>
                </div>
                <span className="text-sm font-medium" style={{
                  color: 'var(--color-neutral-500)',
                  background: 'white',
                  padding: '0.25rem 0.625rem',
                  borderRadius: 'var(--radius-full)'
                }}>
                  {checkedInCategory}/{categoryItems.length}
                </span>
              </button>

              {!isCollapsed && (
                <div style={{ borderTop: '1px solid var(--color-neutral-200)' }}>
                  {categoryItems.map((item) => (
                    <div
                      key={item.id}
                      data-testid={`grocery-item-${item.id}`}
                      data-grocery-item
                      className={`flex items-center gap-3 transition-all duration-300 ${
                        storeMode && item.checked ? 'order-last' : ''
                      }`}
                      style={{
                        padding: 'var(--space-md) var(--space-lg)',
                        background: item.checked
                          ? storeMode
                            ? 'var(--color-neutral-50)'
                            : 'var(--color-neutral-50)'
                          : 'white',
                        opacity: item.checked && storeMode ? 0.6 : 1,
                        borderTop: '1px solid var(--color-neutral-100)'
                      }}
                    >
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => onToggleItem(item.id)}
                        className="w-5 h-5 rounded transition-colors"
                        style={{
                          borderColor: 'var(--color-neutral-300)',
                          accentColor: storeMode ? 'var(--color-mint)' : 'var(--color-sage)',
                          cursor: 'pointer'
                        }}
                      />

                      {/* Item Details */}
                      <div
                        className={`flex-1 ${item.checked ? 'line-through' : ''}`}
                        style={{
                          color: item.checked ? 'var(--color-neutral-400)' : 'var(--foreground)'
                        }}
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
