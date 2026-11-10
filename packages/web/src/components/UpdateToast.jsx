import { useEffect, useState } from 'react';

/** G-15 — pemberitahuan kecil "Versi baru tersedia" (tanpa reload paksa). */
export default function UpdateToast() {
  const [worker, setWorker] = useState(/** @type {ServiceWorker | null} */ (null));
  useEffect(() => {
    const on = (e) => setWorker(/** @type {CustomEvent} */ (e).detail);
    window.addEventListener('cleantext:update', on);
    return () => window.removeEventListener('cleantext:update', on);
  }, []);
  if (!worker) return null;
  return (
    <div className="toast" role="status">
      <span>Versi baru tersedia.</span>
      <button type="button" className="text-btn" onClick={() => worker.postMessage('SKIP_WAITING')}>
        Muat ulang
      </button>
      <button type="button" className="text-btn muted" onClick={() => setWorker(null)} aria-label="Tutup pemberitahuan">
        Nanti
      </button>
    </div>
  );
}
