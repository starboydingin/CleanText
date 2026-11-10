import { MAX_WORDS } from '@cleantext/core';
import { fmt } from '../config.js';
import { ArrowDown, ArrowRight, Asterisk } from './Icons.jsx';

export default function Hero() {
  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="wrap">
        <div className="hero__meta label">
          <span>No. 01 — Alat teks</span>
          <span>Edisi 2026 · v1.2</span>
          <span>Bahasa Indonesia</span>
          <span className="hero__meta-right">Tanpa akun · Tanpa paywall</span>
        </div>

        <h1 id="hero-title" className="hero__wordmark">
          <span className="sr-only">CleanText</span>
          <span aria-hidden="true">
            Clean<span className="hero__wordmark-t">Text</span>
            <Asterisk className="hero__star" />
          </span>
        </h1>

        <div className="hero__grid">
          <p className="hero__tagline serif">
            Clean. <br />
            Normalize. <br />
            Simplify.
          </p>

          <div className="hero__copy">
            <p className="lede">
              Teks dari ChatGPT, Word, PDF, dan web sering membawa karakter yang <em className="serif">tak terlihat</em>, lalu
              diam-diam merusak pencarian, kode, dan diff Anda.
            </p>
            <p className="muted">
              CleanText mencabut spasi lebar nol, non-breaking space, dash dan kutipan tipografis, serta sisa Markdown dalam
              satu kali tempel. Semua diproses lokal di perangkat Anda; maksimal {fmt.format(MAX_WORDS)} kata per pembersihan.
            </p>
            <div className="hero__ctas">
              <a
                href="#editor"
                className="btn btn--accent"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('editor')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Mulai membersihkan <ArrowDown />
              </a>
              <a
                href="#developer"
                className="btn btn--ghost"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('developer')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                API &amp; CLI <ArrowRight />
              </a>
            </div>
          </div>

          <dl className="hero__facts">
            <div>
              <dt className="label">Aturan</dt>
              <dd>10</dd>
            </div>
            <div>
              <dt className="label">Teks diunggah</dt>
              <dd>0 B</dd>
            </div>
            <div>
              <dt className="label">Bekerja offline</dt>
              <dd>Ya</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
