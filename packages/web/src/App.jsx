import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DEFAULT_OPTIONS, MAX_WORDS, RULES, resolveOptions, validateLength } from '@cleantext/core';
import Nav from './components/Nav.jsx';
import Hero from './components/Hero.jsx';
import Workbench from './components/Workbench.jsx';
import Rules from './components/Rules.jsx';
import Editorial from './components/Editorial.jsx';
import HowItWorks from './components/HowItWorks.jsx';
import UseCases from './components/UseCases.jsx';
import Developer from './components/Developer.jsx';
import Stats from './components/Stats.jsx';
import FinalCta from './components/FinalCta.jsx';
import Footer from './components/Footer.jsx';
import UpdateToast from './components/UpdateToast.jsx';
import CursorDotTrail from './components/CursorDotTrail.jsx';
import { ScrollArea } from './components/ui/scroll-area.jsx';
import { useCleaner } from './hooks/useCleaner.js';
import { useLocalStorage } from './hooks/useLocalStorage.js';
import { useGlobalStats, useStatsReporter } from './hooks/useStats.js';

/** Opsi tersimpan + `lastUnicodeForm` (hanya UI). Data rusak → default. */
function sanitizeOptions(v) {
  if (!v || typeof v !== 'object') return { ...DEFAULT_OPTIONS, lastUnicodeForm: 'NFC' };
  const { lastUnicodeForm, ...rest } = v;
  const r = resolveOptions(rest);
  return { ...(r.ok ? r.options : DEFAULT_OPTIONS), lastUnicodeForm: lastUnicodeForm === 'NFKC' ? 'NFKC' : 'NFC' };
}

export default function App() {
  const [theme, setTheme] = useLocalStorage('theme', 'kertas', (v) => (v === 'malam' ? 'malam' : 'kertas'));
  const [storedOptions, setOptions] = useLocalStorage('options', { ...DEFAULT_OPTIONS, lastUnicodeForm: 'NFC' }, sanitizeOptions);
  const [live, setLive] = useLocalStorage('live', true, (v) => v !== false);
  const [statsOptIn, setStatsOptIn] = useLocalStorage('statsOptIn', true, (v) => v !== false);
  const [text, setText] = useState('');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'malam' ? '#1D1D1B' : '#F2F0E8');
  }, [theme]);

  // Opsi untuk core (tanpa field khusus UI). Identitas stabil selama nilainya sama.
  const optionsKey = JSON.stringify(storedOptions);
  const coreOptions = useMemo(() => {
    const { lastUnicodeForm, ...o } = storedOptions;
    return o;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optionsKey]);

  const enabledCount = RULES.filter((r) => (r.key === 'normalizeUnicode' ? coreOptions.normalizeUnicode !== false : coreOptions[r.key])).length;

  // G-06 — batas dihitung pada teks mentah.
  const limit = useMemo(() => {
    const v = validateLength(text);
    const status = !v.ok ? 'error' : v.words >= MAX_WORDS * 0.9 ? 'warn' : 'ok';
    return { words: v.words < 0 ? 0 : v.words, chars: v.chars, status, reason: v.ok ? null : v.reason };
  }, [text]);

  const cleaner = useCleaner(text, coreOptions, { live, blocked: limit.status === 'error' });

  // G-14 — laporkan hitungan anonim setelah tiap pembersihan.
  const { record, resetBaseline } = useStatsReporter(statsOptIn);
  const lastRuns = useRef(0);
  useEffect(() => {
    if (cleaner.runs !== lastRuns.current) {
      lastRuns.current = cleaner.runs;
      record(cleaner.changes);
    }
  }, [cleaner.runs, cleaner.changes, record]);

  const handleSetText = useCallback(
    (/** @type {string} */ t) => {
      // Teks diganti total (kosongkan / contoh / potong) → baseline statistik baru.
      if (!t || Math.abs(t.length - text.length) > 200) resetBaseline();
      setText(t);
      if (!t) cleaner.reset();
    },
    [text.length, resetBaseline, cleaner],
  );

  const [statsKey, setStatsKey] = useState(0);
  const globalStats = useGlobalStats(statsKey);
  useEffect(() => {
    const h = setInterval(() => setStatsKey((k) => k + 1), 60_000);
    return () => clearInterval(h);
  }, []);

  useEffect(() => {
    // Intersepsi semua tautan anchor in-page agar tidak memicu reload, navigasi route, atau blank page
    const handleAnchorClick = (e) => {
      const anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      e.preventDefault();
      e.stopPropagation();
      const id = href.slice(1);
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    // Pastikan window tidak tergeser oleh focus browser
    const onWindowScroll = () => {
      if (window.scrollX !== 0 || window.scrollY !== 0) {
        window.scrollTo(0, 0);
      }
    };

    document.addEventListener('click', handleAnchorClick);
    window.addEventListener('scroll', onWindowScroll, { passive: true });
    return () => {
      document.removeEventListener('click', handleAnchorClick);
      window.removeEventListener('scroll', onWindowScroll);
    };
  }, []);

  return (
    <>
      <a
        href="#editor"
        className="skip-link"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          document.getElementById('editor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}
      >
        Lewati ke editor
      </a>
      <ScrollArea className="fullpage-scroll-area">
        <Nav theme={theme} onToggleTheme={() => setTheme((t) => (t === 'kertas' ? 'malam' : 'kertas'))} />
        <main>
          <Hero />
          <Workbench
            text={text}
            setText={handleSetText}
            limit={limit}
            cleaner={cleaner}
            live={live}
            setLive={setLive}
            onManualClean={cleaner.run}
            enabledCount={enabledCount}
          />
          <Rules options={storedOptions} setOptions={setOptions} />
          <Editorial />
          <HowItWorks />
          <UseCases />
          <Developer />
          <Stats data={globalStats} />
          <FinalCta />
        </main>
        <Footer statsOptIn={statsOptIn} setStatsOptIn={setStatsOptIn} />
      </ScrollArea>
      <UpdateToast />
      <CursorDotTrail />
    </>
  );
}
