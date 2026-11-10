/**
 * F-09 — Konversi karakter yang mirip (homoglyph).
 * Subset tabel confusables (Unicode TS #39) yang berpadanan dengan huruf Latin.
 * Hanya karakter Kiril dan Yunani yang secara visual identik/hampir identik.
 */

/** @type {Record<string, string>} */
const TABLE = {
  // Kiril — huruf kecil
  '\u0430': 'a', // а
  '\u0435': 'e', // е
  '\u043e': 'o', // о
  '\u0440': 'p', // р
  '\u0441': 'c', // с
  '\u0443': 'y', // у
  '\u0445': 'x', // х
  '\u0455': 's', // ѕ
  '\u0456': 'i', // і
  '\u0458': 'j', // ј
  '\u0501': 'd', // ԁ
  '\u04bb': 'h', // һ
  '\u04cf': 'l', // ӏ
  '\u051b': 'q', // ԛ
  '\u051d': 'w', // ԝ
  '\u0475': 'v', // ѵ
  // Kiril — huruf besar
  '\u0410': 'A', // А
  '\u0412': 'B', // В
  '\u0415': 'E', // Е
  '\u041a': 'K', // К
  '\u041c': 'M', // М
  '\u041d': 'H', // Н
  '\u041e': 'O', // О
  '\u0420': 'P', // Р
  '\u0421': 'C', // С
  '\u0422': 'T', // Т
  '\u0425': 'X', // Х
  '\u0423': 'Y', // У
  '\u0405': 'S', // Ѕ
  '\u0406': 'I', // І
  '\u0408': 'J', // Ј
  '\u04c0': 'I', // Ӏ
  '\u051c': 'W', // Ԝ
  '\u051a': 'Q', // Ԛ
  // Yunani — huruf kecil
  '\u03bf': 'o', // ο
  '\u03b1': 'a', // α
  '\u03bd': 'v', // ν
  '\u03b9': 'i', // ι
  '\u03c1': 'p', // ρ
  '\u03c5': 'u', // υ
  '\u03ba': 'k', // κ
  // Yunani — huruf besar
  '\u0391': 'A', // Α
  '\u0392': 'B', // Β
  '\u0395': 'E', // Ε
  '\u0396': 'Z', // Ζ
  '\u0397': 'H', // Η
  '\u0399': 'I', // Ι
  '\u039a': 'K', // Κ
  '\u039c': 'M', // Μ
  '\u039d': 'N', // Ν
  '\u039f': 'O', // Ο
  '\u03a1': 'P', // Ρ
  '\u03a4': 'T', // Τ
  '\u03a5': 'Y', // Υ
  '\u03a7': 'X', // Χ
};

export const HOMOGLYPHS = new Map(Object.entries(TABLE));

const CONFUSABLE_CLASS = `[${[...HOMOGLYPHS.keys()].join('')}]`;
const CONFUSABLE_RE = new RegExp(CONFUSABLE_CLASS, 'g');
const HAS_CONFUSABLE = new RegExp(CONFUSABLE_CLASS);
const WORD_RE = /[\p{L}\p{M}\p{N}]+/gu;
const LATIN_RE = /\p{Script=Latin}/u;

/**
 * @param {string} text
 * @param {Record<string, number>} counts
 * @param {'mixed' | 'all'} [mode]
 * @returns {string}
 */
export function convertHomoglyphs(text, counts, mode = 'mixed') {
  if (!HAS_CONFUSABLE.test(text)) return text;
  const swap = (/** @type {string} */ ch) => {
    counts.convertLookalikes++;
    return /** @type {string} */ (HOMOGLYPHS.get(ch));
  };
  if (mode === 'all') return text.replace(CONFUSABLE_RE, swap);
  // Mode aman: hanya kata campuran-skrip (mengandung huruf Latin + karakter mirip).
  return text.replace(WORD_RE, (word) => {
    if (!HAS_CONFUSABLE.test(word) || !LATIN_RE.test(word)) return word;
    return word.replace(CONFUSABLE_RE, swap);
  });
}
