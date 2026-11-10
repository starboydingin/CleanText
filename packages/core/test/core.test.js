import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import {
  cleanText,
  createCleaner,
  countWords,
  validateLength,
  truncateToWords,
  visualizeHidden,
  scanHidden,
  validateStatsPayload,
  resolveOptions,
  parseCleanRequest,
  DEFAULT_OPTIONS,
  RULE_KEYS,
  MAX_WORDS,
  MAX_CHARS,
} from '../src/index.js';

const ALL_OFF = {
  removeHiddenChars: false,
  convertNbsp: false,
  normalizeDashes: false,
  normalizeQuotes: false,
  convertEllipsis: false,
  trimTrailingWhitespace: false,
  removeAsterisks: false,
  removeMarkdownHeadings: false,
  convertLookalikes: false,
  normalizeUnicode: false,
};
const only = (patch) => ({ ...ALL_OFF, ...patch });
const run = (text, opts) => cleanText(text, opts).text;

describe('F-01 hapus karakter tersembunyi', () => {
  const o = only({ removeHiddenChars: true });
  it('menghapus ZWSP', () => expect(run('a\u200Bb', o)).toBe('ab'));
  it('mempertahankan newline dan tab', () => expect(run('a\n\tb\r\n', o)).toBe('a\n\tb\r\n'));
  it('menghapus BOM, SHY, LRM/RLM, bidi', () => expect(run('\uFEFFa\u00ADb\u200E\u200F\u202Ec\u2066d', o)).toBe('abcd'));
  it('menghapus kontrol C0/C1', () => expect(run('a\u0000b\u0007c\u0085d\u007f', o)).toBe('abcd'));
  it('teks kosong', () => expect(run('', o)).toBe(''));
  it('mempertahankan ZWJ pada emoji (default)', () => {
    const family = '\u{1F468}\u200D\u{1F469}\u200D\u{1F467}';
    expect(run(family, o)).toBe(family);
  });
  it('menghapus ZWJ di luar emoji', () => expect(run('a\u200Db', o)).toBe('ab'));
  it('menghapus ZWJ emoji bila sub-opsi mati', () => {
    expect(run('\u{1F468}\u200D\u{1F469}', { ...o, preserveEmojiZwj: false })).toBe('\u{1F468}\u{1F469}');
  });
  it('menghitung perubahan', () => expect(cleanText('a\u200B\u200Bb', o).changes.removeHiddenChars).toBe(2));
});

describe('F-02 konversi spasi tidak pecah', () => {
  const o = only({ convertNbsp: true });
  it('NBSP → spasi', () => expect(run('a\u00A0b', o)).toBe('a b'));
  it('tidak menggabungkan spasi berurutan', () => expect(run('a\u00A0\u00A0b', o)).toBe('a  b'));
  it('spasi khusus lain', () => expect(run('a\u202Fb\u2007c\u3000d\u2009e', o)).toBe('a b c d e'));
  it('tanpa perubahan', () => expect(run('a b', o)).toBe('a b'));
});

describe('F-03 normalisasi dash', () => {
  const o = only({ normalizeDashes: true });
  it('en dash rentang angka', () => expect(run('2020\u20132024', o)).toBe('2020-2024'));
  it('em dash tanpa spasi tambahan', () => expect(run('ya\u2014tidak', o)).toBe('ya-tidak'));
  it('minus & lainnya', () => expect(run('\u2212\u2010\u2011\u2012\u2015', o)).toBe('-----'));
  it('hyphen ASCII tetap', () => expect(run('a-b', o)).toBe('a-b'));
});

describe('F-04 normalisasi kutipan', () => {
  const o = only({ normalizeQuotes: true });
  it('kutip ganda', () => expect(run('\u201Chalo\u201D', o)).toBe('"halo"'));
  it('apostrof', () => expect(run('don\u2019t', o)).toBe("don't"));
  it('guillemet & low-9', () => expect(run('\u00ABa\u00BB \u201Eb\u201C \u2039c\u203A \u201Ad\u2018', o)).toBe('"a" "b" \'c\' \'d\''));
});

