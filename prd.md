# PRD — CleanText

> **Clean. Normalize. Simplify.**

| Item | Detail |
|---|---|
| Nama aplikasi | `CleanText` |
| Nama repository | `cleantext` |
| Versi dokumen | 1.2 (Draft) |
| Tanggal | 18 Oktober 2026 |
| Status | Draft untuk review |
| Dokumen terkait | `DESIGN.md` (arah visual "Cetak Poster") |

### Perubahan dari v1.1

| Area | v1.1 | v1.2 |
|---|---|---|
| Proposisi nilai | Tersirat | **Bagian 1.1–1.5**: manfaat, pembeda, cara kerja, target pengguna, statistik penggunaan |
| Dash (F-03) | Open question | **Diputuskan:** semua dash → `-` tanpa spasi |
| `MAX_CHARS` | Asumsi | **Diputuskan:** `200_000` (`text.length`); body limit API ~1 MB |
| Fitur "Could" | Semua di M4 | **G-12 (visualisasi karakter tersembunyi) dan G-13 (CLI) masuk build**; G-11 (diff) tetap M4 |
| Default F-09 (homoglyph) | Aktif | **Nonaktif** (aman untuk teks multibahasa); sisanya aktif |
| Fitur baru | – | **G-14** statistik penggunaan global (anonim), **G-15** offline setelah dimuat, **G-16** tautan repo/issue |
| Backend | Stateless total | Stateless **terhadap teks**; hanya menyimpan agregat counter anonim (G-14) |
| Gaya visual | Neo-brutalist (dari gambar opsi) | **"Cetak Poster"** (lihat `DESIGN.md`); 10 opsi tampil sebagai "kartu remi" |

---

## 1. Ringkasan

**CleanText** adalah alat pembersih dan normalisasi teks yang dapat dikonfigurasi. Aplikasi ini secara otomatis menghapus karakter yang tidak diinginkan, artefak pemformatan, dan pola teks yang tidak konsisten.

**Makna tagline:**
- **Clean** — membersihkan karakter tersembunyi dan artefak format.
- **Normalize** — menyeragamkan variasi karakter (dash, kutipan, spasi, Unicode).
- **Simplify** — menyederhanakan teks menjadi bentuk polos yang konsisten dan siap dipakai.

Pengguna menempelkan teks (maksimal **10.000 kata**), memilih opsi pada panel **Opsi Pembersihan** (10 opsi), lalu memperoleh teks bersih beserta ringkasan perubahan. Pemrosesan web berjalan **lokal di peramban**; backend ringan disediakan terpisah untuk **API/otomatisasi**.

### 1.1 Mengapa CleanText?

Teks yang disalin dari keluaran AI (mis. ChatGPT, Claude, Gemini), dokumen, web, atau chat sering membawa artefak yang **tidak terlihat** atau **mudah terlewat**, lalu menimbulkan masalah setelah ditempel ke tempat lain:

| Artefak | Masalah nyata setelah ditempel |
|---|---|
| Spasi lebar nol, penyambung kata, soft hyphen | Pencarian dan regex gagal tanpa pesan galat |
| Non-breaking space | Tampak normal, tetapi mengubah pemenggalan baris dan hasil `split` |
| Em dash dan kutipan "pintar" | Merusak potongan kode, JSON, CSV; inkonsisten dengan gaya tulis sendiri |
| Sisa Markdown (`*`, `#`) | Tampil mentah di CMS/dokumen yang tidak merender Markdown |
| Spasi di akhir baris | Diff Git berisik, lint gagal |

> **Catatan keyakinan:** pernyataan bahwa artefak ini *umum* pada keluaran AI berasal dari pengamatan umum dan halaman referensi, bukan dari data proyek ini. G-14 (statistik penggunaan) akan memberi data nyata setelah rilis.

CleanText mencabut artefak tersebut dalam satu kali tempel, sehingga teks yang Anda kirim terlihat seperti yang Anda tulis.

### 1.2 Pembeda

| # | Pembeda | Penjelasan | Fitur |
|---|---|---|---|
| 1 | **Privasi: berjalan di peramban** | Transformasi terjadi di perangkat pengguna. Teks tidak diunggah, dicatat, atau disimpan. Setelah dimuat pertama kali, halaman tetap berfungsi offline. | NFR Privasi, G-15 |
| 2 | **Tanpa akun, tanpa paywall** | Tidak ada pendaftaran, email gate, atau tingkat berbayar. Satu-satunya batas adalah **10.000 kata per pembersihan** (demi performa), disampaikan terbuka di UI. | 6.3 |
| 3 | **Setiap aturan adalah toggle** | 10 aturan independen; pengguna mengatur ketat/longgar per pekerjaan. Pengaturan tersimpan lokal dan diingat pada kunjungan berikutnya. | G-02, G-09 |
| 4 | **Transparan** | Ringkasan perubahan per aturan dan pratinjau karakter tersembunyi menunjukkan *apa yang berubah* sebelum menyalin. Tampilan diff berdampingan dijadwalkan pada M4. | G-05, G-12, (G-11) |
| 5 | **Default aman** | Default disetel untuk tempel keluaran AI yang umum. Aturan yang berisiko merusak teks multibahasa (F-09) nonaktif secara default. | F-09 |
| 6 | **Dibangun terbuka** | Repository dan issue tracker terbuka; laporan bug dan permintaan fitur dapat dikirim. Logika inti dipakai ulang oleh UI, API, dan CLI. | G-13, G-16 |

### 1.3 Cara Kerja

1. **Tempel** teks (maks. 10.000 kata). Penghitung kata menampilkan sisa kuota.
2. **Pilih aturan.** Setiap transformasi adalah sakelar independen; jalankan semuanya atau hanya yang dibutuhkan.
3. **Salin atau unduh** hasilnya, lalu periksa ringkasan perubahan.

### 1.4 Untuk Siapa

| Pengguna | Manfaat |
|---|---|
| **Developer** | Membersihkan potongan kode dan teks dari asisten AI sebelum masuk proyek; memakai API/CLI di pipeline |
| **Penulis & editor** | Teks bebas pemformatan tersembunyi sebelum masuk dokumen atau CMS |
| **Pembuat konten** | Menghindari masalah format saat memindahkan teks antar platform |
| **Mahasiswa & peneliti** | Naskah dan kutipan yang konsisten (tanda baca, dash, kutipan) |
| **Pengguna alat AI** | Teks yang lebih bersih dan andal dari LLM mana pun |

### 1.4a Dampak Bila Tidak Dibersihkan

Langkah pembersihan adalah beda antara teks yang tampil benar dan teks yang diam-diam merusak sesuatu di hilir (CMS, editor kode, dokumen, basis data).

### 1.5 Penggunaan Nyata, Dihitung (G-14)

