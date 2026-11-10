/**
 * Aplikasi Express CleanText (PRD 10.6).
 *
 * Privasi: isi `text` TIDAK PERNAH dicatat pada log. Logger di bawah hanya
 * mencatat metode, path, status, dan durasi.
 */

import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import {
  createCleaner,
  parseCleanRequest,
  validateLength,
  validateStatsPayload,
  MAX_WORDS,
  MAX_CHARS,
  MAX_BODY_BYTES,
  RULES,
  DEFAULT_OPTIONS,
  VERSION,
} from '@cleantext/core';
import { createStatsStore } from './statsStore.js';

/**
 * @param {{
 *   stats?: ReturnType<typeof createStatsStore>,
 *   corsOrigins?: string[] | '*',
 *   rateLimit?: { windowMs: number, clean: number, stats: number } | false,
 *   log?: boolean,
 *   staticDir?: string | null,
 * }} [cfg]
 */
export function createApp(cfg = {}) {
  const stats = cfg.stats ?? createStatsStore();
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  // --- Logger tanpa isi body -------------------------------------------------
  if (cfg.log) {
    app.use((req, res, next) => {
      const t0 = performance.now();
      res.on('finish', () => {
        console.log(`${req.method} ${req.path} ${res.statusCode} ${(performance.now() - t0).toFixed(1)}ms`);
      });
      next();
    });
  }

  // --- Header keamanan ringan ------------------------------------------------
  app.use((_req, res, next) => {
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('Referrer-Policy', 'no-referrer');
    next();
  });

  // --- CORS ketat --------------------------------------------------------------
  const origins = cfg.corsOrigins ?? [];
  app.use(
    '/api',
    cors({
      origin: origins === '*' ? '*' : (origin, cb) => cb(null, !origin || origins.includes(origin)),
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type'],
      maxAge: 600,
    }),
  );

  // --- Rate limit --------------------------------------------------------------
  const rl = cfg.rateLimit === undefined ? { windowMs: 60_000, clean: 60, stats: 20 } : cfg.rateLimit;
  const limiter = (max) =>
    rl
      ? rateLimit({
          windowMs: rl.windowMs,
          limit: max,
          standardHeaders: 'draft-7',
          legacyHeaders: false,
          handler: (_req, res) => res.status(429).json({ error: 'RATE_LIMITED' }),
        })
      : (_req, _res, next) => next();

  // --- Body parser (ukuran dibatasi SEBELUM parsing) -------------------------
  const jsonBody = express.json({ limit: MAX_BODY_BYTES, strict: true, type: ['application/json', 'text/plain'] });
  const smallJson = express.json({ limit: 4096, strict: true, type: ['application/json', 'text/plain'] });

  // --- Routes ------------------------------------------------------------------
  app.get('/api/health', (_req, res) => {
    res.set('Cache-Control', 'no-store').json({ status: 'ok', version: VERSION });
  });

  app.get('/api/rules', (_req, res) => {
    res.set('Cache-Control', 'public, max-age=3600').json({ rules: RULES, defaults: DEFAULT_OPTIONS, limits: { maxWords: MAX_WORDS, maxChars: MAX_CHARS } });
  });

  app.post('/api/clean', limiter(rl ? rl.clean : 0), jsonBody, (req, res) => {
    const parsed = parseCleanRequest(req.body);
    if (!parsed.ok) return res.status(400).json({ error: 'INVALID_REQUEST', message: parsed.error });

    const check = validateLength(parsed.text);
    if (!check.ok) {
      return res.status(413).json({ error: 'TEXT_TOO_LONG', reason: check.reason, maxWords: MAX_WORDS, maxChars: MAX_CHARS });
    }
    const t0 = performance.now();
    const { text, changes } = createCleaner(parsed.options)(parsed.text);
    /** @type {Record<string, number>} */
    const nonZero = {};
    for (const [k, v] of Object.entries(changes)) if (v) nonZero[k] = v;
    res.set('Cache-Control', 'no-store').json({
      text,
      changes: nonZero,
      stats: { words: check.words, chars: text.length, durationMs: +(performance.now() - t0).toFixed(3) },
    });
  });

  app.get('/api/stats', (_req, res) => {
    res.set('Cache-Control', 'public, max-age=60').json(stats.snapshot());
  });

  app.post('/api/stats', limiter(rl ? rl.stats : 0), smallJson, (req, res) => {
    const r = validateStatsPayload(req.body);
    if (!r.ok) return res.status(400).json({ error: 'INVALID_REQUEST', message: r.error });
    stats.add(r.counts);
    res.status(204).end();
  });

  app.use('/api', (_req, res) => res.status(404).json({ error: 'NOT_FOUND' }));

  // --- Static (build web) opsional ---------------------------------------------
  if (cfg.staticDir) {
    app.use(
      express.static(cfg.staticDir, {
        index: 'index.html',
        setHeaders: (res, path) => {
          if (path.endsWith('sw.js') || path.endsWith('index.html')) res.set('Cache-Control', 'no-cache');
          else if (/[\\/]assets[\\/]/.test(path)) res.set('Cache-Control', 'public, max-age=31536000, immutable');
        },
      }),
    );

    // Fallback SPA agar route peramban selalu mengembalikan index.html dan tidak blank 404
    app.get('*', (_req, res) => {
      res.sendFile('index.html', { root: cfg.staticDir });
    });
  }

  // --- Error handler -----------------------------------------------------------
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err?.type === 'entity.too.large') {
      return res.status(413).json({ error: 'TEXT_TOO_LONG', reason: 'BODY_TOO_LARGE', maxWords: MAX_WORDS, maxChars: MAX_CHARS });
    }
    if (err?.type === 'entity.parse.failed' || err instanceof SyntaxError) {
      return res.status(400).json({ error: 'INVALID_REQUEST', message: 'body bukan JSON valid' });
    }
    console.error('[api] galat tak terduga:', err?.message);
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  });

  return app;
}
