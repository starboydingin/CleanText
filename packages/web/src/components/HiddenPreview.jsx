import { useEffect, useState } from 'react';
import { fmt } from '../config.js';

const MAX_SEGMENTS = 4000;

/**
 * G-12 — pratinjau read-only karakter tersembunyi.
 * Dilengkapi pengecekan data defensif agar tidak pernah memicu crash/blank page.
 */
export default function HiddenPreview({ text, scan }) {
  const [data, setData] = useState(/** @type {null | { segments: any[], count: number, byLabel: Record<string, number> }} */ (null));
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    let alive = true;
    setScanning(true);
    const h = setTimeout(async () => {
      try {
        const r = await scan(text);
        if (alive) {
          setData(r && typeof r === 'object' ? r : { segments: [], count: 0, byLabel: {} });
          setScanning(false);
        }
      } catch (err) {
        console.error('[HiddenPreview] scan error:', err);
        if (alive) {
          setData({ segments: [], count: 0, byLabel: {} });
          setScanning(false);
        }
      }
    }, 150);
    return () => {
      alive = false;
      clearTimeout(h);
    };
  }, [text, scan]);

  if (!data || scanning) return <p className="muted">Memindai…</p>;

  const segments = Array.isArray(data.segments) ? data.segments : [];
  const count = typeof data.count === 'number' ? data.count : 0;
  const byLabel = data.byLabel && typeof data.byLabel === 'object' ? data.byLabel : {};
  const truncated = segments.length > MAX_SEGMENTS;
  const segs = truncated ? segments.slice(0, MAX_SEGMENTS) : segments;

  return (
    <div className="hidden-preview">
      <div className="hidden-preview__head">
        <span>
          <strong>{fmt.format(count)}</strong> karakter tersembunyi/khusus terdeteksi pada input
        </span>
        <span className="hidden-preview__legend">
          {Object.entries(byLabel).map(([label, n]) => (
            <span key={label} className="chip">
              {label} <b>×{fmt.format(n)}</b>
            </span>
          ))}
        </span>
      </div>
      <div className="hidden-preview__body" role="region" aria-label="Pratinjau karakter tersembunyi" tabIndex={0}>
        {count === 0 && !text ? (
          <span className="muted">Tempel teks untuk melihat pratinjau.</span>
        ) : (
          segs.map((s, i) =>
            s?.type === 'text' ? (
              <span key={i}>{s.value}</span>
            ) : (
              <span key={i} className="chip chip--inline" title={s?.code || ''}>
                {s?.label || 'ZWSP'}
              </span>
            ),
          )
        )}
        {truncated && <span className="muted"> … (pratinjau dipotong)</span>}
      </div>
    </div>
  );
}
