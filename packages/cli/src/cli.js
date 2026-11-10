/**
 * G-13 — CLI CleanText.
 * Exit code: 0 sukses, 1 argumen/IO tidak valid, 2 melebihi batas.
 */

import { parseArgs } from 'node:util';
import { readFile, writeFile } from 'node:fs/promises';
import {
  createCleaner,
  validateLength,
  parseUnicodeForm,
  DEFAULT_OPTIONS,
  RULES,
  MAX_WORDS,
  MAX_CHARS,
  VERSION,
} from '@cleantext/core';

const HELP = `CleanText ${VERSION} — Clean. Normalize. Simplify.

Penggunaan:
  cleantext [berkas] [opsi]
  cat teks.txt | cleantext [opsi] > bersih.txt

Input dari berkas atau stdin; output ke stdout atau --out.

Opsi umum:
  -o, --out <berkas>      Tulis hasil ke berkas
  -u, --unicode <bentuk>  nfc | nfkc | off           (default: nfc)
  -s, --stats             Ringkasan perubahan ke stderr
      --json              Keluarkan JSON { text, changes, stats } ke stdout
      --all               Aktifkan semua aturan (termasuk karakter mirip)
      --none              Nonaktifkan semua aturan, lalu aktifkan per flag
  -h, --help              Bantuan
  -v, --version           Versi

Aturan (pakai --no-<flag> untuk menonaktifkan):
${RULES.filter((r) => r.key !== 'normalizeUnicode')
  .map((r) => `  --${r.flag.padEnd(22)}${r.id}  ${r.label}${DEFAULT_OPTIONS[r.key] ? '' : '  (default: mati)'}`)
  .join('\n')}

Sub-opsi:
  --no-keep-emoji-zwj     Hapus juga ZWJ pada emoji gabungan
  --lookalikes-all        Konversi semua karakter mirip (bukan hanya kata campuran-skrip)
  --no-bullets            Hapus "* " pada daftar alih-alih mengubahnya menjadi "- "

Batas: ${MAX_WORDS.toLocaleString('id-ID')} kata, ${MAX_CHARS.toLocaleString('id-ID')} karakter.
`;

/** @param {NodeJS.ReadableStream} stream */
async function readStream(stream) {
  const chunks = [];
  for await (const c of stream) chunks.push(typeof c === 'string' ? Buffer.from(c) : c);
  return Buffer.concat(chunks).toString('utf8');
}

/**
 * @param {string[]} argv
 * @param {{ stdin?: NodeJS.ReadableStream & { isTTY?: boolean }, stdout?: { write(s: string): any }, stderr?: { write(s: string): any } }} [io]
 * @returns {Promise<number>}
 */
