import { useEffect, useMemo, useRef, useState } from 'react';
import { MAX_CHARS, MAX_WORDS, RULES, truncateToWords } from '@cleantext/core';
import { fmt, SAMPLE_TEXT } from '../config.js';
import { Check, Copy, Download, Eye, Scissors, Trash } from './Icons.jsx';
import HiddenPreview from './HiddenPreview.jsx';

/**
 * Meja kerja: input → (aturan, di section berikutnya) → output.
 */
export default function Workbench({ text, setText, limit, cleaner, live, setLive, onManualClean, enabledCount }) {
  const [copied, setCopied] = useState(false);
  const [showHidden, setShowHidden] = useState(false);
  const outputRef = useRef(/** @type {HTMLTextAreaElement | null} */ (null));
  const copyTimer = useRef(/** @type {any} */ (null));

  useEffect(() => () => clearTimeout(copyTimer.current), []);

  const { words, chars, status, reason } = limit;
  const blocked = status === 'error';
  const pct = Math.min(100, (words / MAX_WORDS) * 100);

  const counterLabel =
    status === 'error'
      ? reason === 'TOO_MANY_CHARS'
        ? 'Melebihi batas karakter'
        : 'Melebihi batas kata'
      : status === 'warn'
        ? 'Mendekati batas'
        : 'Dalam batas';

  const summary = useMemo(
    () => RULES.filter((r) => (cleaner?.changes?.[r.key] || 0) > 0).map((r) => ({ ...r, n: cleaner.changes[r.key] })),
    [cleaner?.changes],
  );

  const output = blocked ? '' : cleaner.output || '';
  const statusText = blocked
    ? 'Diblokir'
    : !text
      ? 'Menunggu teks'
      : cleaner.busy
        ? 'Memproses…'
        : cleaner.runs === 0 && !live
          ? 'Belum dibersihkan'
          : cleaner.totalChanges === 0
            ? 'Sudah bersih'
            : 'Dibersihkan';

  async function copy(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
    } catch {
      outputRef.current?.select();
      document.execCommand('copy');
    }
    setCopied(true);
    clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 1800);
  }

  function download(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!output) return;
    try {
      const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cleantext-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.txt`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        a.remove();
        URL.revokeObjectURL(url);
      }, 500);
    } catch (err) {
      console.error('[Workbench] download error:', err);
    }
  }

  return (
    <section className="section workbench" id="editor" aria-labelledby="editor-title">
      <div className="wrap">
        <header className="section__head">
          <span className="label section__num">03 — Meja kerja</span>
          <h2 id="editor-title" className="section__title">
            Tempel. <em className="serif accent">Lihat bersihnya.</em>
          </h2>
          <div className="workbench__controls">
            <label className="switch">
              <input
                type="checkbox"
                checked={live}
                onChange={(e) => {
                  e.stopPropagation();
                  setLive(e.target.checked);
                }}
              />
              <span className="switch__track" aria-hidden="true" />
              <span className="label">Live</span>
            </label>
            <button
              type="button"
              className="btn btn--dark btn--sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onManualClean();
              }}
              disabled={blocked || !text || enabledCount === 0}
            >
              Bersihkan
            </button>
          </div>
        </header>

        <div className="panels">
          {/* ---------------------------------------------------------- INPUT */}
          <div className="panel">
            <div className="panel__bar">
              <label htmlFor="input-text" className="label panel__title">
                <span className="panel__idx">A</span> Teks asli
              </label>
              <div className="panel__tools">
                {!text && (
                  <button
                    type="button"
                    className="text-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setText(SAMPLE_TEXT);
                    }}
                  >
                    Coba contoh
                  </button>
                )}
                {text && (
                  <button
                    type="button"
                    className="text-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setText('');
                    }}
                    aria-label="Kosongkan input"
                  >
                    <Trash /> Kosongkan
                  </button>
                )}
              </div>
            </div>
            <textarea
              id="input-text"
              className="panel__area"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={'Tempel teks di sini…\n\nKeluaran AI, dokumen Word, halaman web, PDF, chat.'}
              spellCheck={false}
              aria-describedby="input-counter input-error"
            />
            <div className="panel__foot">
              <div id="input-counter" className={`counter counter--${status}`} aria-live="polite">
                <div className="counter__bar" aria-hidden="true">
                  <span style={{ width: `${pct}%` }} />
                </div>
                <span className="counter__nums">
                  <strong>{reason === 'TOO_MANY_CHARS' ? '—' : fmt.format(words)}</strong> / {fmt.format(MAX_WORDS)} kata
                </span>
                <span className="counter__chars">{fmt.format(chars)} karakter</span>
                <span className="counter__state label">{counterLabel}</span>
              </div>
              {cleaner.hiddenCount > 0 && !blocked && (
                <span className="tag tag--accent" title="Karakter tersembunyi & spasi khusus terdeteksi pada input">
                  {fmt.format(cleaner.hiddenCount)} tersembunyi
                </span>
              )}
            </div>
            {blocked && (
              <div id="input-error" className="alert" role="alert">
                <p>
                  <strong>Teks terlalu panjang.</strong>{' '}
                  {reason === 'TOO_MANY_CHARS'
                    ? `Terlalu banyak karakter: ${fmt.format(chars)} dari maksimal ${fmt.format(MAX_CHARS)}.`
                    : `Terlalu banyak kata: ${fmt.format(words)} dari maksimal ${fmt.format(MAX_WORDS)}.`}{' '}
                  Teks tidak dipotong otomatis.
                </p>
                {reason === 'TOO_MANY_WORDS' && (
                  <button
                    type="button"
                    className="btn btn--dark btn--sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setText(truncateToWords(text, MAX_WORDS));
                    }}
                  >
                    <Scissors /> Potong ke {fmt.format(MAX_WORDS)} kata
                  </button>
                )}
              </div>
            )}
          </div>

          {/* --------------------------------------------------------- OUTPUT */}
          <div className="panel panel--out">
            <div className="panel__bar">
              <label htmlFor="output-text" className="label panel__title">
                <span className="panel__idx panel__idx--accent">B</span> Hasil bersih
              </label>
              <div className="panel__tools">
                <span className={`status ${cleaner.busy ? 'status--busy' : ''}`} aria-live="polite">
                  <span className="dot" aria-hidden="true" /> {statusText}
                </span>
              </div>
            </div>
            <textarea
              id="output-text"
              ref={outputRef}
              className="panel__area panel__area--out"
              value={output}
              readOnly
              placeholder="Hasil muncul otomatis di sini."
              spellCheck={false}
            />
            <div className="panel__foot">
              <span className="counter__nums">
                <strong>{fmt.format(cleaner.totalChanges || 0)}</strong> perubahan
                {cleaner.durationMs > 0 && <span className="muted"> · {cleaner.durationMs.toFixed(1)} ms</span>}
              </span>
              <div className="actions">
                <button type="button" className="btn btn--accent btn--sm" onClick={copy} disabled={!output}>
                  {copied ? <Check /> : <Copy />} {copied ? 'Tersalin' : 'Salin hasil'}
                </button>
                <button type="button" className="btn btn--ghost btn--sm" onClick={download} disabled={!output}>
                  <Download /> Unduh .txt
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------- RINGKASAN (G-05) */}
        <div className="summary" aria-live="polite">
          <div className="summary__head">
            <span className="label">Ringkasan perubahan</span>
            <label className="switch switch--sm">
              <input
                type="checkbox"
                checked={showHidden}
                onChange={(e) => {
                  e.stopPropagation();
                  setShowHidden(e.target.checked);
                }}
              />
              <span className="switch__track" aria-hidden="true" />
              <span className="label">
                <Eye /> Tampilkan karakter tersembunyi
              </span>
            </label>
          </div>
          {summary.length > 0 ? (
            <ol className="summary__list">
              {summary.map((r) => (
                <li key={r.key}>
                  <span className="summary__n">{fmt.format(r.n)}</span>
                  <span className="summary__u">{r.unit}</span>
                  <span className="label muted">{r.id}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="muted summary__empty">
              {text && !blocked && (live || cleaner.runs > 0) ? 'Tidak ada yang perlu dibersihkan — teks Anda sudah rapi.' : 'Belum ada perubahan.'}
            </p>
          )}
          {showHidden && <HiddenPreview text={blocked ? '' : text} scan={cleaner.scan} />}
        </div>
      </div>
    </section>
  );
}
