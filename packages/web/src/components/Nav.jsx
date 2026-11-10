import { Asterisk, Moon, Sun } from './Icons.jsx';

const LINKS = [
  ['#editor', 'Editor'],
  ['#aturan', 'Aturan'],
  ['#cara-kerja', 'Cara Kerja'],
  ['#developer', 'Developer'],
  ['#statistik', 'Statistik'],
];

export default function Nav({ theme, onToggleTheme }) {
  return (
    <header className="nav">
      <div className="wrap nav__inner">
        <a
          href="#top"
          className="nav__logo"
          aria-label="CleanText, ke atas"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById('top')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <span>CleanText</span>
          <Asterisk size={13} className="accent" />
        </a>

        <nav aria-label="Navigasi utama">
          <ul className="nav__links">
            {LINKS.map(([href, label]) => (
              <li key={href}>
                <a
                  href={href}
                  onClick={(e) => {
                    e.preventDefault();
                    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="nav__meta">
          <button
            type="button"
            className="icon-btn"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleTheme();
            }}
            aria-label={theme === 'kertas' ? 'Ganti ke tema Malam (gelap)' : 'Ganti ke tema Kertas (terang)'}
            title={theme === 'kertas' ? 'Tema Malam' : 'Tema Kertas'}
          >
            {theme === 'kertas' ? <Moon /> : <Sun />}
          </button>
        </div>
      </div>
    </header>
  );
}
