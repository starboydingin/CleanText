import { describe, expect, it } from 'vitest';
import { Readable } from 'node:stream';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { main } from '../src/cli.js';
import { cleanText } from '@cleantext/core';

function io(input = '') {
  const out = [];
  const err = [];
  const stdin = Readable.from([Buffer.from(input, 'utf8')]);
  return {
    io: { stdin, stdout: { write: (s) => out.push(s) }, stderr: { write: (s) => err.push(s) } },
    out: () => out.join(''),
    err: () => err.join(''),
  };
}

describe('CLI', () => {
  it('stdin → stdout, identik dengan core', async () => {
    const text = '## Judul\n\u201Chalo\u201D\u2014dunia\u2026  ';
    const t = io(text);
    expect(await main([], t.io)).toBe(0);
    expect(t.out()).toBe(cleanText(text).text);
  });

  it('--no-<flag> menonaktifkan aturan', async () => {
    const t = io('**a** \u2014 b');
    await main(['--no-asterisks', '--no-dashes'], t.io);
    expect(t.out()).toBe('**a** \u2014 b');
  });

  it('--none lalu aktifkan satu aturan', async () => {
    const t = io('**a** \u2014 b');
    await main(['--none', '--dashes'], t.io);
    expect(t.out()).toBe('**a** - b');
  });

  it('--unicode nfkc', async () => {
    const t = io('\uFB01');
    await main(['-u', 'nfkc'], t.io);
    expect(t.out()).toBe('fi');
  });

  it('--stats ke stderr', async () => {
    const t = io('a\u200Bb');
    await main(['--stats'], t.io);
    expect(t.out()).toBe('ab');
    expect(t.err()).toContain('karakter tersembunyi dihapus');
  });

  it('--json', async () => {
    const t = io('a\u2026');
    await main(['--json'], t.io);
    const j = JSON.parse(t.out());
    expect(j.text).toBe('a...');
    expect(j.changes.convertEllipsis).toBe(1);
  });

  it('berkas input dan --out', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'cleantext-'));
    const inFile = join(dir, 'in.txt');
    const outFile = join(dir, 'out.txt');
    await writeFile(inFile, 'x\u00A0y', 'utf8');
    const t = io();
    expect(await main([inFile, '--out', outFile], t.io)).toBe(0);
    expect(await readFile(outFile, 'utf8')).toBe('x y');
  });

  it('exit 1 untuk argumen tidak valid', async () => {
    const t = io('a');
    expect(await main(['--tidak-ada'], t.io)).toBe(1);
    expect(await main(['-u', 'abc'], io('a').io)).toBe(1);
    expect(await main(['berkas-tidak-ada.txt'], io().io)).toBe(1);
  });

  it('exit 2 bila melebihi batas', async () => {
    const t = io(Array.from({ length: 10_001 }, () => 'a').join(' '));
    expect(await main([], t.io)).toBe(2);
    expect(t.err()).toContain('TEXT_TOO_LONG');
  });

  it('--help dan --version', async () => {
    const h = io();
    expect(await main(['--help'], h.io)).toBe(0);
    expect(h.out()).toContain('--hidden');
    const v = io();
    await main(['-v'], v.io);
    expect(v.out().trim()).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
