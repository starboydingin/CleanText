/**
 * Kontrak opsi bersama (PRD 10.7) + metadata aturan untuk UI/CLI.
 */

/** Kunci aturan sesuai urutan kartu (PRD 9.1). */
export const RULE_KEYS = /** @type {const} */ ([
  'removeHiddenChars',
  'convertNbsp',
  'normalizeDashes',
  'normalizeQuotes',
  'convertEllipsis',
  'trimTrailingWhitespace',
  'removeAsterisks',
  'removeMarkdownHeadings',
  'convertLookalikes',
  'normalizeUnicode',
]);

/**
 * @typedef {Object} CleanOptions
 * @property {boolean} removeHiddenChars        F-01
 * @property {boolean} convertNbsp              F-02
 * @property {boolean} normalizeDashes          F-03
 * @property {boolean} normalizeQuotes          F-04
 * @property {boolean} convertEllipsis          F-05
 * @property {boolean} trimTrailingWhitespace   F-06
 * @property {boolean} removeAsterisks          F-07
 * @property {boolean} removeMarkdownHeadings   F-08
 * @property {boolean} convertLookalikes        F-09 (default: false)
 * @property {false | 'NFC' | 'NFKC'} normalizeUnicode F-10
 * @property {boolean} preserveEmojiZwj         Sub-opsi F-01: pertahankan ZWJ di antara emoji
 * @property {'mixed' | 'all'} lookalikeMode    Sub-opsi F-09: hanya kata campuran-skrip, atau semua
 * @property {boolean} convertBullets           Sub-opsi F-07: `* item` menjadi `- item` alih-alih dihapus
 */

/** @type {Readonly<CleanOptions>} */
export const DEFAULT_OPTIONS = Object.freeze({
  removeHiddenChars: true,
  convertNbsp: true,
  normalizeDashes: true,
  normalizeQuotes: true,
  convertEllipsis: true,
  trimTrailingWhitespace: true,
  removeAsterisks: true,
  removeMarkdownHeadings: true,
  convertLookalikes: false,
  normalizeUnicode: 'NFC',
  preserveEmojiZwj: true,
  lookalikeMode: 'mixed',
  convertBullets: true,
});

const BOOLEAN_KEYS = [
  'removeHiddenChars',
  'convertNbsp',
  'normalizeDashes',
  'normalizeQuotes',
  'convertEllipsis',
  'trimTrailingWhitespace',
  'removeAsterisks',
  'removeMarkdownHeadings',
  'convertLookalikes',
  'preserveEmojiZwj',
  'convertBullets',
];

/**
 * Metadata 10 aturan untuk UI ("kartu") dan CLI.
 * `unit` dipakai pada ringkasan perubahan.
 */