Halaman menampilkan **statistik pembersihan global**: jumlah per jenis artefak yang dihapus/dinormalisasi oleh seluruh pengguna. Data hanya berupa **hitungan angka anonim** (tanpa teks, tanpa IP, tanpa pengenal). Selain sebagai bukti sosial, statistik ini menjadi **ukuran empiris** seberapa lazim tiap artefak. Rincian privasi, validasi, dan opt-out ada di Bagian 6.6.

---

## 2. Latar Belakang & Masalah

Teks yang disalin dari berbagai sumber (dokumen Word, web, PDF, hasil keluaran AI/LLM, chat) sering membawa "kotoran" tak kasat mata maupun kasat mata:

| Masalah | Dampak |
|---|---|
| Karakter tersembunyi (zero-width, soft hyphen, BOM) | Pencarian/pencocokan string gagal, diff palsu, bug parsing |
| Non-breaking space | Pemisahan kata (`split`) dan regex tidak bekerja sesuai harapan |
| Dash, kutipan, ellipsis "typografis" | Inkonsistensi gaya, error pada kode/CSV/JSON/shell |
| Trailing whitespace | Diff Git berisik, gagal lint |
| Sisa sintaks Markdown (`*`, `#`) | Teks polos tampak berantakan saat ditempel ke editor non-Markdown |
| Karakter mirip (homoglyph) | Perbandingan string/URL/identifier menipu, celah spoofing |
| Bentuk Unicode berbeda untuk karakter yang sama | Dua string yang tampak identik dianggap tidak sama |

Alat yang ada umumnya satu fungsi atau berbasis server (teks diunggah, sering disertai gerbang email), serta tidak transparan terhadap perubahan yang dilakukan. CleanText menggabungkan semuanya dalam satu alur yang lokal, dapat dikonfigurasi, cepat, dan dapat diaudit.

---

## 3. Tujuan & Non-Tujuan

### 3.1 Tujuan
1. Menyediakan **10 aturan pembersihan** yang masing-masing dapat diaktifkan/dinonaktifkan.
2. Hasil **deterministik dan idempoten**: menjalankan CleanText dua kali pada teks yang sama menghasilkan output yang sama.
3. **Cepat**: pemrosesan 10.000 kata terasa instan (hasil muncul saat mengetik/menempel).
4. **Transparan**: pengguna dapat melihat apa yang diubah (ringkasan per aturan, pratinjau karakter tersembunyi).
5. **Privasi**: UI web memproses teks secara lokal; API stateless terhadap teks dan tidak menyimpan/mencatat isinya.
6. **Ringan**: dependensi minimal pada inti, bundle kecil, backend sekecil mungkin.
7. **Berkarakter**: identitas visual yang menyenangkan dan khas (lihat `DESIGN.md`) tanpa mengorbankan keterbacaan area kerja.

### 3.2 Non-Tujuan (di luar lingkup v1.x)
- Koreksi ejaan/tata bahasa atau penulisan ulang berbasis AI.
- Konversi Markdown ke format lain (HTML, DOCX).
- Pembersihan file biner (PDF/DOCX langsung); input hanya berupa teks.
- Akun pengguna, riwayat teks, atau penyimpanan **isi teks** di server. *(Pengecualian: agregat counter anonim G-14.)*
- Pemrosesan teks di atas 10.000 kata per permintaan.
- Tampilan diff berdampingan pada v1.0 (dijadwalkan M4).

---

## 4. Target Pengguna & User Stories

### 4.1 Persona
Lihat Bagian 1.4. Persona utama: **developer**, **penulis/editor**, **mahasiswa/peneliti**, dan **pengguna alat AI**.

### 4.2 User Stories
- Sebagai pengguna, saya ingin menempelkan teks dan langsung melihat hasil bersihnya agar tidak perlu membersihkan manual.
- Sebagai pengguna, saya ingin memilih aturan mana yang aktif dan agar pilihan itu diingat pada kunjungan berikutnya.
- Sebagai pengguna, saya ingin melihat berapa banyak perubahan per aturan agar saya yakin tidak ada yang terhapus tanpa sepengetahuan saya.
- Sebagai pengguna, saya ingin *melihat* karakter tersembunyi pada teks saya agar tahu apa yang dihapus.
- Sebagai pengguna, saya ingin tahu batas 10.000 kata dan sisa kuota saat mengetik/menempel.
- Sebagai pengguna yang peduli privasi, saya ingin yakin teks saya tidak dikirim ke mana pun, dan dapat mematikan pengiriman hitungan anonim.
- Sebagai pengguna, saya ingin tetap bisa memakai halaman saat offline setelah dimuat sekali.
- Sebagai developer, saya ingin memanggil endpoint HTTP atau CLI yang memakai inti yang sama agar bisa diotomatisasi.

---

## 5. Ruang Lingkup Fitur

Fitur mengikuti panel **Opsi Pembersihan** pada referensi desain.

| ID | Opsi (label UI) | Default | Ringkasan |
|---|---|---|---|
| F-01 | Hapus karakter tersembunyi | Aktif | Hapus karakter tak terlihat (zero-width, BOM, soft hyphen, kontrol arah) |
| F-02 | Konversi ruang yang tidak pecah | Aktif | Ubah non-breaking space dan spasi khusus menjadi spasi biasa |
| F-03 | Normalisasikan dash | Aktif | Seragamkan semua dash menjadi `-` |
| F-04 | Normalisasikan kutipan | Aktif | Ubah kutipan lengkung/miring menjadi kutipan lurus |
| F-05 | Convert ellipsis | Aktif | Ubah `…` menjadi `...` |
| F-06 | Hapus trailing whitespace | Aktif | Hapus spasi/tab di akhir setiap baris |
| F-07 | Hapus tanda bintang (*) | Aktif | Hapus tanda bintang sisa format Markdown |
| F-08 | Hapus judul Markdown | Aktif | Hapus penanda heading `#` di awal baris |
| F-09 | Konversi karakter yang mirip | **Nonaktif** | Petakan homoglyph ke karakter Latin padanannya |
| F-10 | Normalisasikan bentuk Unicode | Aktif | Terapkan normalisasi Unicode (NFC default; NFKC opsional) |

> **Catatan terjemahan:** label pada gambar referensi "Hapus judul penurunan harga" tampaknya hasil terjemahan otomatis yang keliru dari *"Remove markdown headings"*. PRD ini menafsirkannya sebagai **Hapus judul Markdown**; label UI sebaiknya diperbaiki.
>
> **Catatan default F-09:** gambar referensi pertama menampilkan seluruh kotak tercentang. Halaman referensi kedua menonaktifkan F-09 secara default karena merusak teks multibahasa yang sah. v1.2 mengikuti pendekatan itu. Pengguna cukup mencentangnya bila perlu.

---

## 6. Requirement Fungsional

### 6.1 Spesifikasi per Aturan

