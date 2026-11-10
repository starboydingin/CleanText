import { MAX_WORDS } from '@cleantext/core';
import { fmt } from '../config.js';

const STEPS = [
  { n: '01', title: 'Tempel', word: 'teks', body: `Maksimal ${fmt.format(MAX_WORDS)} kata. Penghitung menampilkan sisa kuota secara real-time — tanpa pemotongan diam-diam.` },
  { n: '02', title: 'Pilih', word: 'aturan', body: 'Sepuluh sakelar independen. Jalankan semuanya, atau hanya yang Anda perlukan. Hasil diperbarui saat Anda mengetik.' },
  { n: '03', title: 'Salin', word: 'hasilnya', body: 'Salin atau unduh sebagai .txt, lalu periksa ringkasan perubahan dan pratinjau karakter tersembunyi.' },
];

/** Section 06 — tiga langkah bernomor besar. */
export default function HowItWorks() {
  return (
    <section className="section how" id="cara-kerja" aria-labelledby="how-title">
      <div className="wrap">
        <header className="section__head section__head--split">
          <div>
            <span className="label section__num">06 — Cara kerja</span>
            <h2 id="how-title" className="section__title">
              Tiga langkah. <em className="serif accent">Nol</em> unggahan.
            </h2>
          </div>
          <p className="muted how__aside">Transformasi terjadi di perangkat Anda melalui Web Worker. Setelah dimuat sekali, halaman ini tetap bekerja tanpa jaringan.</p>
        </header>

        <ol className="how__list">
          {STEPS.map((s) => (
            <li key={s.n} className="how__item">
              <span className="how__num" aria-hidden="true">
                {s.n}
              </span>
              <h3 className="how__title">
                {s.title} <em className="serif">{s.word}</em>
              </h3>
              <p className="how__body muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