describe('F-05 ellipsis', () => {
  const o = only({ convertEllipsis: true });
  it('… → ...', () => expect(run('tunggu\u2026', o)).toBe('tunggu...'));
  it('tanpa perubahan', () => expect(run('tunggu...', o)).toBe('tunggu...'));
});

describe('F-06 trailing whitespace', () => {
  const o = only({ trimTrailingWhitespace: true });
  it('contoh PRD', () => expect(run('abc   \ndef\t', o)).toBe('abc\ndef'));
  it('mempertahankan CRLF', () => expect(run('a  \r\nb \r\n', o)).toBe('a\r\nb\r\n'));
  it('spasi di awal tetap', () => expect(run('  a  ', o)).toBe('  a'));
  it('NBSP di akhir ikut terhapus bila F-02 aktif', () => {
    expect(run('a\u00A0\nb', only({ trimTrailingWhitespace: true, convertNbsp: true }))).toBe('a\nb');
  });
});

describe('F-07 tanda bintang', () => {
  const o = only({ removeAsterisks: true });
  it('contoh PRD', () => expect(run('**penting** dan *miring*', o)).toBe('penting dan miring'));
  it('bullet "* " → "- " (default)', () => expect(run('* satu\n  * dua', o)).toBe('- satu\n  - dua'));
  it('bullet dihapus bila convertBullets mati', () => expect(run('* satu', { ...o, convertBullets: false })).toBe(' satu'));
  it('tidak menyentuh blok kode berpagar', () => expect(run('```\na*b\n```\n*x*', o)).toBe('```\na*b\n```\nx'));
});

describe('F-08 judul Markdown', () => {
  const o = only({ removeMarkdownHeadings: true });
  it('contoh PRD', () => expect(run('## Pendahuluan', o)).toBe('Pendahuluan'));
  it('hashtag tetap', () => expect(run('#tag', o)).toBe('#tag'));
  it('blok kode berpagar tidak disentuh', () => expect(run('```sh\n# komentar\n```\n# Judul', o)).toBe('```sh\n# komentar\n```\nJudul'));
  it('7 pagar bukan judul', () => expect(run('####### x', o)).toBe('####### x'));
  it('indentasi 4 spasi bukan judul', () => expect(run('    # x', o)).toBe('    # x'));
  it('pagar tilde', () => expect(run('~~~\n# a\n~~~\n# b', o)).toBe('~~~\n# a\n~~~\nb'));
});

describe('F-09 karakter mirip', () => {
  const o = only({ convertLookalikes: true });
  it('kata campuran-skrip', () => expect(run('p\u0430ypal', o)).toBe('paypal'));
  it('kata Kiril murni tidak disentuh (mode mixed)', () => expect(run('\u0440\u0430\u0437', o)).toBe('\u0440\u0430\u0437'));
  it('mode all mengonversi semuanya', () => expect(run('\u0440\u0430\u0441', { ...o, lookalikeMode: 'all' })).toBe('pac'));
  it('nonaktif secara default', () => expect(run('p\u0430ypal', {})).toBe('p\u0430ypal'));
  it('Yunani omicron', () => expect(run('g\u03BFogle', o)).toBe('google'));
});

describe('F-10 normalisasi Unicode', () => {
  it('NFC menggabungkan diakritik', () => expect(run('e\u0301', only({ normalizeUnicode: 'NFC' }))).toBe('\u00E9'));
  it('NFC tidak meruntuhkan ligatur', () => expect(run('\uFB01', only({ normalizeUnicode: 'NFC' }))).toBe('\uFB01'));
  it('NFKC meruntuhkan ligatur', () => expect(run('\uFB01', only({ normalizeUnicode: 'NFKC' }))).toBe('fi'));
  it('NFKC fullwidth', () => expect(run('\uFF28\uFF45\uFF4C\uFF4C\uFF4F', only({ normalizeUnicode: 'NFKC' }))).toBe('Hello'));
  it('re-normalisasi setelah penghapusan karakter tersembunyi', () => {
    expect(run('e\u200B\u0301', only({ normalizeUnicode: 'NFC', removeHiddenChars: true }))).toBe('\u00E9');
  });
});