#### F-01 — Hapus karakter tersembunyi
- **Deskripsi:** Menghapus karakter yang tidak tampak namun memengaruhi pemrosesan teks.
- **Cakupan code point (default):**
  - `U+200B` Zero Width Space
  - `U+200C` Zero Width Non-Joiner
  - `U+200D` Zero Width Joiner
  - `U+2060` Word Joiner
  - `U+FEFF` BOM / Zero Width No-Break Space
  - `U+00AD` Soft Hyphen
  - `U+200E`, `U+200F` penanda arah (LRM/RLM)
  - `U+202A`–`U+202E`, `U+2066`–`U+2069` kontrol arah bidi
  - Karakter kontrol C0/C1 selain `\n`, `\r`, `\t`
- **Edge case:** `U+200C`/`U+200D` bermakna pada skrip tertentu dan urutan emoji (ZWJ sequence). Sediakan sub-opsi *"Pertahankan ZWJ pada emoji"*.
- **Acceptance:** `"a\u200Bb"` → `"ab"`; newline dan tab tidak ikut terhapus.

#### F-02 — Konversi ruang yang tidak pecah
- **Deskripsi:** Mengubah spasi khusus menjadi spasi biasa `U+0020`.
- **Cakupan:** `U+00A0` (NBSP), `U+202F`, `U+2007`, `U+2002`–`U+200A`, `U+205F`, `U+3000`.
- **Acceptance:** `"a\u00A0b"` → `"a b"`. Tidak menggabungkan spasi berurutan.

#### F-03 — Normalisasikan dash
- **Deskripsi:** Menyeragamkan berbagai tanda hubung/garis menjadi satu karakter.
- **Cakupan:** `U+2010`, `U+2011`, `U+2012`, `U+2013` (en dash), `U+2014` (em dash), `U+2015`, `U+2212` (minus).
- **Keputusan (final):** semua → hyphen-minus `-` (`U+002D`), **tanpa spasi tambahan**.
- **Acceptance:** `"2020–2024"` → `"2020-2024"`; `"ya—tidak"` → `"ya-tidak"`.
- **Alasan:** pemetaan satu-ke-satu menjaga idempotensi dan tidak merusak rentang angka; `--` berisiko pada konteks kode/CLI.

#### F-04 — Normalisasikan kutipan
- **Deskripsi:** Mengubah tanda kutip tipografis menjadi kutip lurus ASCII.
- **Pemetaan:**
  - `“ ” „ « »` → `"`
  - `‘ ’ ‚ ‹ ›` → `'`
- **Edge case:** apostrof (`’` pada "don’t") menjadi `'`.
- **Acceptance:** `“halo”` → `"halo"`; `don’t` → `don't`.

#### F-05 — Convert ellipsis
- **Deskripsi:** Mengubah karakter ellipsis tunggal `…` (`U+2026`) menjadi tiga titik `...`.
- **Acceptance:** `"tunggu…"` → `"tunggu..."`.

#### F-06 — Hapus trailing whitespace
- **Deskripsi:** Menghapus spasi/tab di akhir **setiap baris**, mempertahankan pemisah baris asli (`\n` atau `\r\n`).
- **Regex acuan:** `[ \t]+(?=\r?\n|$)`.
- **Catatan:** Berjalan setelah F-02 agar NBSP di akhir baris ikut terhapus.
- **Acceptance:** `"abc   \ndef\t"` → `"abc\ndef"`.

#### F-07 — Hapus tanda bintang (*)
- **Deskripsi:** Menghapus tanda `*` sisa format tebal/miring Markdown (`**teks**`, `*teks*`).
- **Perilaku default:** hapus seluruh `*`, sisakan teks di dalamnya.
- **Acceptance:** `"**penting** dan *miring*"` → `"penting dan miring"`.
- **Risiko:** ekspresi matematika (`2*3`) dan catatan kaki terdampak. Mode lanjutan *"Lindungi tanda bintang dalam ekspresi/kode"* dijadwalkan pada M4.

