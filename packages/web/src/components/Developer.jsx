import { useState } from 'react';
import { API_ORIGIN } from '../config.js';
import { Check, Copy } from './Icons.jsx';

const TABS = {
  curl: {
    label: 'cURL',
    code: (o) => `curl -X POST ${o}/api/clean \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "\\u201cHalo\\u201d\\u2014dunia\\u2026",
    "options": { "normalizeUnicode": "NFC" }
  }'`,
  },
  js: {
    label: 'JavaScript',
    code: (o) => `const res = await fetch('${o}/api/clean', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: '“Halo”—dunia…',
    options: { convertLookalikes: true },
  }),
});
const { text, changes, stats } = await res.json();`,
  },
  cli: {
    label: 'CLI',
    code: () => `# stdin → stdout
cat draft.md | npx cleantext --stats > clean.md

# berkas → berkas, NFKC, tanpa hapus bintang
npx cleantext draft.md -o clean.md -u nfkc --no-asterisks

# exit code: 0 sukses · 1 argumen/IO · 2 melebihi batas`,
  },
};

const RESPONSE = `{
  "text": "\\"Halo\\"-dunia...",
  "changes": { "normalizeQuotes": 2,
               "normalizeDashes": 1,
               "convertEllipsis": 1 },
  "stats": { "words": 1, "chars": 16, "durationMs": 0.04 }
}`;

/** Section 08 — integrasi developer di latar peach. */
export default function Developer() {
  const [tab, setTab] = useState(/** @type {keyof typeof TABS} */ ('curl'));
  const [copied, setCopied] = useState(false);
  const code = TABS[tab].code(API_ORIGIN);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* abaikan */
    }
  };

  return (
    <section className="section dev" id="developer" aria-labelledby="dev-title">
      <div className="wrap dev__grid">
        <div className="dev__copy">
          <span className="label section__num">08 — Integrasi developer</span>
          <h2 id="dev-title" className="dev__title">
            Satu inti. <br />
            Tiga <em className="serif">pintu.</em>
          </h2>
          <p className="lede">
            Logika yang sama dipakai oleh UI, API HTTP, dan CLI. Hasil identik di mana pun Anda menjalankannya.
          </p>
          <dl className="dev__endpoints">
            <div>
              <dt>
                <code>POST /api/clean</code>
              </dt>
              <dd>Bersihkan teks. 400 bila request tidak valid, 413 bila melebihi batas.</dd>
            </div>
            <div>
              <dt>
                <code>GET /api/health</code>
              </dt>
              <dd>Pemeriksaan status layanan.</dd>
            </div>
            <div>
              <dt>
                <code>GET /api/stats</code>
              </dt>
              <dd>Statistik pembersihan global (anonim).</dd>
            </div>
          </dl>
          <p className="dev__note">API stateless terhadap teks: isi tidak disimpan maupun dicatat pada log.</p>
        </div>

        <div className="code">
          <div className="code__bar" role="tablist" aria-label="Contoh kode">
            {Object.entries(TABS).map(([k, t]) => (
              <button
                key={k}
                role="tab"
                type="button"
                aria-selected={tab === k}
                className={`code__tab ${tab === k ? 'is-active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setTab(/** @type {any} */ (k));
                }}
              >
                {t.label}
              </button>
            ))}
            <button
              type="button"
              className="code__copy"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                copy();
              }}
              aria-label="Salin kode"
            >
              {copied ? <Check /> : <Copy />}
            </button>
          </div>
          <pre className="code__body" role="tabpanel">
            <code>{code}</code>
          </pre>
          {tab !== 'cli' && (
            <>
              <div className="code__divider label">Respons · 200 OK</div>
              <pre className="code__body code__body--resp">
                <code>{RESPONSE}</code>
              </pre>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
