import { RULES, DEFAULT_OPTIONS } from '@cleantext/core';
import { Star } from './Icons.jsx';

const EXAMPLES = {
  removeHiddenChars: ['a\u2009[ZWSP]\u2009b', 'ab'],
  convertNbsp: ['a[NBSP]b', 'a b'],
  normalizeDashes: ['2020\u20132024', '2020-2024'],
  normalizeQuotes: ['\u201Chalo\u201D', '"halo"'],
  convertEllipsis: ['tunggu\u2026', 'tunggu...'],
  trimTrailingWhitespace: ['abc\u00B7\u00B7\u00B7', 'abc'],
  removeAsterisks: ['**penting**', 'penting'],
  removeMarkdownHeadings: ['## Judul', 'Judul'],
  convertLookalikes: ['p\u0430ypal', 'paypal'],
  normalizeUnicode: ['e + \u00B4', '\u00E9'],
};

/**
 * Section 04 — 10 aturan dalam grid dua kolom bernomor (1, 2…10).
 */
export default function Rules({ options, setOptions }) {
  const isOn = (key) => (key === 'normalizeUnicode' ? options.normalizeUnicode !== false : !!options[key]);
  const enabled = RULES.filter((r) => isOn(r.key)).length;

  const toggle = (key) =>
    setOptions((o) => {
      if (key === 'normalizeUnicode') return { ...o, normalizeUnicode: o.normalizeUnicode ? false : o.lastUnicodeForm || 'NFC' };
      return { ...o, [key]: !o[key] };
    });

  const setAll = (on, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setOptions((o) => {
      const next = { ...o };
      for (const r of RULES) {
        if (r.key === 'normalizeUnicode') next.normalizeUnicode = on ? o.lastUnicodeForm || 'NFC' : false;
        else next[r.key] = on;
      }
      return next;
    });
  };

  const reset = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setOptions({ ...DEFAULT_OPTIONS, lastUnicodeForm: 'NFC' });
  };

  return (
    <section className="section rules" id="aturan" aria-labelledby="rules-title">
      <div className="wrap">
        <header className="section__head section__head--split">
          <div>
            <span className="label section__num">04 — Opsi pembersihan</span>
            <h2 id="rules-title" className="section__title">
              Sepuluh aturan. <br />
              <em className="serif accent">Anda</em> yang memutuskan.
            </h2>
          </div>
          <div className="rules__aside">
            <p className="muted">
              Setiap aturan adalah sakelar independen. Pilihan Anda disimpan di peramban ini dan diingat pada kunjungan berikutnya.
            </p>
            <div className="rules__bulk" role="group" aria-label="Aksi massal">
              <span className="label">
                <strong className="accent">{enabled}</strong>/10 aktif
              </span>
              <button type="button" className="text-btn" onClick={(e) => setAll(true, e)}>
                Pilih semua
              </button>
              <button type="button" className="text-btn" onClick={(e) => setAll(false, e)}>
                Hapus semua
              </button>
              <button type="button" className="text-btn" onClick={reset}>
                Reset default
              </button>
            </div>
          </div>
        </header>

        <ol className="rules__grid">
          {RULES.map((r) => {
            const on = isOn(r.key);
            const [from, to] = EXAMPLES[r.key];
            const inputId = `rule-${r.key}`;
            return (
              <li key={r.key} className={`rule ${on ? 'rule--on' : ''}`}>
                <input
                  type="checkbox"
                  id={inputId}
                  className="sr-only rule__input"
                  checked={on}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggle(r.key);
                  }}
                  aria-describedby={`${inputId}-desc`}
                />
                <label htmlFor={inputId} className="rule__label">
                  <span className="rule__rank" aria-hidden="true">
                    {r.rank}
                  </span>
                  <span className="rule__body">
                    <span className="rule__meta label">
                      {r.id} · {r.group}
                      {!DEFAULT_OPTIONS[r.key] && <span className="rule__off-default"> · default mati</span>}
                    </span>
                    <span className="rule__name">{r.label}</span>
                    <span id={`${inputId}-desc`} className="rule__desc">
                      {r.desc}
                    </span>
                    <span className="rule__example" aria-label={`Contoh: ${from} menjadi ${to}`}>
                      <code>{from}</code>
                      <span aria-hidden="true">→</span>
                      <code>{to}</code>
                    </span>
                  </span>
                  <span className="rule__star" aria-hidden="true">
                    <Star filled={on} />
                  </span>
                  <span className="sr-only">{on ? 'aktif' : 'nonaktif'}</span>
                </label>

                {/* Sub-opsi */}
                {r.key === 'removeHiddenChars' && on && (
                  <SubToggle id="sub-zwj" checked={options.preserveEmojiZwj} onChange={(v) => setOptions((o) => ({ ...o, preserveEmojiZwj: v }))}>
                    Pertahankan ZWJ pada emoji
                  </SubToggle>
                )}
                {r.key === 'removeAsterisks' && on && (
                  <SubToggle id="sub-bullets" checked={options.convertBullets} onChange={(v) => setOptions((o) => ({ ...o, convertBullets: v }))}>
                    Ubah bullet "* " menjadi "- "
                  </SubToggle>
                )}
                {r.key === 'convertLookalikes' && on && (
                  <SubToggle
                    id="sub-lookalike"
                    checked={options.lookalikeMode === 'all'}
                    onChange={(v) => setOptions((o) => ({ ...o, lookalikeMode: v ? 'all' : 'mixed' }))}
                  >
                    Konversi semua (bukan hanya kata campuran-skrip)
                  </SubToggle>
                )}
                {r.key === 'normalizeUnicode' && on && (
                  <div className="rule__sub" role="radiogroup" aria-label="Bentuk normalisasi Unicode">
                    {['NFC', 'NFKC'].map((f) => (
                      <label key={f} className="seg">
                        <input
                          type="radio"
                          name="unicode-form"
                          value={f}
                          checked={options.normalizeUnicode === f}
                          onChange={(e) => {
                            e.stopPropagation();
                            setOptions((o) => ({ ...o, normalizeUnicode: f, lastUnicodeForm: f }));
                          }}
                        />
                        <span>{f}</span>
                      </label>
                    ))}
                    <span className="muted rule__sub-note">{options.normalizeUnicode === 'NFKC' ? 'Agresif: ligatur & fullwidth diruntuhkan' : 'Konservatif'}</span>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

function SubToggle({ id, checked, onChange, children }) {
  return (
    <div className="rule__sub">
      <label className="switch switch--sm" htmlFor={id}>
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => {
            e.stopPropagation();
            onChange(e.target.checked);
          }}
        />
        <span className="switch__track" aria-hidden="true" />
        <span>{children}</span>
      </label>
    </div>
  );
}
