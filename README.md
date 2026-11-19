# JejakMental

Platform web direktori layanan kesehatan jiwa di **Kota Palu**: mencari puskesmas,
rumah sakit, dan klinik, melihat biaya serta jam layanan, mengajukan janji, dan
skrining singkat — dengan bahasa dan tampilan yang tidak menekan penggunanya.

> Proyek mata kuliah Rekayasa Perangkat Lunak — Universitas Tadulako (2026).
> JejakMental bukan layanan darurat dan tidak memberikan diagnosis.

---

## Isi

1. [Fitur](#fitur)
2. [Struktur proyek](#struktur-proyek)
3. [Menjalankan lokal](#menjalankan-lokal)
4. [Akun demo](#akun-demo)
5. [API](#api)
6. [Prinsip data](#prinsip-data)
7. [Keputusan desain](#keputusan-desain)
8. [Deploy](#deploy)

---

## Fitur

| Fitur | Keterangan |
| --- | --- |
| Direktori | 11 entri: RSUD Madani, RSUD Undata, RSUD Anutapura, 4 puskesmas dengan psikolog klinis gratis, klinik swasta, layanan komunitas, Dinkes Kota Palu |
| Penyaring | kata kunci, gratis, BPJS, daring, IGD 24 jam, jenis layanan, kecamatan, urutan |
| Halaman detail | layanan, usia, biaya + catatan, jam, catatan akses, jadwal 3 minggu, sumber publik |
| Pengajuan janji | slot contoh (ditandai jelas) dengan validasi kuota, kode pengajuan, pembatalan |
| Skrining | WHO-5 (5 butir), hasil + saran praktis, opsional disimpan di akun |
| Bantuan segera | Healing119, PSC 119 Kota Palu, IGD tiga RS, panduan singkat |
| Akun | nama panggilan + email, pengajuan janji, riwayat skrining, hapus akun permanen |
| Panel admin | statistik, penyuntingan entri, penandaan terverifikasi, daftar pengajuan |

Frontend: React 18 + Vite (react-router, fetch, CSS tulisan tangan).
Backend: FastAPI + SQLAlchemy 2 (SQLite untuk lokal, PostgreSQL untuk produksi).
Autentikasi: JWT di cookie `HttpOnly`, bcrypt untuk kata sandi.

---

## Struktur proyek

```
jejakmental-v2/
├── backend/
│   ├── app/
│   │   ├── main.py              # entrypoint FastAPI + seed idempoten
│   │   ├── api/                 # auth, directory, booking, screening, emergency, admin
│   │   ├── core/                # config, security (bcrypt + JWT)
│   │   ├── db/
│   │   │   ├── seed_data.py     # ← semua konten direktori & kontak darurat
│   │   │   └── startup_data.py  # pengisian database saat kosong
│   │   ├── models/ schemas/ services/
│   ├── scripts/seed.py          # seed manual (opsional, --force)
│   ├── requirements.txt
│   └── api/index.py             # adapter Vercel
├── frontend/
│   ├── src/
│   │   ├── pages/               # Home, Directory, FacilityDetail, Screening, Emergency, …
│   │   ├── components/          # Layout, FacilityCard, BookingForm
│   │   ├── lib/                 # api client, auth context, helper format
│   │   └── styles/base.css
│   └── vite.config.js           # proxy /api → backend saat dev
└── screenshots/
```

---

## Menjalankan lokal

Butuh **Python 3.11–3.12** dan **Node.js 18+**.

### 1. Backend

```bash
cd backend
python3.12 -m venv .venv          # atau: uv venv --python 3.12 .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Database SQLite (`backend/jejakmental.db`) dibuat otomatis beserta 11 entri
direktori dan dua akun demo saat server pertama kali dijalankan.
Dokumentasi API interaktif: <http://localhost:8000/docs>

Untuk PostgreSQL, salin `.env.example` menjadi `.env` lalu isi `DATABASE_URL`:

```
DATABASE_URL=postgresql+psycopg://user:password@localhost:5432/jejakmental
```

### 2. Frontend

```bash
cd frontend
npm install --cache .npm-cache   # bila cache npm global bermasalah
cp .env.example .env             # opsional; default memakai proxy ke :8010
npm run dev
```

Buka <http://localhost:5173>.

Proxy dev diatur lewat `VITE_PROXY_TARGET`:

```bash
VITE_PROXY_TARGET=http://127.0.0.1:8000 npm run dev
```

Build produksi: `npm run build` (hasil di `frontend/dist`).

---

## Akun demo

| Peran | Email | Kata sandi |
| --- | --- | --- |
| Pengguna | `demo@jejakmental.id` | `demo1234` |
| Admin | `admin@jejakmental.id` | `admin123` |

Akun ini dibuat otomatis oleh seed dan **harus diganti atau dihapus sebelum
digunakan publik**.

---

## API

Semua endpoint berada di bawah `/api`.

| Method | Path | Akses | Keterangan |
| --- | --- | --- | --- |
| GET | `/health` | publik | status + tanggal data |
| GET | `/facilities` | publik | `?q&kind&district&free&bpjs&online&emergency&sort` |
| GET | `/facilities/districts` | publik | daftar kecamatan |
| GET | `/facilities/{slug}` | publik | detail entri |
| GET | `/facilities/{slug}/availability?days=21` | publik | ketersediaan per hari |
| GET | `/emergency` | publik | kontak darurat + panduan |
| GET | `/screening/form` | publik | instrumen WHO-5 |
| POST | `/screening` | publik* | kirim jawaban, `*` simpan hanya bila login |
| GET | `/screening/mine` | pengguna | riwayat skrining sendiri |
| DELETE | `/screening/{id}` | pengguna | hapus satu hasil |
| POST | `/auth/register` · `/auth/login` · `/auth/logout` | publik | sesi cookie |
| GET/PATCH/DELETE | `/auth/me` | pengguna | profil, hapus akun |
| POST | `/bookings` | pengguna | ajukan janji (slot `bookable` saja) |
| GET | `/bookings` | pengguna | daftar pengajuan sendiri |
| POST | `/bookings/{id}/cancel` | pengguna | batalkan |
| GET | `/admin/stats` · `/admin/facilities` · `/admin/bookings` | admin | panel pengelola |
| PATCH | `/admin/facilities/{id}` | admin | ubah entri |
| POST | `/admin/bookings/{id}/cancel` | admin | batalkan pengajuan |

Aturan penting yang ditegakkan server:

- Slot `call_to_book` (jadwal riil) **tidak bisa** dipesan lewat web → 409.
- Kuota slot divalidasi ulang tepat sebelum menyimpan; permintaan ganda
  dicegah oleh `UniqueConstraint` di database.
- Admin tidak bisa melihat jawaban skrining; endpoint admin hanya memuat
  nomor kontak untuk konfirmasi.

---

## Prinsip data

1. **Hanya yang terverifikasi.** Nama faskes, alamat, layanan, dan kontak diambil
   dari situs resmi faskes, profil SIRS Kemenkes, kanal Pemkot/Dinkes Palu, dan
   pemberitaan kredibel.
2. **Tidak menebak angka.** Tarif dan jam praktik yang belum dipublikasikan
   dibiarkan `null` dan tampil sebagai “belum dipastikan”.
3. **Nama tenaga kesehatan** hanya dicantumkan bila lembaganya mempublikasikan.
4. **Slot contoh ditandai.** Demi alur booking yang bisa didemokan, sebagian slot
   bertanda “slot contoh” (garis putus-putus di UI). Statusnya selalu
   *menunggu konfirmasi*, tidak pernah otomatis “terkonfirmasi”.
5. **Setiap entri punya `source_url`** dan tanggal tinjauan terakhir.

Semua konten ada di `backend/app/db/seed_data.py`; memperbarui data cukup
mengubah berkas itu lalu menjalankan `python scripts/seed.py --force`.

---

## Keputusan desain

Alasan singkat di balik tampilan:

- **Palet kertas hangat, hijau daun, dan tanah liat** — bukan gradasi ungu-biru.
  Kontras teks utama ≈ 13:1, teks sekunder tetap lolos WCAG AA.
- **Tipografi serif untuk judul** agar terasa seperti bacaan, bukan dashboard.
- **Satu kolom, ruang kosong lebar, batas 66 karakter** untuk teks panjang.
- **Tanpa animasi dekoratif.** Hanya transisi 120 ms, dimatikan otomatis lewat
  `prefers-reduced-motion`.
- **Tanpa dark pattern:** tidak ada hitungan mundur, “hanya 1 slot tersisa!”,
  pengingat berulang, atau pop-up. Pengguna bebas berhenti kapan saja.
- **Bahasa tidak menghakimi:** tidak ada kata “gagal”, “seharusnya”, atau label
  diagnosis dari sistem.
- **Kontak manusia selalu bisa dijangkau** dalam satu klik (telepon/WhatsApp) di
  samping alur digital.
- **Bantuan segera** dapat diakses dari beranda dan navigasi, tidak tersembunyi.
- **Privasi sebagai fitur:** tidak meminta identitas, hasil skrining bisa tidak
  disimpan, akun bisa dihapus permanen.

---

## Deploy

Lihat [`DEPLOY.md`](DEPLOY.md).
