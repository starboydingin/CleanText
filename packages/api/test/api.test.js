import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { createStatsStore } from '../src/statsStore.js';
import { MAX_CHARS } from '@cleantext/core';

const make = () => createApp({ stats: createStatsStore(), rateLimit: false, corsOrigins: ['http://localhost:5173'] });

describe('GET /api/health', () => {
  it('200 ok', async () => {
    const r = await request(make()).get('/api/health');
    expect(r.status).toBe(200);
    expect(r.body.status).toBe('ok');
  });
});

describe('POST /api/clean', () => {
  it('membersihkan dengan opsi default', async () => {
    const r = await request(make())
      .post('/api/clean')
      .send({ text: '\u201Chalo\u201D\u200B dunia\u2026' });
    expect(r.status).toBe(200);
    expect(r.body.text).toBe('"halo" dunia...');
    expect(r.body.changes).toEqual({ normalizeQuotes: 2, removeHiddenChars: 1, convertEllipsis: 1 });
    expect(r.body.stats.words).toBe(2);
  });

  it('menghormati opsi', async () => {
    const r = await request(make())
      .post('/api/clean')
      .send({ text: '**a** \u2014 b', options: { removeAsterisks: false } });
    expect(r.body.text).toBe('**a** - b');
  });

  it('400 untuk JSON rusak', async () => {
    const r = await request(make()).post('/api/clean').set('Content-Type', 'application/json').send('{bad');
    expect(r.status).toBe(400);
    expect(r.body.error).toBe('INVALID_REQUEST');
  });

  it('400 untuk tipe salah', async () => {
    const r = await request(make()).post('/api/clean').send({ text: 5 });
    expect(r.status).toBe(400);
    const r2 = await request(make()).post('/api/clean').send({ text: 'a', options: { normalizeDashes: 'yes' } });
    expect(r2.status).toBe(400);
  });

  it('413 TOO_MANY_WORDS', async () => {
    const text = Array.from({ length: 10_001 }, () => 'a').join(' ');
    const r = await request(make()).post('/api/clean').send({ text });
    expect(r.status).toBe(413);
    expect(r.body).toMatchObject({ error: 'TEXT_TOO_LONG', reason: 'TOO_MANY_WORDS', maxWords: 10000, maxChars: MAX_CHARS });
  });

  it('413 TOO_MANY_CHARS', async () => {
    const r = await request(make()).post('/api/clean').send({ text: 'x'.repeat(MAX_CHARS + 1) });
    expect(r.status).toBe(413);
    expect(r.body.reason).toBe('TOO_MANY_CHARS');
  });

  it('413 bila body > 1 MB', async () => {
    const r = await request(make()).post('/api/clean').send({ text: '\u00e9'.repeat(600_000) });
    expect(r.status).toBe(413);
  });
});

describe('/api/stats', () => {
  it('menambah agregat dan menghitung total di server', async () => {
    const app = make();
    const p = await request(app).post('/api/stats').send({ v: 1, counts: { normalizeDashes: 4, normalizeQuotes: 6 } });
    expect(p.status).toBe(204);
    const g = await request(app).get('/api/stats');
    expect(g.status).toBe(200);
    expect(g.body.total).toBe(10);
    expect(g.body.counts.normalizeDashes).toBe(4);
    expect(g.headers['cache-control']).toContain('max-age=60');
  });

  it('menolak nilai raksasa dan kunci asing', async () => {
    const app = make();
    expect((await request(app).post('/api/stats').send({ v: 1, counts: { normalizeDashes: 2e15 } })).status).toBe(400);
    expect((await request(app).post('/api/stats').send({ v: 1, counts: { hack: 1 } })).status).toBe(400);
    expect((await request(app).get('/api/stats')).body.total).toBe(0);
  });

  it('menerima text/plain (sendBeacon)', async () => {
    const r = await request(make()).post('/api/stats').set('Content-Type', 'text/plain').send(JSON.stringify({ v: 1, counts: { convertNbsp: 1 } }));
    expect(r.status).toBe(204);
  });
});

describe('CORS', () => {
  it('mengizinkan origin terdaftar saja', async () => {
    const ok = await request(make()).get('/api/health').set('Origin', 'http://localhost:5173');
    expect(ok.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    const bad = await request(make()).get('/api/health').set('Origin', 'http://evil.test');
    expect(bad.headers['access-control-allow-origin']).toBeUndefined();
  });
});
