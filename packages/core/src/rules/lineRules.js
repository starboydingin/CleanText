/**
 * Aturan per baris (PRD 6.4 tahap 4): F-07, F-08, F-06 dalam satu loop,
 * dengan pelacakan blok kode berpagar (``` atau ~~~).
 *
 * Urutan internal: tanda bintang → judul → trailing whitespace.
 * (Bintang dihapus lebih dulu agar "*# Judul" tidak menyisakan judul baru
 *  yang baru terhapus pada putaran kedua — menjaga idempotensi.)
 */

const FENCE_OPEN = /^ {0,3}(`{3,}|~{3,})/;
const FENCE_CLOSE = /^ {0,3}(`{3,}|~{3,})[ \t]*$/;
const HEADING = /^[ \t]{0,3}(?:#{1,6}[ \t]+)+/;
const BULLET = /^([ \t]*)\*[ \t]+(?=\S)/;

/**
 * @param {string} text
 * @param {import('../options.js').CleanOptions} opts
 * @param {Record<string, number>} counts
 * @returns {string}
 */
export function applyLineRules(text, opts, counts) {
  const doHead = opts.removeMarkdownHeadings;
  const doStar = opts.removeAsterisks;
  const doTrail = opts.trimTrailingWhitespace;
  if (!doHead && !doStar && !doTrail) return text;
  // Jalan cepat: tidak ada yang perlu disentuh.
  if (!doTrail && (!doStar || text.indexOf('*') === -1) && (!doHead || text.indexOf('#') === -1)) return text;

  const lines = text.split('\n');
  /** @type {string | null} */
  let fence = null;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let cr = '';
    if (line.endsWith('\r')) {
      cr = '\r';
      line = line.slice(0, -1);
    }

    if (fence === null) {
      if (doStar && line.indexOf('*') !== -1) {
        if (opts.convertBullets) {
          const m = BULLET.exec(line);
          if (m) {
            line = m[1] + '- ' + line.slice(m[0].length);
            counts.removeAsterisks++;
          }
        }
        const parts = line.split('*');
        if (parts.length > 1) {
          counts.removeAsterisks += parts.length - 1;
          line = parts.join('');
        }
      }
      if (doHead && line.indexOf('#') !== -1) {
        const m = HEADING.exec(line);
        if (m) {
          line = line.slice(m[0].length);
          counts.removeMarkdownHeadings++;
        }
      }
    }

    if (doTrail) {
      // Pindai mundur (O(n), tanpa risiko backtracking regex).
      let end = line.length;
      while (end > 0) {
        const c = line.charCodeAt(end - 1);
        if (c === 0x20 || c === 0x09) end--;
        else break;
      }
      if (end !== line.length) {
        line = line.slice(0, end);
        counts.trimTrailingWhitespace++;
      }
    }

    // Status pagar ditentukan dari baris HASIL agar putaran kedua konsisten.
    if (fence === null) {
      const m = FENCE_OPEN.exec(line);
      if (m) fence = m[1];
    } else {
      const m = FENCE_CLOSE.exec(line);
      if (m && m[1][0] === fence[0] && m[1].length >= fence.length) fence = null;
    }

    lines[i] = line + cr;
  }
  return lines.join('\n');
}
