import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createApp } from './app.js';
import { createStatsStore } from './statsStore.js';

const here = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 8787;
const HOST = process.env.HOST || '127.0.0.1';
const STATS_FILE = process.env.STATS_FILE || resolve(here, '../data/stats.json');
const WEB_DIST = process.env.WEB_DIST || resolve(here, '../../web/dist');
const corsEnv = process.env.CORS_ORIGINS;
const corsOrigins = corsEnv === '*' ? '*' : (corsEnv || 'http://localhost:5173,http://127.0.0.1:5173').split(',').map((s) => s.trim());

const stats = createStatsStore({ file: STATS_FILE });
await stats.load();

const app = createApp({
  stats,
  corsOrigins,
  log: process.env.NODE_ENV !== 'test',
  staticDir: existsSync(WEB_DIST) ? WEB_DIST : null,
});

function startServer(port, maxTries = 5) {
  const server = app.listen(port, HOST, () => {
    console.log(`\n======================================================`);
    console.log(`  CleanText Server Berjalan!`);
    console.log(`  Akses website di: http://${HOST}:${port}`);
    if (existsSync(WEB_DIST)) {
      console.log(`  Melayani antarmuka web produksi dari packages/web/dist`);
    }
    console.log(`======================================================\n`);
  });

  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      if (!process.env.PORT && maxTries > 0) {
        console.warn(`[CleanText API] Port ${port} sedang dipakai. Mencoba otomatis port ${port + 1}...`);
        startServer(port + 1, maxTries - 1);
        return;
      }
      console.error(`\n[CleanText API] Port ${port} sedang dipakai oleh proses lain.`);
      console.error(`Solusi:`);
      console.error(`  1. Matikan proses yang memakai port ${port}:`);
      console.error(`     Stop-Process -Id (Get-NetTCPConnection -LocalPort ${port}).OwningProcess -Force`);
      console.error(`  2. Atau jalankan di port lain:`);
      console.error(`     $env:PORT=8789; npm start\n`);
      process.exit(1);
    } else {
      console.error('[CleanText API] Galat server:', err);
      process.exit(1);
    }
  });

  const shutdown = async () => {
    server.close();
    await stats.close();
    process.exit(0);
  };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}

startServer(PORT);
