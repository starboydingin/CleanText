import { useCallback, useEffect, useRef, useState } from 'react';
import { RULE_KEYS } from '@cleantext/core';

const DEBOUNCE_MS = 5_000;
const MIN_GAP_MS = 30_000;
const MAX_PER_KEY = 200_000;
const ENDPOINT = '/api/stats';

/**
 * G-14 — pengirim hitungan anonim berkelompok.
 *
 * Hanya angka per aturan: tanpa teks, tanpa ID, tanpa cookie.
 * Mode live menjalankan pembersihan berulang pada teks yang sama, jadi yang
 * dikirim adalah *selisih positif* hasil terbaru terhadap hasil yang terakhir
 * dilaporkan — artefak yang sama tidak dihitung dua kali.
 * Offline → hitungan dibuang (tidak diantrekan).
 *
 * @param {boolean} enabled
 */
export function useStatsReporter(enabled) {
  const latest = useRef(/** @type {Record<string, number> | null} */ (null));
  const baseline = useRef(/** @type {Record<string, number>} */ ({}));
  const lastSent = useRef(0);
  const timer = useRef(/** @type {ReturnType<typeof setTimeout> | null} */ (null));
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const clearTimer = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const send = useCallback((/** @type {boolean} */ beacon = false) => {
    clearTimer();
    const cur = latest.current;
    if (!cur) return;
    /** @type {Record<string, number>} */
    const counts = {};
    let total = 0;
    for (const k of RULE_KEYS) {
      const d = Math.max(0, (cur[k] || 0) - (baseline.current[k] || 0));
      if (d > 0) {
        counts[k] = Math.min(MAX_PER_KEY, d);
        total += counts[k];
      }
    }
    baseline.current = { ...cur };
    latest.current = null;
    if (!enabledRef.current || total === 0 || total > MAX_PER_KEY) return;
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return; // dibuang

    const body = JSON.stringify({ v: 1, counts });
    lastSent.current = Date.now();
    if (beacon && typeof navigator.sendBeacon === 'function') {
      navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'text/plain' }));
      return;
    }
    fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {
      /* gagal diam-diam */
    });
  }, []);

  /** Catat hasil pembersihan terbaru. */
  const record = useCallback(
    (/** @type {Record<string, number>} */ changes) => {
      if (!enabledRef.current || !changes) return;
      latest.current = changes;
      clearTimer();
      const wait = Math.max(DEBOUNCE_MS, MIN_GAP_MS - (Date.now() - lastSent.current));
      timer.current = setTimeout(() => send(false), wait);
    },
    [send],
  );

  /** Teks dikosongkan / diganti: mulai baseline baru. */
  const resetBaseline = useCallback(() => {
    if (latest.current) send(false);
    baseline.current = {};
  }, [send]);

  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden') send(true);
    };
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, [send]);

  useEffect(() => {
    if (!enabled) {
      clearTimer();
      latest.current = null;
    }
  }, [enabled]);

  useEffect(() => clearTimer, []);

  return { record, resetBaseline };
}

/**
 * Ambil statistik global; null bila gagal (bagian disembunyikan).
 * @param {number} [refreshKey]
 */
export function useGlobalStats(refreshKey = 0) {
  const [data, setData] = useState(/** @type {null | { total: number, counts: Record<string, number>, updatedAt: string }} */ (null));
  useEffect(() => {
    let alive = true;
    fetch(ENDPOINT, { headers: { Accept: 'application/json' } })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (alive && j && typeof j.total === 'number') setData(j);
      })
      .catch(() => {
        /* disembunyikan */
      });
    return () => {
      alive = false;
    };
  }, [refreshKey]);
  return data;
}