describe('pipeline gabungan', () => {
  it('default menangani contoh keluaran AI', () => {
    const input = '## Ringkasan\u00A0 \n**Penting**\u200B: \u201Cdata\u201D 2020\u20132024\u2026  \n* item';
    expect(run(input, {})).toBe('Ringkasan\nPenting: "data" 2020-2024...\n- item');
  });
  it('teks ASCII murni tidak berubah', () => expect(run('Hello world', {})).toBe('Hello world'));
  it('emoji & surrogate pair aman', () => expect(run('Halo \u{1F44B}\u{1F3FD} \u{1D400}', {})).toBe('Halo \u{1F44B}\u{1F3FD} \u{1D400}'));
  it('teks Indonesia aman', () => {
    const t = 'Pemerintah menetapkan anggaran pendidikan sebesar 20% dari APBN.';
    expect(run(t, {})).toBe(t);
  });
  it('totalChanges menjumlahkan semua aturan', () => {
    const r = cleanText('a\u200B\u2014b', {});
    expect(r.totalChanges).toBe(2);
  });
  it('tidak melempar untuk input non-string', () => {
    expect(() => createCleaner()(undefined)).not.toThrow();
  });
});

describe('idempotensi (property-based)', () => {
  const special = [
    '\u200B', '\u200C', '\u200D', '\uFEFF', '\u00AD', '\u202E', '\u0000', '\u0085',
    '\u00A0', '\u202F', '\u3000', '\u2013', '\u2014', '\u2212', '\u201C', '\u201D',
    '\u2019', '\u00AB', '\u2026', '*', '**', '#', '## ', '\n', '\r\n', ' ', '\t',
    '```', '~~~', 'e', '\u0301', '\u0308', 'a', 'A', '\u0430', '\u043E', '\u03BF',
    '\uFB01', '\uFF21', '\u{1F468}', '\u{1F469}', '\uFE0F', '\u{1F3FD}', 'p', '-', '"',
    '\u1100', '\u1161', '\u0627', '\u0915', '\u094D', '\u0937',
  ];
  const textArb = fc.array(fc.oneof(fc.constantFrom(...special), fc.string({ maxLength: 4 }), fc.fullUnicodeString({ maxLength: 3 })), { maxLength: 40 }).map((a) => a.join(''));
  const optsArb = fc.record({
    removeHiddenChars: fc.boolean(),
    convertNbsp: fc.boolean(),
    normalizeDashes: fc.boolean(),
    normalizeQuotes: fc.boolean(),
    convertEllipsis: fc.boolean(),
    trimTrailingWhitespace: fc.boolean(),
    removeAsterisks: fc.boolean(),
    removeMarkdownHeadings: fc.boolean(),
    convertLookalikes: fc.boolean(),
    normalizeUnicode: fc.constantFrom(false, 'NFC', 'NFKC'),
    preserveEmojiZwj: fc.boolean(),
    lookalikeMode: fc.constantFrom('mixed', 'all'),
    convertBullets: fc.boolean(),
  });

  it('clean(clean(x)) === clean(x) untuk semua kombinasi opsi', () => {
    fc.assert(
      fc.property(textArb, optsArb, (text, opts) => {
        const clean = createCleaner(opts);
        const once = clean(text).text;
        const twice = clean(once).text;
        return once === twice;
      }),
      { numRuns: 3000 },
    );
  });

  it('putaran kedua melaporkan nol perubahan', () => {
    fc.assert(
      fc.property(textArb, optsArb, (text, opts) => {
        const clean = createCleaner(opts);
        return clean(clean(text).text).totalChanges === 0;
      }),
      { numRuns: 1500 },
    );
  });
});