#### F-08 — Hapus judul Markdown
- **Deskripsi:** Menghapus penanda heading di awal baris, mempertahankan teks judul.
- **Pola:** `^\s{0,3}#{1,6}\s+` (per baris).
- **Edge case:** hashtag (`#kampus` tanpa spasi) dan baris `#` di dalam blok kode berpagar (```` ``` ````) **tidak** disentuh.
- **Acceptance:** `"## Pendahuluan"` → `"Pendahuluan"`; `"#tag"` tetap `"#tag"`.

#### F-09 — Konversi karakter yang mirip (default: nonaktif)
- **Deskripsi:** Memetakan karakter homoglyph (tampak identik dengan huruf Latin) ke padanan Latin/ASCII.
- **Contoh pemetaan:** Cyrillic `а` (`U+0430`) → `a`, `е` (`U+0435`) → `e`, `о` (`U+043E`) → `o`; Greek `ο` (`U+03BF`) → `o`.
- **Sumber data:** subset tabel *confusables* dari Unicode Technical Standard #39, dibatasi pada pasangan yang berpadanan dengan huruf/angka Latin dan **dihasilkan saat build** menjadi konstanta TypeScript.
- **Pendekatan aman:** saat diaktifkan, hanya mengonversi karakter pada kata **campuran skrip** (mis. Latin + Cyrillic dalam satu kata). Sub-opsi *"Konversi semua"* untuk pengguna lanjutan.
- **Mengapa default nonaktif:** konversi ini merusak teks multibahasa yang sah (Rusia, Yunani).
- **Acceptance:** `"pаypal"` (dengan `а` Cyrillic) → `"paypal"` saat F-09 aktif.
- **Catatan:** NFKC (F-10) tidak mengonversi huruf mirip lintas skrip; itu tugas F-09.

#### F-10 — Normalisasikan bentuk Unicode
- **Deskripsi:** Menerapkan normalisasi Unicode agar karakter setara memiliki representasi biner yang sama.
- **Pilihan bentuk:** **NFC** (default, konservatif) dan **NFKC** (lebih agresif; meruntuhkan varian fullwidth, ligatur, dan karakter format seperti `ﬁ` atau `Ｈｅｌｌｏ`).
- **Implementasi:** `String.prototype.normalize` bawaan (tanpa dependensi).
- **Acceptance:** `"e\u0301"` → `"é"` (`U+00E9`) pada NFC; `"ﬁ"` → `"fi"` hanya pada NFKC.
- **Catatan:** halaman referensi memakai NFKC. Pilihan default NFC vs NFKC masih terbuka (Bagian 14).

### 6.2 Fungsi Umum
| ID | Requirement | Prioritas |
|---|---|---|
| G-01 | Area input teks (tempel/ketik) dan area output hasil | Must |
| G-02 | Panel **Opsi Pembersihan** berisi 10 checkbox; default sesuai Bagian 5 | Must |
| G-03 | Pembersihan otomatis saat input/opsi berubah (*live*, debounce) + tombol **Bersihkan** manual | Must |
| G-04 | Tombol **Salin hasil** dan **Unduh .txt** | Must |
| G-05 | Ringkasan perubahan per aturan (mis. "12 karakter tersembunyi dihapus") | Must |
| G-06 | **Penghitung kata** real-time (`n / 10.000`) dan validasi batas (6.3) | Must |
| G-07 | **Endpoint API** `POST /api/clean` memakai inti yang sama (9.6) | Must |
| G-08 | Pilih semua / hapus semua / reset ke default | Should |
| G-09 | Simpan preferensi opsi di penyimpanan lokal peramban | Should |
| G-10 | Pemrosesan di Web Worker agar UI tidak tersendat | Should |
| G-11 | Tampilan *diff* sebelum–sesudah (dimuat lazy) | Could (M4) |
| G-12 | **Visualisasi karakter tersembunyi** (6.5) | Should |
| G-13 | **CLI** memakai paket `core` (6.5) | Should |
| G-14 | **Statistik pembersihan global (anonim)** (6.6) | Should |
| G-15 | **Offline setelah dimuat** (6.7) | Should |
| G-16 | Tautan repository dan issue tracker di footer | Should |

### 6.3 Batas Input (maksimal 10.000 kata)

- **Definisi kata:** token berurutan non-whitespace (pendekatan `\S+`). Dihitung dengan satu loop `charCodeAt` tanpa membuat array (O(n) waktu, O(1) memori).
- **Batas utama:** `MAX_WORDS = 10_000`.
- **Batas pengaman (diputuskan):** `MAX_CHARS = 200_000`, dihitung sebagai `text.length` (UTF-16 code unit; satu emoji di luar BMP terhitung 2). Mencegah satu "kata" raksasa lolos dari batas kata. Teks 10.000 kata umumnya sekitar 60–80 ribu karakter (perkiraan; belum diukur pada korpus proyek).
- **Perilaku UI:**
  - Penghitung `7.421 / 10.000 kata`; berubah menjadi peringatan saat ≥ 90% dan error saat melebihi batas. Status **tidak hanya mengandalkan warna** (ada label teks).
  - Saat melebihi batas: live dan tombol Bersihkan **dinonaktifkan**, pesan galat jelas ditampilkan, **teks tidak dipotong otomatis**. Pesan membedakan "terlalu banyak kata" dan "terlalu banyak karakter".
  - Tombol eksplisit *"Potong ke 10.000 kata"* (opsional).
- **Perilaku API:** kelebihan batas → HTTP `413` dengan `error: "TEXT_TOO_LONG"`, `reason: "TOO_MANY_WORDS" | "TOO_MANY_CHARS"`, serta `maxWords` dan `maxChars`. **Body limit API ≈ 1 MB** (UTF-8 multi-byte + overhead JSON), dicek sebelum parsing.
- **Perilaku CLI:** batas sama; exit code `2` bila melebihi.
- **Catatan:** `U+200B` bukan whitespace pada `\s` JavaScript, sehingga dua kata yang dipisahkan ZWSP saja terhitung satu kata. Batas dihitung pada teks **mentah**.

### 6.4 Urutan Eksekusi (Pipeline) — 3 Tahap

Urutan menentukan hasil karena beberapa aturan saling tumpang tindih (mis. NFKC sudah mengubah NBSP dan `…`).

| Tahap | Aturan | Teknik |
|---|---|---|
| **0. Validasi & fast path** | Hitung kata/karakter; deteksi apakah teks murni ASCII | Satu loop; jika ASCII murni, tahap Unicode/homoglyph dan sebagian peta karakter **dilewati** |
| **1. Unicode** | F-10 | `normalize()` bawaan, hanya jika ada karakter non-ASCII |
| **2. Single-pass peta karakter** | F-01, F-02, F-03, F-04, F-05 | Satu `replace` dengan kelas karakter + `Map`; hitung perubahan per aturan di callback yang sama |
| **3. Homoglyph (kondisional)** | F-09 | Hanya jika F-09 aktif dan masih ada karakter non-Latin; pemindaian kata campuran-skrip |
| **4. Per baris (satu loop)** | F-08, F-07, F-06 | Satu iterasi baris dengan pelacakan blok kode berpagar; heading → bintang → trailing whitespace |

Setiap aturan berupa fungsi murni dan dapat diuji terpisah.

### 6.5 Fitur Tambahan Terpilih (G-12 dan G-13)

#### G-12 — Visualisasi karakter tersembunyi
- Fungsi murni `visualizeHidden(text)` di `core` yang mengganti karakter tersembunyi/khusus dengan **label terbaca**: `[ZWSP]`, `[ZWNJ]`, `[ZWJ]`, `[WJ]`, `[BOM]`, `[SHY]`, `[LRM]`, `[RLM]`, `[NBSP]`, dan `[U+XXXX]` untuk kontrol/bidi lain. Cakupan mengikuti F-01 dan F-02. O(n).
- UI: toggle **"Tampilkan karakter tersembunyi"** yang membuka panel pratinjau *read-only* (textarea tidak dapat menampilkan label inline). **Default mati**; pratinjau hanya dihitung saat toggle aktif.
- Label tampil sebagai "chip" berkontras tinggi; tidak hanya mengandalkan warna.
- Menampilkan jumlah karakter tersembunyi yang terdeteksi pada input.

#### G-13 — CLI
- Paket `packages/cli`, **tanpa dependensi runtime** (`parseArgs` bawaan `node:util`), memakai `@cleantext/core`.
- Input dari file atau stdin; output ke stdout atau `--out <file>`.
- Flag per opsi pembersihan, `--unicode nfc|nfkc`, `--stats` (ringkasan ke stderr), `--help`, `--version`.
- Batas sama dengan UI/API. Exit code: `0` sukses, `1` argumen/IO tidak valid, `2` melebihi batas.

### 6.6 Statistik Pembersihan Global — G-14

**Tujuan:** menampilkan penggunaan nyata dan memberi data empiris tentang prevalensi artefak, **tanpa** mengorbankan privasi.

**Apa yang dikirim (hanya ini):**
```json
{ "v": 1, "counts": { "removeHiddenChars": 3, "convertNbsp": 12, "normalizeDashes": 4,
  "normalizeQuotes": 20, "convertEllipsis": 1, "trimTrailingWhitespace": 8,
  "removeAsterisks": 6, "removeMarkdownHeadings": 2, "convertLookalikes": 0,
  "normalizeUnicode": 0 } }
```
- Tanpa teks, tanpa IP yang disimpan aplikasi, tanpa cookie, tanpa ID pengguna.
- Dikirim **berkelompok**: debounce ~5 detik setelah pembersihan terakhir, minimal jeda ~30 detik antar pengiriman, dan saat halaman disembunyikan (`sendBeacon`). Jika offline, hitungan **dibuang** (tidak diantrekan).
- Tidak dikirim bila seluruh hitungan nol.

**Validasi di server (anti-penyalahgunaan):**
- Hanya kunci putih (whitelist) yang dikenal; setiap nilai bilangan bulat `0..MAX_CHARS` (200.000); jumlah seluruh nilai ≤ `MAX_CHARS`. Selain itu → `400`.
- **Total dihitung server**, tidak mempercayai total dari klien.
- *Rate limit* di level platform.
- **Alasan ketat:** halaman referensi menampilkan hitungan dash `2.000.000.007.440.752`, jauh di atas total keseluruhan `48.463.785`. Ini tampak seperti satu penambahan sangat besar (≈ 2×10¹⁵) tanpa validasi batas. *(Dugaan, bukan fakta terverifikasi.)*

**Penyimpanan:** hanya agregat integer per aturan. Memerlukan penambahan **atomik**. Di Cloudflare Workers, KV tidak cocok untuk increment atomik (konsistensi akhir); D1 atau Durable Objects lebih sesuai. **Perlu diverifikasi pada dokumentasi** (Bagian 14).

**Tampilan:** bagian "Statistik Pembersihan Global" dengan total dan hitungan per jenis (format angka `id-ID`), diambil lewat `GET /api/stats` dengan cache singkat (~60 detik). Bila gagal dimuat, bagian disembunyikan, bukan menampilkan galat.

**Kontrol pengguna:**
- Toggle **"Kirim hitungan anonim"** di footer; tersimpan lokal; bila mati, **tidak ada request** ke `/api/stats` untuk pengiriman.
- Teks pengungkapan singkat yang menjelaskan persis apa yang dikirim.
- **Rekomendasi default:** aktif dengan opt-out yang jelas. Keputusan akhir pada Bagian 14.

### 6.7 Offline Setelah Dimuat — G-15
- Service worker menyimpan *app shell*, Web Worker, dan berkas font agar halaman berfungsi tanpa jaringan setelah kunjungan pertama.
- Pembersihan lokal tidak bergantung pada jaringan. Fitur yang butuh jaringan (statistik) gagal diam-diam.
- Pembaruan aplikasi: tampilkan pemberitahuan kecil "Versi baru tersedia" (tanpa memuat ulang paksa).

---

## 7. Requirement Non-Fungsional

> Angka performa adalah **target desain**, belum hasil pengukuran. Verifikasi lewat benchmark pada Bagian 11.

| Kategori | Target |
|---|---|
| Kompleksitas | Waktu O(n), memori O(n); tanpa regex berisiko *catastrophic backtracking* |
| Performa inti | 10.000 kata: median < 20 ms, p95 < 50 ms pada laptop umum |
| Performa UI | Input → hasil tampil < 100 ms pada mode live (debounce ~150 ms); tanpa *jank* > 16 ms pada thread utama |
| Performa API `/clean` | Waktu proses server p95 < 15 ms; latensi total bergantung jaringan |
| Ukuran bundle | `core` < 10 KB gzip; JS awal UI < 100 KB gzip (belum termasuk font) |
| Aset visual | Tekstur/motif berbasis CSS/SVG, total < 30 KB; tidak ada gambar raster besar; tidak ada efek tekstur di atas area input/output |
| Privasi | UI memproses teks lokal. Satu-satunya request jaringan dari UI adalah hitungan angka anonim ke `/api/stats` (dapat dimatikan). API `/clean` stateless dan tidak mencatat isi teks |
| Idempotensi | `clean(clean(x)) == clean(x)` untuk semua kombinasi opsi |
| Keandalan | Tidak melempar error untuk input kosong, sangat panjang, atau berisi *surrogate pair* |
| Kompatibilitas | UTF-8 penuh, termasuk emoji dan karakter di luar BMP |
| Keamanan API | Validasi tipe input, batas ukuran body, *rate limit* platform, CORS ketat, whitelist kunci statistik |
| Aksesibilitas | Navigasi keyboard, label checkbox terhubung ke input, kontras WCAG 2.2 AA, `prefers-reduced-motion` dihormati |
| Responsif | 2 kolom di desktop, 1 kolom di layar sempit; opsi terbaca di 360 px |
| Offline | Pembersihan lokal berfungsi tanpa jaringan setelah kunjungan pertama |
| Lokalisasi | Antarmuka berbahasa Indonesia; struktur siap untuk bahasa lain |

---

## 8. (dicadangkan)

Penomoran bagian 1–14 dipertahankan dari v1.1 agar rujukan lintas-dokumen tetap valid.

---

## 9. Desain UI/UX

**Arah visual: "Cetak Poster"** — rinci lengkap di `DESIGN.md`. Ringkasnya:

- Terinspirasi dua poster referensi: **"Malam"** (kuning di atas navy–indigo) dan **"Kertas"** (merah tua di atas krem). Keduanya menjadi **dua tema** (gelap dan terang).
- Gaya: tipografi raksasa yang bertumpuk, pola halftone, tekstur kertas, goresan, motif **bintang** dan **kartu remi**. **Bukan** neo-brutalist (tanpa border tebal dan bayangan keras), **bukan** gaya SaaS modern generik.
- Font: **TAN St. Canard**, **Anton SC**, **Disclaimer** (display); teks bacaan memakai font sistem.
- Prinsip: *poster di luar, kertas bersih di dalam* — area input/output tetap datar dan terbaca jelas.

### 9.1 Panel Opsi Pembersihan: "Kartu Remi"
10 opsi tampil sebagai 10 kartu (As, 2…10) dalam grid 2 kolom. Checkbox berupa **bintang** (terisi = aktif). Urutan (kiri → kanan, atas → bawah) mengikuti gambar referensi awal:

| Kartu | Opsi | ID | Golongan |
|---|---|---|---|
| A | Hapus karakter tersembunyi | F-01 | Bersihkan |
| 2 | Konversi ruang yang tidak pecah | F-02 | Seragamkan |
| 3 | Normalisasikan dash | F-03 | Seragamkan |
| 4 | Normalisasikan kutipan | F-04 | Seragamkan |
| 5 | Convert ellipsis | F-05 | Seragamkan |
| 6 | Hapus trailing whitespace | F-06 | Bersihkan |
| 7 | Hapus tanda bintang (*) | F-07 | Bersihkan |
| 8 | Hapus judul Markdown | F-08 | Bersihkan |
| 9 | Konversi karakter yang mirip | F-09 | Seragamkan |
| 10 | Normalisasikan bentuk Unicode | F-10 | Seragamkan |

Golongan "Bersihkan" dan "Seragamkan" memetakan dua kata pertama tagline.

### 9.2 Struktur Halaman
1. **Masthead** — wordmark raksasa, tagline, penanda "100% di peramban".
2. **Meja kerja** — input + penghitung kata → Opsi Pembersihan → output + ringkasan perubahan + aksi.
3. **Mengapa CleanText** (Bagian 1.2), **Cara kerja** (1.3), **Untuk siapa** (1.4).
4. **Statistik pembersihan global** (G-14).
5. **Footer** — tautan repo/issue (G-16), toggle statistik, pernyataan privasi.

**Alur utama:** Tempel teks → (hasil muncul otomatis) → atur opsi → lihat ringkasan perubahan (dan pratinjau karakter tersembunyi bila perlu) → **Salin** / **Unduh**.

---

## 10. Arsitektur & Tech Stack

> Bagian ini mempertahankan keputusan v1.1 dengan penambahan yang diberi tanda **(baru)**.

### 10.1 Keputusan Teknologi

| Lapisan | Pilihan | Alasan singkat |
|---|---|---|
| Frontend | **React + TypeScript (strict)** + **Vite** | Sesuai kebutuhan; build cepat |
| Styling | Tailwind CSS (build-time) + CSS variables untuk token tema | Tanpa runtime CSS-in-JS; dua tema via variabel |
| State | `useReducer`/`useState` | Tanpa library state tambahan |
| Inti logika | Paket **`core`** TypeScript, tanpa dependensi runtime | Dipakai UI, API, CLI |
| Backend | **Hono** (satu aplikasi kecil) | Lihat 10.2 |
| CLI **(baru)** | `packages/cli` (Node/Bun, `node:util`) | Pembungkus tipis `core` |
| Offline **(baru)** | Service worker (mis. plugin PWA untuk Vite) | G-15 |
| Pengujian | Vitest, Testing Library, fast-check, `vitest bench` | Satu toolchain dengan Vite |

### 10.2 Pemilihan Backend: Hono
Pemrosesan teks tidak membutuhkan database, sesi, atau autentikasi. Backend membungkus `cleanText` menjadi API HTTP. **Pengecualian (baru):** G-14 membutuhkan penyimpanan agregat counter (binding platform, bukan database umum).

| Opsi | Penilaian | Dipilih |
|---|---|---|
| Tanpa backend | Tercepat untuk UI, tetapi tanpa API dan tanpa statistik global | Tetap jalur utama UI |
| **Hono** | Sangat kecil, TypeScript-native, berbasis Web Standard API, portabel (Workers/Bun/Node/Deno) | ✔ **Ya** |
| Fastify / Express / NestJS | Lebih berat, terikat Node, atau berlebihan untuk kebutuhan ini | Tidak |

**Tingkat keyakinan:** sedang–tinggi; penilaian kualitatif, belum diukur pada proyek ini. Klaim ukuran/kecepatan Hono perlu diverifikasi pada dokumentasi terbaru.

### 10.3 Diagram Alur
```text
 MODE LOKAL (default UI)                    MODE API (otomatisasi)

 ┌──────────────┐  postMessage  ┌────────┐  ┌──────────┐  HTTP POST   ┌─────────────┐
 │ React UI (TS)│ ────────────► │ Worker │  │ CLI / CI │ ───────────► │ Hono        │
 │ textarea +   │ ◄──────────── │ core   │  │ App lain │ ◄─────────── │ /api/clean  │
 │ opsi         │   hasil       └────────┘  └──────────┘   JSON       │ core        │
 └──────┬───────┘                                                     └─────────────┘
        │ hanya angka anonim (opsional, dapat dimatikan)
        ▼
 POST /api/stats ──► penyimpanan agregat counter
```

### 10.4 Struktur Repository (Monorepo)
```text
cleantext/
├── packages/
│   ├── core/                  # fungsi murni, tanpa dependensi runtime
│   │   ├── src/
│   │   │   ├── rules/ (charMap, homoglyphs, unicodeNormalize, lineRules)
│   │   │   ├── limits.ts              # MAX_WORDS, MAX_CHARS, countWords
│   │   │   ├── visualizeHidden.ts     # G-12 (baru)
│   │   │   ├── createCleaner.ts
│   │   │   └── types.ts
│   │   ├── scripts/generate-confusables.ts
│   │   └── bench/
│   ├── web/                   # React + TypeScript + Vite
│   │   ├── public/fonts/      # font berlisensi: JANGAN di-commit bila repo publik (lihat 14)
│   │   └── src/ (components, hooks, workers/clean.worker.ts, sw)
│   ├── api/                   # Hono: /api/clean, /api/health, /api/stats
│   └── cli/                   # G-13 (baru)
├── PRODUCT.md, DESIGN.md      # konteks desain (Impeccable)
├── prd.md
└── README.md
```

### 10.5 Strategi Optimasi Kecepatan
1. **Pra-kompilasi pipeline** — `createCleaner(options)` membangun `Map`, kelas karakter, dan regex sekali per perubahan opsi.
2. **Single-pass untuk aturan karakter** — F-01…F-05 dalam satu `replace`.
3. **Fast path ASCII** — lewati tahap Unicode/homoglyph.
4. **Pemrosesan kondisional** — homoglyph hanya bila F-09 aktif dan ada karakter non-Latin; tahap baris dilewati bila aturannya nonaktif.
5. **Satu loop untuk aturan per baris** — F-08, F-07, F-06.
6. **Tanpa regex berisiko backtracking.**
7. **Penghitungan perubahan inline.**
8. **Web Worker**; komunikasi via `postMessage`.
9. **Debounce live mode** (~150 ms) dan pembatalan hasil usang.
10. **Lazy load** komponen berat (pratinjau karakter tersembunyi, diff bila ada).
11. **Benchmark di CI** — regresi > 20% menggagalkan build.
12. **Efek visual murah (baru)** — halftone dengan `radial-gradient`, tekstur sebagai ubin SVG kecil, tanpa filter besar di atas area kerja.

### 10.6 Kontrak API

**`POST /api/clean`** — `Content-Type: application/json`
```json
{ "text": "teks yang akan dibersihkan",
  "options": { "removeHiddenChars": true, "convertNbsp": true, "normalizeDashes": true,
    "normalizeQuotes": true, "convertEllipsis": true, "trimTrailingWhitespace": true,
    "removeAsterisks": true, "removeMarkdownHeadings": true, "convertLookalikes": false,
    "normalizeUnicode": "NFC" } }
```
Respons `200`:
```json
{ "text": "teks bersih",
  "changes": { "removeHiddenChars": 3, "normalizeQuotes": 2 },
  "stats": { "words": 4, "chars": 24, "durationMs": 0.4 } }
```

| Status | Kode | Kondisi |
|---|---|---|
| 400 | `INVALID_REQUEST` | Body bukan JSON valid / tipe field salah |
| 413 | `TEXT_TOO_LONG` | Melebihi batas; `reason` = `TOO_MANY_WORDS` atau `TOO_MANY_CHARS`; juga `maxWords` dan `maxChars`; atau body melebihi ~1 MB |
| 429 | `RATE_LIMITED` | Melebihi batas laju (platform) |

**`GET /api/health`** → `200 { "status": "ok" }`.

**`POST /api/stats` (baru)** — menerima hitungan anonim (6.6). `204` sukses; `400` bila validasi gagal; `429` bila melebihi laju.

**`GET /api/stats` (baru)** — `200 { "total": n, "counts": { ... }, "updatedAt": "ISO-8601" }`, `Cache-Control` singkat.

### 10.7 Sketsa Kode

**Batas input** (`core/src/limits.ts`) — O(n) waktu, O(1) memori:
```ts
export const MAX_WORDS = 10_000;
export const MAX_CHARS = 200_000; // text.length (UTF-16 code unit)

/** Hitung kata (token non-whitespace) tanpa membuat array perantara. */
export function countWords(text: string): number {
  let words = 0;
  let inWord = false;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    const isSpace =
      c === 0x20 || (c >= 0x09 && c <= 0x0d) || c === 0xa0 || c === 0x1680 ||
      (c >= 0x2000 && c <= 0x200a) || c === 0x2028 || c === 0x2029 ||
      c === 0x202f || c === 0x205f || c === 0x3000 || c === 0xfeff;
    if (isSpace) inWord = false;
    else if (!inWord) { inWord = true; words++; }
  }
  return words;
}

