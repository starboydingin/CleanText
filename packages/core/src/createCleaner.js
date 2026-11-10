/**
 * Pipeline pra-kompilasi CleanText (PRD 6.4 & 10.5).
 *
 *   0. Validasi & fast path ASCII
 *   1. Unicode (F-10)                 — hanya bila ada non-ASCII
 *   2. Single-pass peta karakter      — F-01..F-05 dalam satu replace
 *   4. Per baris                      — F-07, F-08, F-06 dalam satu loop
 *   3. Homoglyph (F-09)               — kondisional (sengaja setelah tahap 4)
 *   5. Re-normalisasi (F-10)          — hanya bila tahap 2/4 menyatukan
 *                                       huruf dasar + tanda diakritik
 *                                       (menjaga idempotensi)
 */

import { DASHES, ELLIPSIS, HIDDEN, NBSP, QUOTES, ZWJ, escapeForClass } from './rules/charMap.js';
import { convertHomoglyphs } from './rules/homoglyphs.js';
import { applyLineRules } from './rules/lineRules.js';
import { normalizeUnicode } from './rules/unicodeNormalize.js';
import { DEFAULT_OPTIONS, newCounts } from './options.js';

const NON_ASCII = /[^\x00-\x7f]/;
const ASCII_CONTROL = /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/;
const EMOJI_BEFORE_ZWJ = /[\p{Extended_Pictographic}\p{Emoji_Modifier}\uFE0F\u20E3]/u;
const EMOJI_AFTER_ZWJ = /\p{Extended_Pictographic}/u;
const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

/**
 * @param {string} str
 * @param {number} idx index karakter sesudah target
 */
function codePointBefore(str, idx) {
  if (idx <= 0) return '';
  const lo = str.charCodeAt(idx - 1);
  if (lo >= 0xdc00 && lo <= 0xdfff && idx >= 2) {
    const hi = str.charCodeAt(idx - 2);
    if (hi >= 0xd800 && hi <= 0xdbff) return str.slice(idx - 2, idx);
  }
  return str[idx - 1];
}

/** @param {string} str @param {number} idx */
function codePointAt(str, idx) {
  const cp = str.codePointAt(idx);
  return cp === undefined ? '' : String.fromCodePoint(cp);
}

/**
 * @typedef {Object} CleanResult
 * @property {string} text
 * @property {Record<string, number>} changes  hitungan per aturan (termasuk nol)
 * @property {number} totalChanges
 * @property {number} durationMs
 */

/**
 * Bangun fungsi pembersih untuk satu set opsi. Peta, kelas karakter,
 * dan regex dibangun SEKALI di sini.
 *
 * @param {Partial<import('./options.js').CleanOptions>} [options]
 * @returns {(input: string) => CleanResult}
 */
export function createCleaner(options = {}) {
  /** @type {import('./options.js').CleanOptions} */
  const opts = { ...DEFAULT_OPTIONS, ...options };

  /** @type {Map<string, { to: string, rule: string }>} */
  const map = new Map();
  if (opts.removeHiddenChars) for (const ch of HIDDEN) map.set(ch, { to: '', rule: 'removeHiddenChars' });
  if (opts.convertNbsp) for (const ch of NBSP) map.set(ch, { to: ' ', rule: 'convertNbsp' });
  if (opts.normalizeDashes) for (const ch of DASHES) map.set(ch, { to: '-', rule: 'normalizeDashes' });
  if (opts.normalizeQuotes) for (const [ch, to] of QUOTES) map.set(ch, { to, rule: 'normalizeQuotes' });
  if (opts.convertEllipsis) map.set(ELLIPSIS, { to: '...', rule: 'convertEllipsis' });

  const charRe = map.size ? new RegExp(`[${[...map.keys()].map(escapeForClass).join('')}]`, 'g') : null;
  const keepZwj = opts.removeHiddenChars && opts.preserveEmojiZwj;
  const form = opts.normalizeUnicode;
  const lineRulesOn = opts.trimTrailingWhitespace || opts.removeAsterisks || opts.removeMarkdownHeadings;

  return function clean(input) {
    const t0 = now();
    const counts = newCounts();
    let text = typeof input === 'string' ? input : String(input ?? '');

    // Tahap 0 — fast path ASCII.
    const asciiOnly = !NON_ASCII.test(text);

    // Tahap 1 — Unicode.
    if (form && !asciiOnly) text = normalizeUnicode(text, form, counts);

    // Tahap 2 — single-pass peta karakter.
    let joined = false;
    if (charRe && (!asciiOnly || (opts.removeHiddenChars && ASCII_CONTROL.test(text)))) {
      text = text.replace(charRe, (ch, offset, str) => {
        const e = /** @type {{to: string, rule: string}} */ (map.get(ch));
        if (
          ch === ZWJ &&
          keepZwj &&
          EMOJI_BEFORE_ZWJ.test(codePointBefore(str, offset)) &&
          EMOJI_AFTER_ZWJ.test(codePointAt(str, offset + 1))
        ) {
          return ch;
        }
        counts[e.rule]++;
        if (e.to === '') joined = true;
        return e.to;
      });
    }

    // Tahap 4 — aturan per baris.
    if (lineRulesOn) {
      const before = counts.removeAsterisks;
      text = applyLineRules(text, opts, counts);
      if (counts.removeAsterisks !== before) joined = true;
    }

    // Tahap 3 — homoglyph. Dijalankan SETELAH aturan baris: konversi
    // homoglyph tidak memengaruhi `*`, `#`, maupun spasi, sedangkan
    // penghapusan `*` dapat menyatukan dua kata menjadi kata campuran-skrip.
    // Urutan ini menjaga idempotensi.
    if (opts.convertLookalikes && !asciiOnly) {
      const before = counts.convertLookalikes;
      text = convertHomoglyphs(text, counts, opts.lookalikeMode);
      if (counts.convertLookalikes !== before) joined = true;
    }

    // Tahap 5 — re-normalisasi bila ada penghapusan yang dapat menyatukan
    // huruf dasar dengan tanda diakritik (mis. "e\u200B\u0301").
    if (form && joined && NON_ASCII.test(text)) {
      const again = text.normalize(form);
      if (again !== text) {
        counts.normalizeUnicode++;
        text = again;
      }
    }

    let total = 0;
    for (const k in counts) total += counts[k];
    return { text, changes: counts, totalChanges: total, durationMs: now() - t0 };
  };
}

/**
 * Pembersihan sekali pakai.
 * @param {string} text
 * @param {Partial<import('./options.js').CleanOptions>} [options]
 */
export function cleanText(text, options) {
  return createCleaner(options)(text);
}
