/**
 * Validasi payload statistik anonim (PRD 6.6). Dipakai server & klien.
 */

import { MAX_CHARS } from './limits.js';
import { RULE_KEYS } from './options.js';

/**
 * @param {unknown} body
 * @returns {{ ok: true, counts: Record<string, number>, total: number } | { ok: false, error: string }}
 */
export function validateStatsPayload(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { ok: false, error: 'body harus objek' };
  const b = /** @type {any} */ (body);
  const allowedTop = ['v', 'counts'];
  for (const k of Object.keys(b)) if (!allowedTop.includes(k)) return { ok: false, error: `kunci tidak dikenal: ${k}` };
  if (b.v !== 1) return { ok: false, error: 'versi payload tidak didukung' };
  if (!b.counts || typeof b.counts !== 'object' || Array.isArray(b.counts)) return { ok: false, error: 'counts harus objek' };
  /** @type {Record<string, number>} */
  const counts = {};
  let total = 0;
  for (const [k, v] of Object.entries(b.counts)) {
    if (!RULE_KEYS.includes(/** @type {any} */ (k))) return { ok: false, error: `kunci tidak dikenal: ${k}` };
    if (typeof v !== 'number' || !Number.isInteger(v) || v < 0 || v > MAX_CHARS) {
      return { ok: false, error: `nilai tidak valid untuk ${k}` };
    }
    counts[k] = v;
    total += v; // total dihitung server
  }
  if (total > MAX_CHARS) return { ok: false, error: 'jumlah melebihi batas' };
  if (total === 0) return { ok: false, error: 'semua hitungan nol' };
  return { ok: true, counts, total };
}
