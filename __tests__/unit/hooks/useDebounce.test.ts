/**
 * Tests for useDebounce hook
 */

import { renderHook, waitFor } from '@testing-library/react-native';
import { useDebounce } from '../../../src/hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    expect(result.current).toBe('initial');

    // Update value
    rerender({ value: 'updated', delay: 500 });

    // Value should not update immediately
    expect(result.current).toBe('initial');

    // Fast-forward time
    jest.advanceTimersByTime(500);

    // Now it should be updated
    await waitFor(() => {
      expect(result.current).toBe('updated');
    });
  });

  it('should reset timer on rapid value changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    // Rapid changes
    rerender({ value: 'change1', delay: 500 });
    jest.advanceTimersByTime(200);
    
    rerender({ value: 'change2', delay: 500 });
    jest.advanceTimersByTime(200);
    
    rerender({ value: 'final', delay: 500 });
    
    // Should still have initial value
    expect(result.current).toBe('initial');

    // After full delay from last change
    jest.advanceTimersByTime(500);
    
    await waitFor(() => {
      expect(result.current).toBe('final');
    });
  });

  it('should work with different data types', async () => {
    // Number
    const { result: numberResult, rerender: numberRerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 0, delay: 300 } }
    );
    
    numberRerender({ value: 42, delay: 300 });
    jest.advanceTimersByTime(300);
    
    await waitFor(() => {
      expect(numberResult.current).toBe(42);
    });

    // Object
    const initialObj = { key: 'value' };
    const updatedObj = { key: 'new value' };
    
    const { result: objectResult, rerender: objectRerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: initialObj, delay: 300 } }
    );
    
    objectRerender({ value: updatedObj, delay: 300 });
    jest.advanceTimersByTime(300);
    
    await waitFor(() => {
      expect(objectResult.current).toEqual(updatedObj);
    });

    // Array
    const { result: arrayResult, rerender: arrayRerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: [1, 2, 3], delay: 300 } }
    );
    
    arrayRerender({ value: [4, 5, 6], delay: 300 });
    jest.advanceTimersByTime(300);
    
    await waitFor(() => {
      expect(arrayResult.current).toEqual([4, 5, 6]);
    });
  });

  it('should handle delay changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    rerender({ value: 'updated', delay: 1000 });

    // After 500ms (old delay)
    jest.advanceTimersByTime(500);
    expect(result.current).toBe('initial');

    // After 1000ms (new delay)
    jest.advanceTimersByTime(500);
    
    await waitFor(() => {
      expect(result.current).toBe('updated');
    });
  });

  it('should cleanup timeout on unmount', () => {
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
    
    const { unmount } = renderHook(() => useDebounce('value', 500));
    
    unmount();
    
    expect(clearTimeoutSpy).toHaveBeenCalled();
    
    clearTimeoutSpy.mockRestore();
  });

  it('should handle zero delay', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 0 } }
    );

    rerender({ value: 'updated', delay: 0 });
    
    jest.advanceTimersByTime(0);
    
    await waitFor(() => {
      expect(result.current).toBe('updated');
    });
  });
});
