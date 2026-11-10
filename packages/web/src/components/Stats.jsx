import { RULES } from '@cleantext/core';
import { fmt } from '../config.js';

/**
 * Section 09 — statistik pembersihan global (G-14).
 * Bila gagal dimuat, bagian disembunyikan (bukan menampilkan galat).
 */
export default function Stats({ data }) {
  if (!data) return null;
  const rows = RULES.map((r) => ({ ...r, n: data.counts[r.key] || 0 })).sort((a, b) => b.n - a.n);
  const max = Math.max(1, ...rows.map((r) => r.n));
  const updated = data.updatedAt && data.updatedAt !== new Date(0).toISOString() ? new Date(data.updatedAt) : null;

  return (
    <section className="section stats" id="statistik" aria-labelledby="stats-title">
      <div className="wrap">
        <header className="section__head section__head--split">
          <div>
            <span className="label section__num">09 — Statistik pembersihan global</span>
            <h2 id="stats-title" className="sr-only">
              Statistik pembersihan global
            </h2>
            <p className="stats__total" aria-label={`${fmt.format(data.total)} artefak dibersihkan`}>
              {fmt.format(data.total)}
            </p>
            <p className="stats__caption">
              artefak dibersihkan <em className="serif accent">oleh semua pengguna.</em>
            </p>
          </div>
          <p className="muted stats__aside">
            Hanya hitungan angka anonim per jenis aturan — tanpa teks, tanpa IP, tanpa pengenal. Anda dapat mematikan pengiriman di
            footer.
            {updated && (
              <>
                <br />
                <span className="label">Diperbarui {updated.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</span>
              </>
            )}
          </p>
        </header>

        <ol className="stats__list">
          {rows.map((r) => (
            <li key={r.key} className="stats__row">
              <span className="label stats__id">{r.id}</span>
              <span className="stats__name">{r.label}</span>
              <span className="stats__bar" aria-hidden="true">
                <span style={{ width: `${(r.n / max) * 100}%` }} />
              </span>
              <span className="stats__n">{fmt.format(r.n)}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
