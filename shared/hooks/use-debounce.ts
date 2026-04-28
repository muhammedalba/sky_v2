import { useEffect, useState } from 'react';

/**
 * A custom hook that returns a debounced value.
 * Useful for delaying the update of a value that changes frequently (e.g., search input).
 * 
 * @template T - The type of the value to be debounced.
 * @param {T} value - The value to debounce.
 * @param {number} delay - The delay in milliseconds.
 * @returns {T} - The debounced value.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set a timer to update the debounced value after the specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timer if the value changes or the component unmounts
    // This prevents memory leaks and unnecessary state updates
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