export type LengthCheck =
  | { ok: true; words: number }
  | { ok: false; reason: 'TOO_MANY_WORDS' | 'TOO_MANY_CHARS'; words: number };

export function validateLength(text: string): LengthCheck {
  if (text.length > MAX_CHARS) return { ok: false, reason: 'TOO_MANY_CHARS', words: -1 };
  const words = countWords(text);
  return words > MAX_WORDS
    ? { ok: false, reason: 'TOO_MANY_WORDS', words }
    : { ok: true, words };
}
```

**Pipeline pra-kompilasi** (`core/src/createCleaner.ts`) — sketsa:
```ts
type RuleKey = 'hidden' | 'nbsp' | 'dash' | 'quote' | 'ellipsis';
interface Entry { to: string; rule: RuleKey }

export function createCleaner(opts: CleanOptions) {
  const map = new Map<string, Entry>();                       // dibangun SEKALI per opsi
  if (opts.removeHiddenChars) for (const ch of HIDDEN) map.set(ch, { to: '', rule: 'hidden' });
  if (opts.convertNbsp)       for (const ch of NBSP)   map.set(ch, { to: ' ', rule: 'nbsp' });
  if (opts.normalizeDashes)   for (const ch of DASHES) map.set(ch, { to: '-', rule: 'dash' });
  if (opts.normalizeQuotes)   for (const [ch, to] of QUOTES) map.set(ch, { to, rule: 'quote' });
  if (opts.convertEllipsis)   map.set('\u2026', { to: '...', rule: 'ellipsis' });

  const charRe = map.size ? new RegExp(`[${[...map.keys()].map(toEscape).join('')}]`, 'g') : null;

  return function clean(input: string): CleanResult {
    const counts = newCounts();
    let text = input;
    const asciiOnly = isAscii(text);                                        // tahap 0
    if (!asciiOnly && opts.normalizeUnicode) text = text.normalize(opts.normalizeUnicode);   // 1
    if (charRe && (!asciiOnly || HAS_ASCII_CONTROL.test(text))) {                         // 2
      text = text.replace(charRe, (ch) => { const e = map.get(ch)!; counts[e.rule]++; return e.to; });
    }
    if (opts.convertLookalikes && !asciiOnly) text = convertMixedScriptHomoglyphs(text, counts); // 3
    return { text: applyLineRules(text, opts, counts), changes: counts };                 // 4
  };
}
```

**Endpoint Hono** (`api/src/index.ts`) — sketsa:
```ts
import { Hono } from 'hono';
import { createCleaner, validateLength, isCleanRequest, MAX_WORDS, MAX_CHARS } from '@cleantext/core';

