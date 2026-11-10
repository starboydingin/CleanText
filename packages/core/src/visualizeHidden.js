/**
 * G-12 — Visualisasi karakter tersembunyi.
 * Mengganti karakter tersembunyi/khusus (cakupan F-01 & F-02) dengan label terbaca.
 * O(n).
 */

import { HIDDEN, HIDDEN_LABELS, NBSP, escapeForClass } from './rules/charMap.js';

const TARGETS = [...new Set([...HIDDEN, ...NBSP])];
const TARGET_RE = new RegExp(`[${TARGETS.map(escapeForClass).join('')}]`, 'g');

/** @param {string} ch */
export function labelFor(ch) {
  const named = HIDDEN_LABELS.get(ch);
  if (named) return named;
  return 'U+' + ch.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Versi string: `[ZWSP]`, `[NBSP]`, `[U+XXXX]`.
 * @param {string} text
 * @returns {string}
 */
export function visualizeHidden(text) {
  return text.replace(TARGET_RE, (ch) => `[${labelFor(ch)}]`);
}

/**
 * Versi segmen untuk UI (render chip).
 * @param {string} text
 * @returns {{ segments: Array<{ type: 'text', value: string } | { type: 'hidden', label: string, code: string }>, count: number, byLabel: Record<string, number> }}
 */
export function scanHidden(text) {
  /** @type {any[]} */
  const segments = [];
  /** @type {Record<string, number>} */
  const byLabel = {};
  let last = 0;
  let count = 0;
  TARGET_RE.lastIndex = 0;
  let m;
  while ((m = TARGET_RE.exec(text)) !== null) {
    if (m.index > last) segments.push({ type: 'text', value: text.slice(last, m.index) });
    const ch = m[0];
    const label = labelFor(ch);
    segments.push({ type: 'hidden', label, code: 'U+' + ch.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0') });
    byLabel[label] = (byLabel[label] || 0) + 1;
    count++;
    last = m.index + 1;
  }
  if (last < text.length) segments.push({ type: 'text', value: text.slice(last) });
  return { segments, count, byLabel };
}

/**
 * Hitung karakter tersembunyi/khusus tanpa membangun segmen.
 * @param {string} text
 */
export function countHidden(text) {
  const m = text.match(TARGET_RE);
  return m ? m.length : 0;
}
