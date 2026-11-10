import { useCallback, useEffect, useRef, useState } from 'react';
import { createCleaner, scanHidden, countHidden } from '@cleantext/core';

/**
 * Klien Web Worker dengan fallback sinkron (bila Worker tidak tersedia).
 * Setiap permintaan diberi id; hasil usang diabaikan oleh pemanggil.
 */
function createClient() {
  /** @type {Map<number, (v: any) => void>} */
  const pending = new Map();
  let seq = 0;
  /** @type {Worker | null} */
  let worker = null;
  try {
    worker = new Worker(new URL('../workers/clean.worker.js', import.meta.url), { type: 'module' });
    worker.onmessage = (e) => {
      const resolve = pending.get(e.data.id);
      if (resolve) {
        pending.delete(e.data.id);
        resolve(e.data);
      }
    };
    worker.onerror = () => {
      worker?.terminate();
      worker = null;
      for (const [, r] of pending) r({ error: 'worker' });
      pending.clear();
    };
  } catch {
    worker = null;
  }

  /** @param {{ type: 'clean' | 'scan', text: string, options?: any }} msg */
  function call(msg) {
    const id = ++seq;
    if (!worker) {
      // Fallback di thread utama.
      if (msg.type === 'clean') {
        const result = createCleaner(msg.options)(msg.text);
        return Promise.resolve({ id, type: 'clean', result, hiddenCount: countHidden(msg.text) });
      }
      return Promise.resolve({ id, type: 'scan', scan: scanHidden(msg.text) });
    }
    return new Promise((resolve) => {
      pending.set(id, resolve);
      worker.postMessage({ id, ...msg });
    }).then((data) => {
      if (data.error === 'worker') return call(msg); // jatuh ke fallback
      return data;
    });
  }

  return { call, terminate: () => worker?.terminate() };
}

/**
 * G-03 — pembersihan live dengan debounce + pembatalan hasil usang.
 * @param {string} text
 * @param {any} options
 * @param {{ live: boolean, blocked: boolean, delay?: number }} cfg
 */
export function useCleaner(text, options, { live, blocked, delay = 150 }) {
  const clientRef = useRef(/** @type {ReturnType<typeof createClient> | null} */ (null));
  const latest = useRef(0);
  const [state, setState] = useState({
    output: '',
    changes: /** @type {Record<string, number>} */ ({}),
    totalChanges: 0,
    durationMs: 0,
    hiddenCount: 0,
    busy: false,
    runs: 0,
  });

  useEffect(() => {
    clientRef.current = createClient();
    return () => clientRef.current?.terminate();
  }, []);

  const run = useCallback(
    async (/** @type {string} */ t, /** @type {any} */ o) => {
      const client = clientRef.current;
      if (!client) return null;
      const ticket = ++latest.current;
      setState((s) => ({ ...s, busy: true }));
      const data = await client.call({ type: 'clean', text: t, options: o });
      if (ticket !== latest.current || data.error) return null; // hasil usang
      setState((s) => ({
        output: data.result.text,
        changes: data.result.changes,
        totalChanges: data.result.totalChanges,
        durationMs: data.result.durationMs,
        hiddenCount: data.hiddenCount,
        busy: false,
        runs: s.runs + 1,
      }));
      return data.result;
    },
    [],
  );

  useEffect(() => {
    if (!live || blocked) return undefined;
    if (!text) {
      latest.current++;
      setState((s) => ({ ...s, output: '', changes: {}, totalChanges: 0, durationMs: 0, hiddenCount: 0, busy: false }));
      return undefined;
    }
    const h = setTimeout(() => run(text, options), delay);
    return () => clearTimeout(h);
  }, [text, options, live, blocked, delay, run]);

  const scan = useCallback(async (/** @type {string} */ t) => {
    const client = clientRef.current;
    if (!client) return scanHidden(t);
    const data = await client.call({ type: 'scan', text: t });
    return data.scan;
  }, []);

  const reset = useCallback(() => {
    latest.current++;
    setState((s) => ({ ...s, output: '', changes: {}, totalChanges: 0, durationMs: 0, hiddenCount: 0, busy: false }));
  }, []);

  return { ...state, run: () => run(text, options), scan, reset };
}
