/** Konfigurasi tampilan & tautan (G-16). Atur lewat variabel lingkungan Vite. */
export const REPO_URL = import.meta.env.VITE_REPO_URL || 'https://github.com/your-username/cleantext';
export const ISSUES_URL = import.meta.env.VITE_ISSUES_URL || `${REPO_URL}/issues`;
export const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || (typeof location !== 'undefined' ? location.origin : 'http://localhost:8787');

export const fmt = new Intl.NumberFormat('id-ID');

export const SAMPLE_TEXT = [
  '## Ringkasan Laporan\u00A0',
  '',
  '**Catatan penting:** hasil survei 2020\u20132024 menunjukkan \u201Cpeningkatan signifikan\u201D\u2014terutama di kota besar\u2026  ',
  '',
  '* Responden\u200B: 1.204 orang\u00A0',
  '* Wilayah\u200B: Jawa & Bali   ',
  '',
  '### Kesimpulan',
  'Don\u2019t forget: data ini \u2018sementara\u2019 dan akan diperbarui. Hubungi p\u0430yp\u0430l\u00A0support.\uFEFF',
].join('\n');
