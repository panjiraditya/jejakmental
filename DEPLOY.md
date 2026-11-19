# Deploy JejakMental

Dua layanan terpisah: **backend** (FastAPI, Python) dan **frontend** (Vite,
output statis). Keduanya bisa memakai Vercel.

## 1. Database PostgreSQL

Gunakan Neon, Supabase, Railway, atau Postgres lokal/server kampus.
Salin connection string:

```
postgresql+psycopg://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require
```

Tabel dan data awal dibuat otomatis saat backend pertama kali start (seed
idempoten), jadi tidak ada migrasi manual untuk demo.

## 2. Backend (Vercel)

Di folder `backend/`:

```bash
vercel --prod
```

Environment variables yang wajib diisi di dashboard Vercel:

| Variabel | Contoh | Catatan |
| --- | --- | --- |
| `DATABASE_URL` | `postgresql+psycopg://...` | jangan biarkan default SQLite |
| `SECRET_KEY` | string acak ≥ 32 karakter | `python -c "import secrets;print(secrets.token_urlsafe(48))"` |
| `CORS_ORIGINS` | `https://jejakmental.vercel.app` | domain frontend, tanpa garis miring akhir |
| `COOKIE_SECURE` | `true` | wajib bila frontend & backend beda domain |
| `DEMO_SCHEDULE_ENABLED` | `true` | `false` untuk menyembunyikan slot contoh |

Catatan serverless:

- SQLite **tidak** cocok untuk produksi (filesystem read-only / sementara).
- Karena cookie lintas domain, frontend dan backend idealnya berada di domain
  yang sama (custom domain) atau gunakan `COOKIE_SECURE=true` + `SameSite=Lax`.
  Alternatif paling sederhana: arahkan `/api/*` ke backend melalui rewrites
  Vercel pada project frontend sehingga cookie menjadi same-origin.

Contoh `frontend/vercel.json` bila memakai rewrites ke backend:

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "https://jejakmental-api.vercel.app/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Dengan cara ini `VITE_API_URL` tidak perlu diisi (client memakai `/api`).

## 3. Frontend (Vercel)

Di folder `frontend/`:

```bash
npm run build
vercel --prod
```

Tambahkan `vercel.json`:

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

Bila memakai `VITE_API_URL` (backend di domain berbeda), isi di dashboard:

```
VITE_API_URL=https://jejakmental-api.vercel.app/api
```

Lalu jalankan ulang build (Vite menyisipkan nilai ini saat build).

## 4. Alternatif backend: server biasa

```bash
cd backend
python3.12 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL=postgresql+psycopg://...
export SECRET_KEY=$(python -c "import secrets;print(secrets.token_urlsafe(48))")
export CORS_ORIGINS=https://domain-anda
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Aktifkan HTTPS dan letakkan di belakang Nginx/Caddy.

## 5. Sebelum dipakai publik

- [ ] Hapus akun demo (`demo@jejakmental.id`, `admin@jejakmental.id`) atau ganti
      kata sandinya; buat akun admin sungguhan.
- [ ] Ganti `SECRET_KEY`.
- [ ] Tinjau ulang seluruh entri direktori dan `source_url`-nya.
- [ ] Putuskan apakah slot contoh ditampilkan (`DEMO_SCHEDULE_ENABLED`).
- [ ] Tambahkan pembatasan laju (rate limit) pada `/auth/login` bila backend
      terbuka publik.
