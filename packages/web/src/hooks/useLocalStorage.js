import { useEffect, useState } from 'react';

/**
 * G-09 — state yang tersimpan di localStorage.
 * @template T
 * @param {string} key
 * @param {T} initial
 * @param {(v: any) => T} [sanitize]
 * @returns {[T, import('react').Dispatch<import('react').SetStateAction<T>>]}
 */
export function useLocalStorage(key, initial, sanitize) {
  const storageKey = `cleantext:${key}`;
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw === null) return initial;
      const parsed = JSON.parse(raw);
      return sanitize ? sanitize(parsed) : parsed;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
      /* mode privat / kuota penuh */
    }
  }, [storageKey, value]);
  return [value, setValue];
}
