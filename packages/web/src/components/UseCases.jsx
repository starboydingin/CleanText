const USERS = [
  { who: 'Developer', what: 'Membersihkan potongan kode dan teks dari asisten AI sebelum masuk proyek; memakai API dan CLI di pipeline.', tag: 'API · CLI' },
  { who: 'Penulis & editor', what: 'Teks bebas pemformatan tersembunyi sebelum masuk dokumen atau CMS.', tag: 'Naskah' },
  { who: 'Pembuat konten', what: 'Menghindari masalah format saat memindahkan teks antar platform.', tag: 'Sosial' },
  { who: 'Mahasiswa & peneliti', what: 'Naskah dan kutipan yang konsisten: tanda baca, dash, dan kutipan seragam.', tag: 'Akademik' },
  { who: 'Pengguna alat AI', what: 'Teks yang lebih bersih dan andal dari LLM mana pun — ChatGPT, Claude, Gemini.', tag: 'LLM' },
];

/** Section 07 — daftar pengguna minimal. */
export default function UseCases() {
  return (
    <section className="section uses" id="untuk-siapa" aria-labelledby="uses-title">
      <div className="wrap uses__grid">
        <header>
          <span className="label section__num">07 — Untuk siapa</span>
          <h2 id="uses-title" className="section__title">
            Untuk siapa pun <br />
            yang <em className="serif accent">menempel</em> teks.
          </h2>
        </header>
        <ul className="uses__list">
          {USERS.map((u, i) => (
            <li key={u.who} className="uses__item">
              <span className="uses__idx label">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="uses__who">{u.who}</h3>
              <p className="uses__what muted">{u.what}</p>
              <span className="tag">{u.tag}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
