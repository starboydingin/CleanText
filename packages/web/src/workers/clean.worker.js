/* G-10 — pemrosesan di Web Worker. */
import { createCleaner, scanHidden, countHidden } from '@cleantext/core';

let cachedKey = '';
/** @type {ReturnType<typeof createCleaner> | null} */
let cleaner = null;

self.onmessage = (event) => {
  const { id, type, text, options } = event.data;
  try {
    if (type === 'clean') {
      const key = JSON.stringify(options);
      if (key !== cachedKey || !cleaner) {
        cleaner = createCleaner(options);
        cachedKey = key;
      }
      const result = cleaner(text);
      self.postMessage({ id, type, result, hiddenCount: countHidden(text) });
    } else if (type === 'scan') {
      self.postMessage({ id, type, scan: scanHidden(text) });
    }
  } catch (err) {
    self.postMessage({ id, type, error: String(err && err.message ? err.message : err) });
  }
};
