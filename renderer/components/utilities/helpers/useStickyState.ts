import { useState, useEffect } from "react";

// Custom hook for sticky state
export function useStickyState<T>(
  key: string,
  defaultValue: T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const isClient = typeof window !== "undefined";

  const [state, setState] = useState<T>(() => {
    if (isClient) {
      const stickyValue = window.localStorage.getItem(key);
      return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
    } else {
      return defaultValue;
    }
  });

  useEffect(() => {
    if (isClient) {
      window.localStorage.setItem(key, JSON.stringify(state));
    }
  }, [key, state, isClient]);

  return [state, setState];
}
