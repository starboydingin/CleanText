import { ArrowUpRight } from './Icons.jsx';

/** Section 10 — pernyataan penutup. */
export default function FinalCta() {
  return (
    <section className="section cta" aria-labelledby="cta-title">
      <div className="wrap">
        <span className="label section__num">10 — Terakhir</span>
        <h2 id="cta-title" className="cta__title">
          Kirim teks yang <br />
          terlihat seperti <br />
          <em className="serif accent">yang Anda tulis.</em>
        </h2>
        <div className="cta__row">
          <a
            href="#editor"
            className="btn btn--accent btn--lg"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('editor')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Bersihkan teks sekarang <ArrowUpRight />
          </a>
          <p className="muted">Gratis. Tanpa akun. Teks Anda tidak pernah meninggalkan perangkat.</p>
        </div>
      </div>
    </section>
  );
}