export const RULES = Object.freeze([
  { key: 'removeHiddenChars', id: 'F-01', rank: '1', group: 'Bersihkan', label: 'Hapus karakter tersembunyi', desc: 'Zero-width, BOM, soft hyphen, kontrol arah & kontrol C0/C1.', unit: 'karakter tersembunyi dihapus', flag: 'hidden' },
  { key: 'convertNbsp', id: 'F-02', rank: '2', group: 'Seragamkan', label: 'Konversi ruang yang tidak pecah', desc: 'NBSP & spasi khusus menjadi spasi biasa.', unit: 'spasi khusus dikonversi', flag: 'nbsp' },
  { key: 'normalizeDashes', id: 'F-03', rank: '3', group: 'Seragamkan', label: 'Normalisasikan dash', desc: 'En dash, em dash, minus — semuanya menjadi "-".', unit: 'dash dinormalisasi', flag: 'dashes' },
  { key: 'normalizeQuotes', id: 'F-04', rank: '4', group: 'Seragamkan', label: 'Normalisasikan kutipan', desc: 'Kutipan lengkung & guillemet menjadi kutipan lurus.', unit: 'kutipan diluruskan', flag: 'quotes' },
  { key: 'convertEllipsis', id: 'F-05', rank: '5', group: 'Seragamkan', label: 'Konversi ellipsis', desc: 'Karakter "…" menjadi tiga titik "...".', unit: 'ellipsis dikonversi', flag: 'ellipsis' },
  { key: 'trimTrailingWhitespace', id: 'F-06', rank: '6', group: 'Bersihkan', label: 'Hapus trailing whitespace', desc: 'Spasi & tab di akhir setiap baris.', unit: 'baris dirapikan', flag: 'trailing' },
  { key: 'removeAsterisks', id: 'F-07', rank: '7', group: 'Bersihkan', label: 'Hapus tanda bintang (*)', desc: 'Sisa format tebal/miring Markdown.', unit: 'tanda bintang dihapus', flag: 'asterisks' },
  { key: 'removeMarkdownHeadings', id: 'F-08', rank: '8', group: 'Bersihkan', label: 'Hapus judul Markdown', desc: 'Penanda "#" di awal baris; hashtag tetap aman.', unit: 'judul dibersihkan', flag: 'headings' },
  { key: 'convertLookalikes', id: 'F-09', rank: '9', group: 'Seragamkan', label: 'Konversi karakter yang mirip', desc: 'Homoglyph Kiril/Yunani pada kata campuran-skrip.', unit: 'karakter mirip dikonversi', flag: 'lookalikes' },
  { key: 'normalizeUnicode', id: 'F-10', rank: '10', group: 'Seragamkan', label: 'Normalisasikan bentuk Unicode', desc: 'NFC (konservatif) atau NFKC (agresif).', unit: 'segmen Unicode dinormalisasi', flag: 'unicode' },
]);

/** @returns {Record<string, number>} */
export function newCounts() {
  /** @type {Record<string, number>} */
  const c = {};
  for (const k of RULE_KEYS) c[k] = 0;
  return c;
}

/**
 * Normalisasi nilai opsi Unicode.
 * @param {unknown} v
 * @returns {false | 'NFC' | 'NFKC' | undefined} undefined bila tidak valid
 */
export function parseUnicodeForm(v) {
  if (v === false || v === null) return false;
  if (v === true) return 'NFC';
  if (typeof v === 'string') {
    const u = v.trim().toUpperCase();
    if (u === 'NFC' || u === 'NFKC') return u;
    if (u === 'FALSE' || u === 'OFF' || u === 'NONE') return false;
  }
  return undefined;
}

/**
 * Gabungkan opsi parsial dengan default dan validasi tipenya.
 * @param {unknown} input
 * @returns {{ ok: true, options: CleanOptions } | { ok: false, error: string }}
 */
export function resolveOptions(input) {
  if (input === undefined || input === null) return { ok: true, options: { ...DEFAULT_OPTIONS } };
  if (typeof input !== 'object' || Array.isArray(input)) return { ok: false, error: 'options harus berupa objek' };
  /** @type {any} */
  const out = { ...DEFAULT_OPTIONS };
  for (const [k, v] of Object.entries(input)) {
    if (BOOLEAN_KEYS.includes(k)) {
      if (typeof v !== 'boolean') return { ok: false, error: `options.${k} harus boolean` };
      out[k] = v;
    } else if (k === 'normalizeUnicode') {
      const f = parseUnicodeForm(v);
      if (f === undefined) return { ok: false, error: 'options.normalizeUnicode harus false | "NFC" | "NFKC"' };
      out[k] = f;
    } else if (k === 'lookalikeMode') {
      if (v !== 'mixed' && v !== 'all') return { ok: false, error: 'options.lookalikeMode harus "mixed" | "all"' };
      out[k] = v;
    } else {
      return { ok: false, error: `opsi tidak dikenal: ${k}` };
    }
  }
  return { ok: true, options: out };
}

/**
 * Validasi body permintaan `POST /api/clean`.
 * @param {unknown} body
 * @returns {{ ok: true, text: string, options: CleanOptions } | { ok: false, error: string }}
 */
export function parseCleanRequest(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { ok: false, error: 'body harus objek JSON' };
  const b = /** @type {any} */ (body);
  if (typeof b.text !== 'string') return { ok: false, error: 'text harus string' };
  const r = resolveOptions(b.options);
  if (!r.ok) return r;
  return { ok: true, text: b.text, options: r.options };
}