const app = new Hono();
app.get('/api/health', (c) => c.json({ status: 'ok' }));

app.post('/api/clean', async (c) => {
  // Ukuran body dibatasi SEBELUM parsing (body-limit Hono; verifikasi di dokumentasi)
  const body: unknown = await c.req.json().catch(() => null);
  if (!isCleanRequest(body)) return c.json({ error: 'INVALID_REQUEST' }, 400);

  const check = validateLength(body.text);
  if (!check.ok) {
    return c.json({ error: 'TEXT_TOO_LONG', reason: check.reason,
                    maxWords: MAX_WORDS, maxChars: MAX_CHARS }, 413);
  }
  const t0 = performance.now();
  const { text, changes } = createCleaner(body.options)(body.text);
  return c.json({ text, changes,
    stats: { words: check.words, chars: text.length, durationMs: performance.now() - t0 } });
  // Isi `body.text` tidak boleh dicatat pada log.
});

export default app;
```

**Kontrak tipe bersama:**
```ts
export interface CleanOptions {
  removeHiddenChars: boolean;
  convertNbsp: boolean;
  normalizeDashes: boolean;
  normalizeQuotes: boolean;
  convertEllipsis: boolean;
  trimTrailingWhitespace: boolean;
  removeAsterisks: boolean;
  removeMarkdownHeadings: boolean;
  convertLookalikes: boolean;           // default: false
  normalizeUnicode: false | 'NFC' | 'NFKC';
}

