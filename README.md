# CleanText — Clean. Normalize. Simplify.

Alat pembersih dan normalisasi teks yang cepat, deterministik, dan mengutamakan privasi. Menghapus karakter tersembunyi, spasi khusus, dash/kutipan tipografis, dan sisa format Markdown dalam satu kali tempel.

Dibangun dengan arsitektur monorepo (npm workspaces) menggunakan **ReactJS** (frontend editorial Swiss) dan **ExpressJS** (backend API ringan & pelayan berkas statis), serta **CLI** mandiri berbasis satu paket inti fungsi murni (`@cleantext/core`).

---

## Fitur Utama

- **10 Aturan Pembersihan Independen (F-01 s.d. F-10)**
  1. `F-01` — Hapus karakter tersembunyi (zero-width space, BOM, soft hyphen, bidi, C0/C1) dengan perlindungan ZWJ pada emoji gabungan.
  2. `F-02` — Konversi non-breaking space (NBSP, U+00A0) dan spasi khusus ke spasi biasa.
  3. `F-03` — Normalisasi dash (en-dash, em-dash, minus) menjadi `-`.
  4. `F-04` — Normalisasi kutipan tipografis lengkung (`“ ” ‘ ’ « »`) menjadi kutipan lurus ASCII (`" '`).
  5. `F-05` — Konversi ellipsis tunggal (`…`) menjadi tiga titik (`...`).
  6. `F-06` — Hapus trailing whitespace di setiap akhir baris (mempertahankan baris kosong dan CRLF).
  7. `F-07` — Hapus tanda bintang sisa format Markdown (`**teks**`, `*teks*`) dengan opsi konversi bullet `* ` ke `- `.
  8. `F-08` — Hapus penanda judul Markdown (`#` di awal baris; hashtag `#tag` dan blok kode berpagar tetap aman).
  9. `F-09` — Konversi homoglyph (huruf Kiril/Yunani yang menyamar sebagai huruf Latin pada kata campuran-skrip; default: nonaktif).
  10. `F-10` — Normalisasi Unicode (`NFC` default konservatif atau `NFKC` agresif).

- **100% Berjalan Lokal di Peramban (Privasi Total)**
  Teks tidak pernah diunggah, dicatat, atau disimpan ke server. Pembersihan dijalankan lewat **Web Worker** di latar belakang sehingga antarmuka tetap mulus tanpa jank.
- **Batas Aman 10.000 Kata** (`MAX_WORDS = 10.000`, `MAX_CHARS = 200.000`), divalidasi secara real-time dengan penghitung kata dan tombol potong otomatis.
- **Visualisasi Karakter Tersembunyi (G-12)**: Menampilkan chip label terbaca (`[ZWSP]`, `[NBSP]`, `[BOM]`, `[SHY]`, `[U+XXXX]`) pada teks input.
- **Statistik Global Anonim (G-14)**: Hanya agregat angka per jenis aturan yang dikirim secara berkala; tanpa teks, tanpa IP, tanpa cookie; dilengkapi toggle opt-out di footer.
- **Bekerja Offline (G-15)**: Dilengkapi Service Worker yang menyimpan app shell, Web Worker, dan font lokal sehingga halaman tetap berfungsi tanpa internet setelah kunjungan pertama.
- **Desain Editorial Swiss**: Menggabungkan tipografi berkarakter (Inter Variable + Cormorant Garamond italic serif aksen), palet hangat Ivory (`#F2F0E8`), Deep Charcoal (`#1D1D1B`), Vermilion (`#F0442D`), dan latar Peach (`#F5E8DD`) untuk bagian developer, serta mendukung dua tema (Kertas / Malam).
- **Ekosistem 3 Pintu**: Logika inti yang sama dipakai oleh antarmuka Web, Express REST API, dan Command-Line Interface (CLI).

---

## Struktur Proyek (Monorepo)

```text
CleanText-Project/
├── packages/
│   ├── core/                  # Fungsi murni (O(n), deterministik, zero runtime dependency)
│   │   ├── src/
│   │   │   ├── rules/         # charMap, homoglyphs, lineRules, unicodeNormalize
│   │   │   ├── createCleaner.js
│   │   │   ├── limits.js
│   │   │   ├── options.js
│   │   │   ├── visualizeHidden.js
│   │   │   └── stats.js
│   │   ├── test/              # 74 unit test + 3.000 property-based runs (fast-check)
│   │   └── bench/             # Benchmark Vitest 10.000 kata
│   ├── api/                   # Backend Express: /api/clean, /api/health, /api/stats
│   │   ├── src/
│   │   │   ├── app.js
│   │   │   ├── server.js
│   │   │   └── statsStore.js
│   │   └── test/              # 12 endpoint test (supertest)
│   ├── cli/                   # CLI mandiri Node.js (bin: cleantext)
│   │   ├── bin/cleantext.js
│   │   ├── src/cli.js
│   │   └── test/              # 10 integration test
│   └── web/                   # Frontend React 19 + Vite 6
│       ├── src/
│       │   ├── components/    # Nav, Hero, Workbench, Rules, Editorial, HowItWorks,
│       │   │                  # UseCases, Developer, Stats, FinalCta, Footer, HiddenPreview
│       │   ├── hooks/         # useCleaner (Web Worker), useLocalStorage, useStats
│       │   ├── workers/       # clean.worker.js
│       │   ├── styles/        # global.css (Swiss Editorial Design system)
│       │   └── sw-template.js # Template Service Worker (auto precache saat build)
│       ├── public/
│       └── dist/              # Hasil build statis
├── package.json               # Workspaces root
├── vitest.config.js
└── prd.md                     # Dokumen PRD v1.2
```