export async function main(argv, io = {}) {
  const stdin = io.stdin ?? process.stdin;
  const stdout = io.stdout ?? process.stdout;
  const stderr = io.stderr ?? process.stderr;

  /** @type {Record<string, any>} */
  const ruleFlags = {};
  for (const r of RULES) if (r.key !== 'normalizeUnicode') ruleFlags[r.flag] = { type: 'boolean' };
  const negatable = new Set([...Object.keys(ruleFlags), 'keep-emoji-zwj', 'bullets']);

  // `--no-<flag>` ditangani manual agar portabel ke Node < 22.4.
  /** @type {Record<string, boolean>} */
  const negated = {};
  const args = [];
  for (const a of argv) {
    if (a.startsWith('--no-') && negatable.has(a.slice(5))) negated[a.slice(5)] = true;
    else args.push(a);
  }

  let parsed;
  try {
    parsed = parseArgs({
      args,
      allowPositionals: true,
      strict: true,
      options: {
        out: { type: 'string', short: 'o' },
        unicode: { type: 'string', short: 'u' },
        stats: { type: 'boolean', short: 's' },
        json: { type: 'boolean' },
        all: { type: 'boolean' },
        none: { type: 'boolean' },
        help: { type: 'boolean', short: 'h' },
        version: { type: 'boolean', short: 'v' },
        'keep-emoji-zwj': { type: 'boolean' },
        'lookalikes-all': { type: 'boolean' },
        bullets: { type: 'boolean' },
        ...ruleFlags,
      },
    });
  } catch (err) {
    stderr.write(`cleantext: ${/** @type {Error} */ (err).message}\nCoba "cleantext --help".\n`);
    return 1;
  }
  const { positionals } = parsed;
  /** @type {Record<string, any>} */
  const values = { ...parsed.values };
  for (const k of Object.keys(negated)) values[k] = false;

  if (values.help) {
    stdout.write(HELP);
    return 0;
  }
  if (values.version) {
    stdout.write(`${VERSION}\n`);
    return 0;
  }
  if (positionals.length > 1) {
    stderr.write('cleantext: hanya satu berkas input yang didukung.\n');
    return 1;
  }

  /** @type {any} */
  const opts = { ...DEFAULT_OPTIONS };
  if (values.none) {
    for (const r of RULES) opts[r.key] = false;
  }
  if (values.all) {
    for (const r of RULES) if (r.key !== 'normalizeUnicode') opts[r.key] = true;
    if (!opts.normalizeUnicode) opts.normalizeUnicode = 'NFC';
  }
  for (const r of RULES) {
    if (r.key === 'normalizeUnicode') continue;
    if (values[r.flag] !== undefined) opts[r.key] = values[r.flag];
  }
  if (values.unicode !== undefined) {
    const f = parseUnicodeForm(values.unicode);
    if (f === undefined) {
      stderr.write(`cleantext: nilai --unicode tidak valid: "${values.unicode}" (pakai nfc | nfkc | off)\n`);
      return 1;
    }
    opts.normalizeUnicode = f;
  }
  if (values['keep-emoji-zwj'] !== undefined) opts.preserveEmojiZwj = values['keep-emoji-zwj'];
  if (values['lookalikes-all']) opts.lookalikeMode = 'all';
  if (values.bullets !== undefined) opts.convertBullets = values.bullets;

  // --- Input ---------------------------------------------------------------
  let input;
  try {
    if (positionals[0] && positionals[0] !== '-') input = await readFile(positionals[0], 'utf8');
    else if (stdin.isTTY) {
      stderr.write('cleantext: tidak ada input. Berikan berkas atau salurkan teks lewat stdin.\nCoba "cleantext --help".\n');
      return 1;
    } else input = await readStream(stdin);
  } catch (err) {
    stderr.write(`cleantext: gagal membaca input: ${/** @type {Error} */ (err).message}\n`);
    return 1;
  }

  // --- Batas ---------------------------------------------------------------
  const check = validateLength(input);
  if (!check.ok) {
    const msg =
      check.reason === 'TOO_MANY_CHARS'
        ? `terlalu banyak karakter (${input.length.toLocaleString('id-ID')} > ${MAX_CHARS.toLocaleString('id-ID')})`
        : `terlalu banyak kata (${check.words.toLocaleString('id-ID')} > ${MAX_WORDS.toLocaleString('id-ID')})`;
    stderr.write(`cleantext: TEXT_TOO_LONG — ${msg}\n`);
    return 2;
  }

  // --- Bersihkan -----------------------------------------------------------
  const result = createCleaner(opts)(input);
  const output = values.json
    ? JSON.stringify({ text: result.text, changes: result.changes, stats: { words: check.words, chars: result.text.length, durationMs: +result.durationMs.toFixed(3) } }) + '\n'
    : result.text;

  try {
    if (values.out) await writeFile(values.out, output, 'utf8');
    else stdout.write(output);
  } catch (err) {
    stderr.write(`cleantext: gagal menulis output: ${/** @type {Error} */ (err).message}\n`);
    return 1;
  }

  if (values.stats) {
    const lines = RULES.filter((r) => result.changes[r.key]).map(
      (r) => `  ${String(result.changes[r.key]).padStart(7)}  ${r.unit}`,
    );
    stderr.write(
      `CleanText — ${result.totalChanges.toLocaleString('id-ID')} perubahan, ${check.words.toLocaleString('id-ID')} kata, ${result.durationMs.toFixed(2)} ms\n` +
        (lines.length ? lines.join('\n') + '\n' : '  (tidak ada perubahan)\n'),
    );
  }
  return 0;
}
