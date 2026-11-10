/**
 * Penyimpanan agregat counter anonim (G-14).
 *
 * Hanya menyimpan bilangan bulat per aturan — tanpa teks, IP, atau pengenal.
 * Penambahan bersifat atomik dalam satu proses Node (event loop tunggal);
 * persistensi ke file JSON ditulis secara atomik (tulis ke .tmp lalu rename)
 * dengan debounce. Untuk multi-instance, ganti dengan basis data yang
 * mendukung increment atomik (mis. Redis INCRBY, SQLite UPDATE ... SET n = n + ?).
 */

import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { RULE_KEYS } from '@cleantext/core';

/**
 * @param {{ file?: string | null, flushMs?: number }} [cfg]
 */
export function createStatsStore({ file = null, flushMs = 2000 } = {}) {
  /** @type {Record<string, number>} */
  const counts = Object.fromEntries(RULE_KEYS.map((k) => [k, 0]));
  let total = 0;
  let updatedAt = new Date(0).toISOString();
  /** @type {NodeJS.Timeout | null} */
  let timer = null;
  let writing = Promise.resolve();

  async function load() {
    if (!file) return;
    try {
      const raw = JSON.parse(await readFile(file, 'utf8'));
      for (const k of RULE_KEYS) {
        const v = raw?.counts?.[k];
        if (Number.isSafeInteger(v) && v >= 0) counts[k] = v;
      }
      total = RULE_KEYS.reduce((s, k) => s + counts[k], 0);
      if (typeof raw?.updatedAt === 'string') updatedAt = raw.updatedAt;
    } catch {
      /* file belum ada — mulai dari nol */
    }
  }

  async function flush() {
    if (!file) return;
    timer = null;
    const data = JSON.stringify({ counts, total, updatedAt }, null, 2);
    writing = writing.then(async () => {
      await mkdir(dirname(file), { recursive: true });
      const tmp = `${file}.tmp`;
      await writeFile(tmp, data, 'utf8');
      await rename(tmp, file);
    }).catch((err) => console.error('[stats] gagal menyimpan:', err.message));
    return writing;
  }

  /** @param {Record<string, number>} delta sudah tervalidasi */
  function add(delta) {
    for (const [k, v] of Object.entries(delta)) {
      counts[k] += v;
      total += v;
    }
    updatedAt = new Date().toISOString();
    if (file && !timer) timer = setTimeout(flush, flushMs);
  }

  function snapshot() {
    return { total, counts: { ...counts }, updatedAt };
  }

  async function close() {
    if (timer) {
      clearTimeout(timer);
      await flush();
    }
    await writing;
  }

  return { load, add, snapshot, flush, close };
}