---

## Kebutuhan Sistem

- **Node.js**: `v18.17` atau lebih baru (direkomendasikan Node 20 / 22)
- **npm**: `v9` atau lebih baru

---

## Panduan Menjalankan

### 1. Instalasi Dependensi

Dari root folder proyek:

```bash
npm install
```

### 2. Mode Pengembangan (Development)

Menjalankan backend Express (port 8787) dan dev server Vite React (port 5173) secara bersamaan:

```bash
npm run dev
```

Buka peramban di: **`http://localhost:5173`** (Vite secara otomatis memproksi panggilan `/api/*` ke backend Express di `http://127.0.0.1:8787`).

Jika ingin menjalankan salah satu secara terpisah:
- Hanya backend: `npm run dev:api`
- Hanya frontend: `npm run dev:web`

### 3. Build Produksi & Menjalankan Satu Server Terpadu

Build frontend React:

```bash
npm run build
```

Jalankan Express server:

```bash
npm start
```

Express akan melayani aplikasi frontend dari `packages/web/dist` sekaligus API HTTP di port **8787**:
- Antarmuka web: `http://localhost:8787/`
- Endpoint API: `http://localhost:8787/api/clean`
- Health check: `http://localhost:8787/api/health`

---

## Pengujian & Benchmark

### Menjalankan Seluruh Unit Test (96 Tests)

Pengujian mencakup unit test per aturan, idempotensi via property-based testing (3.000 iterasi acak), batas kata/karakter, endpoint Express, dan integrasi CLI:

```bash
npm test
```

Hasil:
```text
✓ packages/cli/test/cli.test.js   (10 tests)
✓ packages/core/test/core.test.js  (74 tests)
✓ packages/api/test/api.test.js   (12 tests)
Total: 96 passed
```

### Menjalankan Benchmark Kecepatan (10.000 Kata)

```bash
npm run bench
```

Hasil pengukuran pada dataset korpus 10.000 kata dengan derau artefak:
- **Default rules**: ~`6.6 ms` (jauh melampaui target PRD: median < 20 ms, p95 < 50 ms)
- **Semua aktif + NFKC**: ~`8.3 ms`
- **ASCII fast-path**: ~`1.8 ms`

---

## Kontrak API Express

### `POST /api/clean`
Membersihkan teks dengan opsi konfigurasi.

**Request:**
```bash
curl -X POST http://localhost:8787/api/clean \
  -H "Content-Type: application/json" \
  -d '{
    "text": "## Ringkasan\u00A0\n**Penting**\u200B: \u201Cdata\u201D 2020\u20132024\u2026",
    "options": {
      "removeHiddenChars": true,
      "normalizeQuotes": true,
      "normalizeDashes": true,
      "normalizeUnicode": "NFC"
    }
  }'
```

**Response (200 OK):**
```json
{
  "text": "Ringkasan\nPenting: \"data\" 2020-2024...",
  "changes": {
    "removeHiddenChars": 1,
    "convertNbsp": 1,
    "normalizeDashes": 1,
    "normalizeQuotes": 2,
    "convertEllipsis": 1,
    "removeAsterisks": 4,
    "removeMarkdownHeadings": 1
  },
  "stats": {
    "words": 5,
    "chars": 37,
    "durationMs": 0.42
  }
}
```

**Kode Status HTTP:**
- `200` — Berhasil dibersihkan.
- `400` — Request body bukan JSON valid atau tipe opsi salah.
- `413` — Teks melebihi batas (`TOO_MANY_WORDS`, `TOO_MANY_CHARS`, atau `BODY_TOO_LARGE`).
- `429` — Rate limit terlampaui.

### `GET /api/health`
Mengembalikan status layanan: `{ "status": "ok", "version": "1.2.0" }`.

### `GET /api/stats` & `POST /api/stats`
Mengambil dan menambah agregat counter anonim per aturan (total dihitung oleh server, divalidasi anti-tampering).

---

## Penggunaan CLI

CLI CleanText dapat digunakan secara langsung dari terminal tanpa dependensi eksternal:

```bash
# Bantuan dan opsi lengkap
node packages/cli/bin/cleantext.js --help

# Lewat pipeline stdin → stdout
cat draft.md | node packages/cli/bin/cleantext.js --stats > clean.md

# Dari berkas ke berkas lain dengan Unicode NFKC dan tanpa menghapus tanda bintang
node packages/cli/bin/cleantext.js input.txt -o output.txt -u nfkc --no-asterisks

# Format JSON ke stdout
node packages/cli/bin/cleantext.js input.txt --json
```

**Exit code:**
- `0` — Berhasil
- `1` — Argumen atau kesalahan berkas/IO
- `2` — Teks melebihi batas kuota

---

## Lisensi

MIT License. Dibuat sesuai spesifikasi PRD v1.2 CleanText.
