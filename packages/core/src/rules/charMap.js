/**
 * Tabel karakter untuk aturan F-01 s.d. F-05 (PRD 6.1).
 */

/** F-01: karakter tersembunyi (selain kontrol C0/C1 yang dibangkitkan di bawah). */
const HIDDEN_NAMED = [
  0x200b, // Zero Width Space
  0x200c, // Zero Width Non-Joiner
  0x200d, // Zero Width Joiner
  0x2060, // Word Joiner
  0xfeff, // BOM / Zero Width No-Break Space
  0x00ad, // Soft Hyphen
  0x200e, // LRM
  0x200f, // RLM
  0x202a, 0x202b, 0x202c, 0x202d, 0x202e, // kontrol arah bidi (embedding/override)
  0x2066, 0x2067, 0x2068, 0x2069, // isolate bidi
];

/** Kontrol C0 (kecuali \t \n \r), DEL, dan C1. */
const CONTROLS = [];
for (let c = 0x00; c <= 0x1f; c++) if (c !== 0x09 && c !== 0x0a && c !== 0x0d) CONTROLS.push(c);
CONTROLS.push(0x7f);
for (let c = 0x80; c <= 0x9f; c++) CONTROLS.push(c);

export const ZWJ = '\u200d';

/** @type {string[]} */
export const HIDDEN = [...HIDDEN_NAMED, ...CONTROLS].map((c) => String.fromCharCode(c));

/** F-02: spasi khusus → spasi biasa. */
export const NBSP = [0x00a0, 0x202f, 0x2007, 0x2000, 0x2001, 0x2002, 0x2003, 0x2004, 0x2005, 0x2006, 0x2008, 0x2009, 0x200a, 0x205f, 0x3000].map(
  (c) => String.fromCharCode(c),
);

/** F-03: dash → "-". */
export const DASHES = [0x2010, 0x2011, 0x2012, 0x2013, 0x2014, 0x2015, 0x2212, 0xfe58, 0xfe63, 0xff0d].map((c) =>
  String.fromCharCode(c),
);

/** F-04: kutipan tipografis → kutipan lurus. */
export const QUOTES = /** @type {[string, string][]} */ ([
  ['\u201c', '"'], // “
  ['\u201d', '"'], // ”
  ['\u201e', '"'], // „
  ['\u201f', '"'], // ‟
  ['\u00ab', '"'], // «
  ['\u00bb', '"'], // »
  ['\u2018', "'"], // ‘
  ['\u2019', "'"], // ’
  ['\u201a', "'"], // ‚
  ['\u201b', "'"], // ‛
  ['\u2039', "'"], // ‹
  ['\u203a', "'"], // ›
]);

/** F-05 */
export const ELLIPSIS = '\u2026';

/** Label terbaca untuk G-12. */
export const HIDDEN_LABELS = new Map([
  ['\u200b', 'ZWSP'],
  ['\u200c', 'ZWNJ'],
  ['\u200d', 'ZWJ'],
  ['\u2060', 'WJ'],
  ['\ufeff', 'BOM'],
  ['\u00ad', 'SHY'],
  ['\u200e', 'LRM'],
  ['\u200f', 'RLM'],
  ['\u00a0', 'NBSP'],
]);

/** Escape karakter untuk dipakai di dalam kelas karakter RegExp. */
export function escapeForClass(ch) {
  const code = ch.charCodeAt(0);
  return '\\u' + code.toString(16).padStart(4, '0');
}
