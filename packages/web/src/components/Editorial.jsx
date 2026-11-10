const PAIRS = [
  { name: 'Spasi lebar nol', before: 'data\u2009', mark: '[ZWSP]', after: 'base', clean: 'database', note: 'Pencarian "database" gagal tanpa pesan galat.' },
  { name: 'Non-breaking space', before: 'Rp', mark: '[NBSP]', after: '10.000', clean: 'Rp 10.000', note: 'Tampak normal, tetapi split() & regex meleset.' },
  { name: 'Kutipan pintar', before: '{\u201Ckey\u201D: \u201Cval\u201D}', mark: '', after: '', clean: '{"key": "val"}', note: 'JSON tidak valid; parser menolak.' },
  { name: 'Em dash', before: 'npm i \u2014save', mark: '', after: '', clean: 'npm i -save', note: 'Perintah shell rusak saat ditempel.' },
  { name: 'Sisa Markdown', before: '## **Ringkasan**', mark: '', after: '', clean: 'Ringkasan', note: 'Tampil mentah di CMS yang tidak merender Markdown.' },
];

/** Section 05 — penjelasan editorial gelap. */
export default function Editorial() {
  return (
    <section className="section editorial dark" id="mengapa" aria-labelledby="editorial-title">
      <div className="wrap">
        <span className="label section__num">05 — Mengapa CleanText</span>
        <h2 id="editorial-title" className="editorial__title">
          Yang tak terlihat <br />
          tetap <em className="serif accent">merusak.</em>
        </h2>

        <div className="editorial__grid">
          <div className="editorial__intro">
            <p className="lede">
              Teks yang disalin dari asisten AI, dokumen, web, atau chat sering membawa artefak yang mudah terlewat. Ia baru
              ketahuan setelah ditempel, saat build gagal, diff berisik, atau pencarian tidak menemukan apa-apa.
            </p>
            <p className="muted">
              CleanText mencabut artefak tersebut dalam satu kali tempel, sehingga teks yang Anda kirim terlihat persis seperti
              yang Anda tulis.
            </p>
            <ul className="editorial__points">
              <li>
                <span className="accent">01</span> Privasi: berjalan di peramban
              </li>
              <li>
                <span className="accent">02</span> Tanpa akun, tanpa paywall
              </li>
              <li>
                <span className="accent">03</span> Setiap aturan adalah sakelar
              </li>
              <li>
                <span className="accent">04</span> Transparan: tiap perubahan dihitung
              </li>
              <li>
                <span className="accent">05</span> Default aman untuk teks multibahasa
              </li>
              <li>
                <span className="accent">06</span> Dibangun terbuka — UI, API &amp; CLI satu inti
              </li>
            </ul>
          </div>

          <div className="editorial__table" role="table" aria-label="Contoh teks kotor dan bersih">
            <div className="editorial__row editorial__row--head" role="row">
              <span role="columnheader" className="label">Artefak</span>
              <span role="columnheader" className="label">Sebelum</span>
              <span role="columnheader" className="label">Sesudah</span>
            </div>
            {PAIRS.map((p) => (
              <div className="editorial__row" role="row" key={p.name}>
                <span role="cell" className="editorial__name">
                  {p.name}
                  <small>{p.note}</small>
                </span>
                <span role="cell" className="editorial__before">
                  <code>
                    {p.before}
                    {p.mark && <mark>{p.mark}</mark>}
                    {p.after}
                  </code>
                </span>
                <span role="cell" className="editorial__after">
                  <code>{p.clean}</code>
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="editorial__foot muted">
          Catatan keyakinan: bahwa artefak ini <em>umum</em> pada keluaran AI berasal dari pengamatan, bukan data proyek ini.
          Statistik global di bawah memberi angka nyata.
        </p>
      </div>
    </section>
  );
}
