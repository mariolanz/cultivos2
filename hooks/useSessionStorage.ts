import { useState, useEffect, Dispatch, SetStateAction } from 'react';

function useSessionStorage<T,>(key: string, initialValue: T | null): [T | null, Dispatch<SetStateAction<T | null>>] {
  const [storedValue, setStoredValue] = useState<T | null>(() => {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      if (storedValue === null || storedValue === undefined) {
          window.sessionStorage.removeItem(key);
      } else {
          window.sessionStorage.setItem(key, JSON.stringify(storedValue));
      }
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

export default useSessionStorage;