export const DEFAULT_OPTIONS: CleanOptions = {
  removeHiddenChars: true, convertNbsp: true, normalizeDashes: true, normalizeQuotes: true,
  convertEllipsis: true, trimTrailingWhitespace: true, removeAsterisks: true,
  removeMarkdownHeadings: true, convertLookalikes: false, normalizeUnicode: 'NFC',
};

export interface CleanResult {
  text: string;
  changes: Partial<Record<keyof CleanOptions, number>>;
}
```

---

## 11. Pengujian & Kriteria Penerimaan

1. **Unit test per aturan** dengan minimal 5 kasus: normal, kosong, tanpa perubahan, edge case, dan campuran.
2. **Idempotensi:** `clean(clean(x)) === clean(x)` dengan *property-based testing* (fast-check) pada kombinasi opsi.
3. **Ekuivalensi pipeline:** hasil *single-pass* identik dengan implementasi referensi sederhana (aturan berurutan satu per satu).
4. **Independensi opsi:** menonaktifkan sebuah aturan tidak mengubah hasil aturan lain secara tak terduga.
5. **Batas input:** 9.999, 10.000, dan 10.001 kata; satu "kata" sangat panjang (`MAX_CHARS`); UI, API, dan CLI konsisten, termasuk `reason` pada 413.
6. **Teks Indonesia** dan **multibahasa/emoji** (ZWJ emoji, surrogate pair, aksara non-Latin) tidak rusak, termasuk saat F-09 nonaktif.
7. **`visualizeHidden`:** setiap code point pada F-01/F-02 menghasilkan label yang benar; teks tanpa karakter khusus tidak berubah.
8. **CLI:** stdin→stdout, file, tiap flag, melebihi batas (exit code 2), hasil identik dengan `core`.
9. **Statistik:** validasi server menolak kunci asing, nilai negatif/non-integer, nilai > `MAX_CHARS`, dan jumlah > `MAX_CHARS`; UI tidak mengirim apa pun saat opt-out; payload hanya berisi angka.
10. **Privasi:** UI tidak mengirim teks lewat jaringan (satu-satunya request keluar adalah `/api/stats` berisi angka); API tidak mencatat isi teks pada log.
11. **Offline:** setelah kunjungan pertama, pembersihan berjalan dengan jaringan dimatikan.
12. **Aksesibilitas & visual:** audit kontras (WCAG 2.2 AA) pada kedua tema; navigasi keyboard penuh; `prefers-reduced-motion`; review menurut checklist di `DESIGN.md`.
13. **Benchmark:** dataset 10.000 kata (teks Indonesia + derau). Catat median dan p95; regresi > 20% menggagalkan CI.
14. **Definition of Done v1.2:** F-01 s.d. F-10 dan G-01 s.d. G-07, G-12, G-13 lulus; G-14/G-15/G-16 lulus atau selisihnya terdokumentasi; target performa terpenuhi atau selisihnya terdokumentasi.

---

## 12. Metrik Keberhasilan

| Metrik | Target awal |
|---|---|
| Cakupan unit test `core` | ≥ 90% |
| Waktu proses 10.000 kata (inti) | p95 < 50 ms |
| Input → hasil tampil (UI, mode live) | < 100 ms |
| Ukuran `core` / JS awal UI | < 10 KB / < 100 KB gzip |
| Kegagalan idempotensi | 0 |
| Isu "teks rusak akibat pembersihan" | 0 isu kritis pada rilis v1.0 |
| Anomali pada counter statistik (nilai tidak masuk akal) | 0 |
| Kontras teks terhadap latar (kedua tema) | ≥ 4,5:1 (teks biasa), ≥ 3:1 (teks besar/komponen) |

---

## 13. Rencana Rilis (Milestone)

| Fase | Cakupan |
|---|---|
| **M1 — Core** | 10 aturan, `createCleaner` single-pass, `limits.ts`, `visualizeHidden`, unit/property test, benchmark awal |
| **M2 — UI & API MVP** | React UI (input, kartu opsi, live mode, penghitung kata, salin, ringkasan perubahan, pratinjau karakter tersembunyi G-12), tema Kertas/Malam, Hono `/api/clean` + `/api/health` |
| **M3 — Polish** | Web Worker, unduh .txt, simpan preferensi, CLI (G-13), statistik global (G-14), offline (G-15), footer repo/issue (G-16), aksesibilitas, benchmark di CI |
| **M4 — Extras** | Diff view (G-11), mode lindungi `*` pada kode/ekspresi |

*(Estimasi waktu ditentukan setelah ukuran tim dan target hosting dikonfirmasi.)*

---

## 14. Risiko & Open Questions

### Risiko
| Risiko | Mitigasi |
|---|---|
| Penghapusan `*` merusak ekspresi matematika | Dokumentasikan; mode proteksi pada M4 |
| Konversi homoglyph merusak teks non-Latin | Default nonaktif; saat aktif hanya pada kata campuran-skrip |
| Penghapusan ZWJ merusak emoji gabungan | Sub-opsi pertahankan ZWJ |
| NFKC mengubah makna/bentuk (superscript, ligatur) | Default NFC; NFKC pilihan eksplisit |
| Penggabungan *single-pass* menimbulkan beda hasil | Uji ekuivalensi terhadap implementasi referensi |
| Target performa meleset | Benchmark sejak M1; optimasi hanya bila terukur perlu |
| Penyalahgunaan API (spam/beban) | Rate limit platform, batas body, batas 10.000 kata |
| **Penyalahgunaan counter statistik** | Whitelist kunci, batas nilai per request, total dihitung server, rate limit |
| **Lisensi font** | TAN St. Canard adalah font komersial (Creative Market menawarkan lisensi terpisah untuk Desktop, E-pub, dan Web Font); beberapa situs pihak ketiga menandainya "gratis untuk pribadi". Perlu **lisensi Web Font** sebelum produksi. Lisensi **Disclaimer** perlu diverifikasi di Fontfabric (sumber pihak ketiga saling bertentangan). Anton SC berlisensi OFL (aman) |
| **Repo publik + font berlisensi** | Jangan meng-commit berkas font berlisensi ke repo publik; simpan di luar git atau pakai fallback stack |
| **Font display sulit dibaca pada ukuran kecil** | Font display hanya untuk judul/label besar; teks bacaan memakai font sistem |
| **Efek tekstur mengganggu keterbacaan/performa** | Tekstur hanya di luar area kerja; ubin SVG kecil; uji kontras |
| Label UI hasil terjemahan otomatis keliru | Perbaiki label ("judul Markdown", bukan "judul penurunan harga") |

### Open Questions
1. Hosting API: Cloudflare Workers, atau Bun/Node pada VPS/PaaS?
2. Penyimpanan counter (G-14): D1, Durable Objects, atau lainnya? (verifikasi dokumentasi platform)
3. Statistik global: aktif default dengan opt-out (rekomendasi) atau opt-in?
4. Apakah API publik perlu API key/autentikasi, atau cukup rate limit?
5. Default F-10: **NFC** (konservatif, dipakai saat ini) atau **NFKC** (dipakai halaman referensi)?
6. `* ` sebagai bullet list: diubah menjadi `- ` atau ikut dihapus?
7. Apakah perlu opsi tambahan di luar 10 opsi referensi (mis. gabungkan spasi berurutan, normalisasi baris baru)?
8. Lisensi repository (MIT, Apache-2.0, atau privat)? Menentukan cara menangani font berlisensi.
9. Font teks bacaan: font sistem (usulan) atau font keempat? *(Tiga font yang diminta semuanya display.)*
10. Apakah pernyataan "umum pada keluaran AI" dipertahankan di UI sebelum ada data G-14?

*(Diputuskan sejak v1.1: dash → `-`; `MAX_CHARS` = 200.000; G-12 dan G-13 masuk build; G-11 M4.)*

---

## 15. Referensi

- The Unicode Consortium. *Unicode Standard Annex #15: Unicode Normalization Forms* — https://unicode.org/reports/tr15/
- The Unicode Consortium. *Unicode Technical Standard #39: Unicode Security Mechanisms* (confusables) — https://unicode.org/reports/tr39/
- The Unicode Consortium. *Unicode Standard Annex #9: Unicode Bidirectional Algorithm* — https://unicode.org/reports/tr9/
- ECMAScript® Language Specification — `String.prototype.normalize` — https://tc39.es/ecma262/
- Hono — https://hono.dev/ ; React — https://react.dev/ ; Vite — https://vite.dev/
- CommonMark Spec — https://spec.commonmark.org/
- W3C. *WCAG 2.2* — https://www.w3.org/TR/WCAG22/
- TanType. *TAN – St. Canard* (Creative Market) — https://creativemarket.com/tantype/5345542-TAN-St.-Canard
- Google Fonts. *Anton SC* (OFL-1.1) — https://fonts.google.com/specimen/Anton+SC
- Fontfabric. *Disclaimer* (Boris Bonev, 2019) — verifikasi lisensi langsung di situs Fontfabric.
- Halaman referensi "AI Text Cleaner" (diberikan pengguna) — sumber inspirasi proposisi nilai dan statistik penggunaan; tidak disalin.
