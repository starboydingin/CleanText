/**
 * Batas input CleanText (PRD 6.3).
 * O(n) waktu, O(1) memori untuk penghitungan kata.
 */

export const MAX_WORDS = 10_000;
/** Dihitung sebagai `text.length` (UTF-16 code unit). */
export const MAX_CHARS = 200_000;
/** Batas body API (UTF-8 multi-byte + overhead JSON). */
export const MAX_BODY_BYTES = 1_048_576;

/** @param {number} c */
function isSpaceCode(c) {
  return (
    c === 0x20 ||
    (c >= 0x09 && c <= 0x0d) ||
    c === 0xa0 ||
    c === 0x1680 ||
    (c >= 0x2000 && c <= 0x200a) ||
    c === 0x2028 ||
    c === 0x2029 ||
    c === 0x202f ||
    c === 0x205f ||
    c === 0x3000 ||
    c === 0xfeff
  );
}

/**
 * Hitung kata (token non-whitespace) tanpa membuat array perantara.
 * @param {string} text
 * @returns {number}
 */
export function countWords(text) {
  let words = 0;
  let inWord = false;
  for (let i = 0; i < text.length; i++) {
    if (isSpaceCode(text.charCodeAt(i))) inWord = false;
    else if (!inWord) {
      inWord = true;
      words++;
    }
  }
  return words;
}

/**
 * @typedef {{ ok: true, words: number, chars: number }
 *   | { ok: false, reason: 'TOO_MANY_WORDS' | 'TOO_MANY_CHARS', words: number, chars: number }} LengthCheck
 */

/**
 * Validasi panjang teks mentah.
 * @param {string} text
 * @returns {LengthCheck}
 */
export function validateLength(text) {
  const chars = text.length;
  if (chars > MAX_CHARS) return { ok: false, reason: 'TOO_MANY_CHARS', words: -1, chars };
  const words = countWords(text);
  return words > MAX_WORDS
    ? { ok: false, reason: 'TOO_MANY_WORDS', words, chars }
    : { ok: true, words, chars };
}

/**
 * Potong teks tepat setelah kata ke-`maxWords` (tanpa mengubah isi sebelumnya).
 * @param {string} text
 * @param {number} [maxWords]
 * @returns {string}
 */
export function truncateToWords(text, maxWords = MAX_WORDS) {
  let words = 0;
  let inWord = false;
  for (let i = 0; i < text.length; i++) {
    if (isSpaceCode(text.charCodeAt(i))) {
      if (inWord && words === maxWords) return text.slice(0, i);
      inWord = false;
    } else if (!inWord) {
      inWord = true;
      words++;
    }
  }
  return text;
}
