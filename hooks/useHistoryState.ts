
import { useState, useCallback } from 'react';

// A custom hook to manage state history for undo/redo functionality.
export const useHistoryState = <T>(initialState: T) => {
  const [history, setHistory] = useState<T[]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const state = history[currentIndex];

  const setState = useCallback((newState: T | ((prevState: T) => T)) => {
    // Resolve the new state, whether it's a value or a function
    const resolvedState = typeof newState === 'function'
      ? (newState as (prevState: T) => T)(state)
      : newState;
    
    // Prevent adding to history if the state hasn't changed
    if (JSON.stringify(resolvedState) === JSON.stringify(state)) {
        return;
    }

    // If we're at a past point in history, new changes should overwrite the "future"
    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(resolvedState);

    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
  }, [history, currentIndex, state]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, history.length]);

  const resetState = useCallback((newState: T) => {
    setHistory([newState]);
    setCurrentIndex(0);
  }, []);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return { state, setState, undo, redo, canUndo, canRedo, resetState };
};
