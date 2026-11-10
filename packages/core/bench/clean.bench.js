import { bench, describe } from 'vitest';
import { createCleaner, DEFAULT_OPTIONS } from '../src/index.js';

// Dataset 10.000 kata: teks Indonesia + derau artefak.
const base = [
  'Pemerintah', 'menetapkan', 'anggaran', 'pendidikan', 'sebesar', '20%', 'dari', 'APBN', 'untuk',
  'tahun', '2020\u20132024', '\u201Cberkelanjutan\u201D', 'dan', '**penting**', 'bagi\u00A0semua', 'warga\u200B',
  'negara\u2026', 'don\u2019t', 'peneliti\u2014mahasiswa', 'e\u0301tude',
];
const words = [];
for (let i = 0; i < 10_000; i++) {
  words.push(base[i % base.length]);
  if (i % 12 === 11) words.push(i % 48 === 47 ? '  \n## Bagian\n' : ' \n');
}
const sample = words.join(' ');
const ascii = sample.replace(/[^\x00-\x7f]/g, '');

const cleanDefault = createCleaner(DEFAULT_OPTIONS);
const cleanAll = createCleaner({ ...DEFAULT_OPTIONS, convertLookalikes: true, normalizeUnicode: 'NFKC' });

describe('10.000 kata', () => {
  bench('default', () => {
    cleanDefault(sample);
  });
  bench('semua aktif + NFKC', () => {
    cleanAll(sample);
  });
  bench('ASCII fast path', () => {
    cleanDefault(ascii);
  });
});
