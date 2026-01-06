'use client';

import { useState, useCallback, useRef } from 'react';

interface UndoRedoOptions {
  maxHistory?: number;
}

interface UndoRedoState<T> {
  past: T[];
  present: T;
  future: T[];
}

export function useUndoRedo<T>(
  initialState: T,
  options: UndoRedoOptions = {}
): [
  T,
  (newState: T | ((prev: T) => T)) => void,
  {
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    clear: () => void;
    reset: (newState: T) => void;
  }
] {
  const { maxHistory = 50 } = options;

  const [state, setState] = useState<UndoRedoState<T>>({
    past: [],
    present: initialState,
    future: [],
  });

  // Track if we should skip recording the next state change
  const skipRecording = useRef(false);

  const set = useCallback(
    (newState: T | ((prev: T) => T)) => {
      setState((current) => {
        const resolvedNewState =
          typeof newState === 'function'
            ? (newState as (prev: T) => T)(current.present)
            : newState;

        // Don't record if we're undoing/redoing
        if (skipRecording.current) {
          skipRecording.current = false;
          return {
            ...current,
            present: resolvedNewState,
          };
        }

        // Limit history size
        const newPast = [...current.past, current.present].slice(-maxHistory);

        return {
          past: newPast,
          present: resolvedNewState,
          future: [],
        };
      });
    },
    [maxHistory]
  );

  const undo = useCallback(() => {
    setState((current) => {
      if (current.past.length === 0) return current;

      const previous = current.past[current.past.length - 1];
      const newPast = current.past.slice(0, -1);

      skipRecording.current = true;

      return {
        past: newPast,
        present: previous,
        future: [current.present, ...current.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState((current) => {
      if (current.future.length === 0) return current;

      const next = current.future[0];
      const newFuture = current.future.slice(1);

      skipRecording.current = true;

      return {
        past: [...current.past, current.present],
        present: next,
        future: newFuture,
      };
    });
  }, []);

  const clear = useCallback(() => {
    setState((current) => ({
      past: [],
      present: current.present,
      future: [],
    }));
  }, []);

  const reset = useCallback((newState: T) => {
    setState({
      past: [],
      present: newState,
      future: [],
    });
  }, []);

  return [
    state.present,
    set,
    {
      undo,
      redo,
      canUndo: state.past.length > 0,
      canRedo: state.future.length > 0,
      clear,
      reset,
    },
  ];
}
