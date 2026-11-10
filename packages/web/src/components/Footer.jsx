import { VERSION } from '@cleantext/core';
import { ISSUES_URL, REPO_URL } from '../config.js';
import { Asterisk } from './Icons.jsx';

/** Section 11 — footer gelap (G-16 + kontrol statistik). */
export default function Footer({ statsOptIn, setStatsOptIn }) {
  const jump = (e, targetId) => {
    e.preventDefault();
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="footer dark">
      <div className="wrap">
        <div className="footer__top">
          <div className="footer__brand">
            <p className="footer__wordmark">
              CleanText <Asterisk size={22} className="accent" />
            </p>
            <p className="serif footer__tagline">Clean. Normalize. Simplify.</p>
          </div>

          <nav className="footer__col" aria-label="Navigasi footer">
            <span className="label">Halaman</span>
            <a href="#editor" onClick={(e) => jump(e, 'editor')}>
              Editor
            </a>
            <a href="#aturan" onClick={(e) => jump(e, 'aturan')}>
              Aturan
            </a>
            <a href="#cara-kerja" onClick={(e) => jump(e, 'cara-kerja')}>
              Cara kerja
            </a>
            <a href="#developer" onClick={(e) => jump(e, 'developer')}>
              Developer
            </a>
          </nav>

          <div className="footer__col">
            <span className="label">Terbuka</span>
            <a href={REPO_URL} target="_blank" rel="noreferrer noopener">
              Repository ↗
            </a>
            <a href={ISSUES_URL} target="_blank" rel="noreferrer noopener">
              Laporkan bug ↗
            </a>
            <a href={`${ISSUES_URL}/new?labels=enhancement`} target="_blank" rel="noreferrer noopener">
              Minta fitur ↗
            </a>
          </div>

          <div className="footer__col footer__privacy">
            <span className="label">Privasi</span>
            <label className="switch switch--sm switch--dark">
              <input
                type="checkbox"
                checked={statsOptIn}
                onChange={(e) => {
                  e.stopPropagation();
                  setStatsOptIn(e.target.checked);
                }}
              />
              <span className="switch__track" aria-hidden="true" />
              <span>Kirim hitungan anonim</span>
            </label>
            <p className="footer__disclosure">
              Bila aktif, hanya angka per jenis aturan (mis. <code>{'{"normalizeDashes": 4}'}</code>) yang dikirim ke{' '}
              <code>/api/stats</code>. Tanpa teks, tanpa cookie, tanpa ID. Saat offline, hitungan dibuang.
            </p>
          </div>
        </div>

        <div className="footer__bottom label">
          <span>© {new Date().getFullYear()} CleanText · v{VERSION}</span>
          <span>Teks Anda diproses di peramban ini dan tidak diunggah.</span>
          <span>React · Express</span>
        </div>
      </div>
    </footer>
  );
}