describe('batas input', () => {
  it('countWords', () => {
    expect(countWords('')).toBe(0);
    expect(countWords('  satu  dua\ttiga\nempat ')).toBe(4);
    expect(countWords('a\u200Bb')).toBe(1);
    expect(countWords('a\u00A0b')).toBe(2);
  });
  const words = (n) => Array.from({ length: n }, () => 'kata').join(' ');
  it('9.999 dan 10.000 kata lolos', () => {
    expect(validateLength(words(9_999)).ok).toBe(true);
    expect(validateLength(words(MAX_WORDS)).ok).toBe(true);
  });
  it('10.001 kata ditolak', () => {
    const r = validateLength(words(10_001));
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('TOO_MANY_WORDS');
  });
  it('satu kata raksasa ditolak karena karakter', () => {
    const r = validateLength('x'.repeat(MAX_CHARS + 1));
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('TOO_MANY_CHARS');
    expect(validateLength('x'.repeat(MAX_CHARS)).ok).toBe(true);
  });
  it('truncateToWords', () => {
    expect(truncateToWords('a b c d', 2)).toBe('a b');
    expect(truncateToWords('a b', 5)).toBe('a b');
    expect(countWords(truncateToWords(words(12_000)))).toBe(MAX_WORDS);
  });
});

describe('G-12 visualizeHidden', () => {
  it('label terbaca', () => {
    expect(visualizeHidden('a\u200Bb\u00A0c\uFEFF\u00AD\u200C\u200D\u2060\u200E\u200F')).toBe(
      'a[ZWSP]b[NBSP]c[BOM][SHY][ZWNJ][ZWJ][WJ][LRM][RLM]',
    );
  });
  it('kontrol/bidi lain sebagai U+XXXX', () => expect(visualizeHidden('\u202E\u0007\u3000')).toBe('[U+202E][U+0007][U+3000]'));
  it('teks biasa tidak berubah', () => expect(visualizeHidden('halo dunia\n\t')).toBe('halo dunia\n\t'));
  it('scanHidden menghitung', () => {
    const r = scanHidden('a\u200B\u200Bb');
    expect(r.count).toBe(2);
    expect(r.byLabel.ZWSP).toBe(2);
    expect(r.segments).toHaveLength(4);
  });
});

describe('validasi opsi & request', () => {
  it('default bila kosong', () => expect(resolveOptions(undefined)).toEqual({ ok: true, options: { ...DEFAULT_OPTIONS } }));
  it('menolak tipe salah', () => expect(resolveOptions({ removeAsterisks: 'ya' }).ok).toBe(false));
  it('menolak kunci asing', () => expect(resolveOptions({ foo: true }).ok).toBe(false));
  it('normalizeUnicode', () => {
    expect(resolveOptions({ normalizeUnicode: 'nfkc' }).options.normalizeUnicode).toBe('NFKC');
    expect(resolveOptions({ normalizeUnicode: 'X' }).ok).toBe(false);
  });
  it('parseCleanRequest', () => {
    expect(parseCleanRequest({ text: 1 }).ok).toBe(false);
    expect(parseCleanRequest(null).ok).toBe(false);
    expect(parseCleanRequest({ text: 'a' }).ok).toBe(true);
  });
});

describe('validasi statistik', () => {
  const counts = Object.fromEntries(RULE_KEYS.map((k) => [k, 1]));
  it('payload valid', () => {
    const r = validateStatsPayload({ v: 1, counts });
    expect(r.ok).toBe(true);
    expect(r.total).toBe(RULE_KEYS.length);
  });
  it('menolak kunci asing', () => expect(validateStatsPayload({ v: 1, counts: { evil: 1 } }).ok).toBe(false));
  it('menolak negatif & non-integer', () => {
    expect(validateStatsPayload({ v: 1, counts: { normalizeDashes: -1 } }).ok).toBe(false);
    expect(validateStatsPayload({ v: 1, counts: { normalizeDashes: 1.5 } }).ok).toBe(false);
  });
  it('menolak nilai > MAX_CHARS', () => expect(validateStatsPayload({ v: 1, counts: { normalizeDashes: 2_000_000_007_440_752 } }).ok).toBe(false));
  it('menolak jumlah > MAX_CHARS', () => {
    expect(validateStatsPayload({ v: 1, counts: { normalizeDashes: MAX_CHARS, normalizeQuotes: 1 } }).ok).toBe(false);
  });
  it('menolak semua nol & kunci tingkat atas asing', () => {
    expect(validateStatsPayload({ v: 1, counts: { normalizeDashes: 0 } }).ok).toBe(false);
    expect(validateStatsPayload({ v: 1, counts, total: 99 }).ok).toBe(false);
  });
});
