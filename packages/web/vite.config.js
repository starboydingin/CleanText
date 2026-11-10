import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

/**
 * Plugin kecil untuk G-15: membangkitkan `sw.js` dengan daftar precache
 * (semua berkas hasil build: app shell, Web Worker, font) saat build.
 */
function serviceWorkerPlugin() {
  const template = fileURLToPath(new URL('./src/sw-template.js', import.meta.url));
  return {
    name: 'cleantext-sw',
    apply: 'build',
    generateBundle(_opts, bundle) {
      const files = Object.keys(bundle).filter((f) => !f.endsWith('.map'));
      const urls = ['/', ...files.map((f) => '/' + f)];
      const version = createHash('sha256').update(urls.join('|')).digest('hex').slice(0, 10);
      const source = readFileSync(template, 'utf8')
        .replace('__PRECACHE__', JSON.stringify(urls))
        .replace('__VERSION__', JSON.stringify(version));
      this.emitFile({ type: 'asset', fileName: 'sw.js', source });
    },
  };
}

export default defineConfig({
  plugins: [react(), serviceWorkerPlugin()],
  worker: { format: 'es' },
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://127.0.0.1:8787', changeOrigin: true },
    },
  },
  preview: {
    port: 4173,
    proxy: {
      '/api': { target: 'http://127.0.0.1:8787', changeOrigin: true },
    },
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    assetsInlineLimit: 0,
  },
});
