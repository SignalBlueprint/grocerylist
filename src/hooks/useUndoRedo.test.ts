import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUndoRedo } from './useUndoRedo';

describe('useUndoRedo', () => {
  describe('initialization', () => {
    it('initializes with provided initial state', () => {
      const { result } = renderHook(() => useUndoRedo(42));
      const [present] = result.current;
      expect(present).toBe(42);
    });

    it('initializes with no undo/redo capability', () => {
      const { result } = renderHook(() => useUndoRedo('initial'));
      const [, , { canUndo, canRedo }] = result.current;
      expect(canUndo).toBe(false);
      expect(canRedo).toBe(false);
    });

    it('handles object initial state', () => {
      const initialState = { count: 0, name: 'test' };
      const { result } = renderHook(() => useUndoRedo(initialState));
      const [present] = result.current;
      expect(present).toEqual({ count: 0, name: 'test' });
    });
  });

  describe('set function', () => {
    it('updates present state with new value', () => {
      const { result } = renderHook(() => useUndoRedo(0));
      const [, set] = result.current;

      act(() => {
        set(5);
      });

      const [present] = result.current;
      expect(present).toBe(5);
    });

    it('supports function updater pattern', () => {
      const { result } = renderHook(() => useUndoRedo(10));
      const [, set] = result.current;

      act(() => {
        set(prev => prev + 5);
      });

      const [present] = result.current;
      expect(present).toBe(15);
    });

    it('adds old state to past when updating', () => {
      const { result } = renderHook(() => useUndoRedo(1));
      const [, set] = result.current;

      act(() => {
        set(2);
      });

      const [, , { canUndo }] = result.current;
      expect(canUndo).toBe(true);
    });

    it('handles multiple consecutive set calls', () => {
      const { result } = renderHook(() => useUndoRedo(1));

      act(() => {
        const [, set] = result.current;
        set(2);
        set(3);
        set(4);
        set(5);
      });

      expect(result.current[0]).toBe(5);
      expect(result.current[2].canUndo).toBe(true);

      // Should be able to undo back through all states
      act(() => {
        const [, , { undo }] = result.current;
        undo();
        undo();
        undo();
        undo();
      });

      expect(result.current[0]).toBe(1);
      expect(result.current[2].canUndo).toBe(false);
    });
  });

  describe('undo functionality', () => {
    it('restores previous state when undoing', () => {
      const { result } = renderHook(() => useUndoRedo(1));
      const [, set, { undo }] = result.current;

      act(() => {
        set(2);
        set(3);
      });

      act(() => {
        undo();
      });

      expect(result.current[0]).toBe(2);
    });

    it('can undo multiple times', () => {
      const { result } = renderHook(() => useUndoRedo(1));
      const [, set, { undo }] = result.current;

      act(() => {
        set(2);
        set(3);
        set(4);
      });

      act(() => {
        undo();
        undo();
      });

      expect(result.current[0]).toBe(2);
    });

    it('does nothing when no history to undo', () => {
      const { result } = renderHook(() => useUndoRedo(1));
      const [, , { undo }] = result.current;

      act(() => {
        undo();
      });

      expect(result.current[0]).toBe(1);
    });

    it('updates canUndo flag correctly', () => {
      const { result } = renderHook(() => useUndoRedo(1));
      const [, set, { undo }] = result.current;

      act(() => {
        set(2);
      });

      expect(result.current[2].canUndo).toBe(true);

      act(() => {
        undo();
      });

      expect(result.current[2].canUndo).toBe(false);
    });

    it('moves present state to future when undoing', () => {
      const { result } = renderHook(() => useUndoRedo(1));
      const [, set, { undo }] = result.current;

      act(() => {
        set(2);
      });

      expect(result.current[2].canRedo).toBe(false);

      act(() => {
        undo();
      });

      expect(result.current[2].canRedo).toBe(true);
    });
  });

  describe('redo functionality', () => {
    it('restores next state when redoing', () => {
      const { result } = renderHook(() => useUndoRedo(1));
      const [, set, { undo, redo }] = result.current;

      act(() => {
        set(2);
        set(3);
      });

      act(() => {
        undo();
        undo();
      });

      expect(result.current[0]).toBe(1);

      act(() => {
        redo();
      });

      expect(result.current[0]).toBe(2);
    });

    it('can redo multiple times', () => {
      const { result } = renderHook(() => useUndoRedo(1));
      const [, set, { undo, redo }] = result.current;

      act(() => {
        set(2);
        set(3);
        set(4);
      });

      act(() => {
        undo();
        undo();
        undo();
      });

      act(() => {
        redo();
        redo();
      });

      expect(result.current[0]).toBe(3);
    });

    it('does nothing when no future to redo', () => {
      const { result } = renderHook(() => useUndoRedo(1));
      const [, set, { redo }] = result.current;

      act(() => {
        set(2);
      });

      act(() => {
        redo();
      });

      expect(result.current[0]).toBe(2);
    });

    it('updates canRedo flag correctly', () => {
      const { result } = renderHook(() => useUndoRedo(1));
      const [, set, { undo, redo }] = result.current;

      act(() => {
        set(2);
      });

      expect(result.current[2].canRedo).toBe(false);

      act(() => {
        undo();
      });

      expect(result.current[2].canRedo).toBe(true);

      act(() => {
        redo();
      });

      expect(result.current[2].canRedo).toBe(false);
    });
  });

  describe('clear functionality', () => {
    it('clears history while keeping present state', () => {
      const { result } = renderHook(() => useUndoRedo(1));
      const [, set, { clear }] = result.current;

      act(() => {
        set(2);
        set(3);
      });

      expect(result.current[2].canUndo).toBe(true);

      act(() => {
        clear();
      });

      expect(result.current[0]).toBe(3);
      expect(result.current[2].canUndo).toBe(false);
      expect(result.current[2].canRedo).toBe(false);
    });

    it('clears both past and future', () => {
      const { result } = renderHook(() => useUndoRedo(1));
      const [, set, { undo, clear }] = result.current;

      act(() => {
        set(2);
        set(3);
      });

      act(() => {
        undo();
      });

      expect(result.current[2].canUndo).toBe(true);
      expect(result.current[2].canRedo).toBe(true);

      act(() => {
        clear();
      });

      expect(result.current[2].canUndo).toBe(false);
      expect(result.current[2].canRedo).toBe(false);
    });
  });

  describe('reset functionality', () => {
    it('resets to new state and clears all history', () => {
      const { result } = renderHook(() => useUndoRedo(1));
      const [, set, { reset }] = result.current;

      act(() => {
        set(2);
        set(3);
      });

      act(() => {
        reset(100);
      });

      expect(result.current[0]).toBe(100);
      expect(result.current[2].canUndo).toBe(false);
      expect(result.current[2].canRedo).toBe(false);
    });

    it('can reset to different type of value', () => {
      const { result } = renderHook(() => useUndoRedo({ count: 0 }));
      const [, set, { reset }] = result.current;

      act(() => {
        set({ count: 5 });
      });

      act(() => {
        reset({ count: 100 });
      });

      expect(result.current[0]).toEqual({ count: 100 });
    });
  });

  describe('maxHistory option', () => {
    it('limits history to maxHistory entries', () => {
      const { result } = renderHook(() => useUndoRedo(0, { maxHistory: 3 }));
      const [, set, { undo }] = result.current;

      // Add 5 states, but only last 3 should be kept
      act(() => {
        set(1);
        set(2);
        set(3);
        set(4);
        set(5);
      });

      // Undo 3 times (should go back to 2, as 0 and 1 were removed)
      act(() => {
        undo();
        undo();
        undo();
      });

      expect(result.current[0]).toBe(2);
      expect(result.current[2].canUndo).toBe(false);
    });

    it('works with maxHistory of 1', () => {
      const { result } = renderHook(() => useUndoRedo(0, { maxHistory: 1 }));
      const [, set, { undo }] = result.current;

      act(() => {
        set(1);
        set(2);
        set(3);
      });

      act(() => {
        undo();
      });

      expect(result.current[0]).toBe(2);
      expect(result.current[2].canUndo).toBe(false);
    });
  });

  describe('complex scenarios', () => {
    it('handles undo/redo/set sequence correctly', () => {
      const { result } = renderHook(() => useUndoRedo(1));
      const [, set, { undo, redo }] = result.current;

      act(() => {
        set(2);
        set(3);
      });

      act(() => {
        undo();
      });

      expect(result.current[0]).toBe(2);

      act(() => {
        redo();
      });

      expect(result.current[0]).toBe(3);

      act(() => {
        set(4);
      });

      expect(result.current[0]).toBe(4);
      expect(result.current[2].canRedo).toBe(false);
    });

    it('works with complex object states', () => {
      type State = { items: string[]; count: number };
      const initialState: State = { items: [], count: 0 };
      const { result } = renderHook(() => useUndoRedo(initialState));
      const [, set, { undo }] = result.current;

      act(() => {
        set({ items: ['a'], count: 1 });
        set({ items: ['a', 'b'], count: 2 });
        set({ items: ['a', 'b', 'c'], count: 3 });
      });

      act(() => {
        undo();
        undo();
      });

      expect(result.current[0]).toEqual({ items: ['a'], count: 1 });
    });

    it('maintains referential independence of history states', () => {
      const { result } = renderHook(() => useUndoRedo({ value: 1 }));
      const [, set, { undo }] = result.current;

      act(() => {
        set({ value: 2 });
      });

      const currentState = result.current[0];

      act(() => {
        undo();
      });

      const previousState = result.current[0];

      expect(currentState).not.toBe(previousState);
      expect(currentState).toEqual({ value: 2 });
      expect(previousState).toEqual({ value: 1 });
    });
  });
});
