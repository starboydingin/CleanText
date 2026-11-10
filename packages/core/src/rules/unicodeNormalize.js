/**
 * Normalisasi Unicode tersegmentasi (F-10).
 *
 * Teks dipecah menjadi segmen "satu karakter ASCII opsional + deret non-ASCII".
 * Karakter ASCII adalah *starter* yang stabil pada NFC/NFKC, sehingga hasil
 * normalisasi per segmen identik dengan normalisasi seluruh teks — tetapi
 * bagian ASCII dilewati, dan jumlah segmen yang berubah dapat dihitung.
 */

const SEGMENT_RE = /[\x00-\x7f]?[^\x00-\x7f]+/g;

/**
 * @param {string} text
 * @param {'NFC' | 'NFKC'} form
 * @param {Record<string, number>} counts
 * @returns {string}
 */
export function normalizeUnicode(text, form, counts) {
  return text.replace(SEGMENT_RE, (seg) => {
    const n = seg.normalize(form);
    if (n !== seg) counts.normalizeUnicode++;
    return n;
  });
}
