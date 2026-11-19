import { Link, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import { formatDate } from '../lib/format'

const STATUS_LABEL = {
  pending: 'Menunggu, belum dikonfirmasi',
  cancelled: 'Dibatalkan',
}

export default function Account() {
  const { user, ready, logout, setUser } = useAuth()
  const [bookings, setBookings] = useState(null)
  const [screenings, setScreenings] = useState(null)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [saved, setSaved] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (!user) return
    setName(user.name)
    setPhone(user.phone || '')
    Promise.all([api.bookings(), api.myScreenings()])
      .then(([b, s]) => {
        setBookings(b)
        setScreenings(s)
      })
      .catch((err) => setError(err.message))
  }, [user])

  if (!ready) return <div className="wrap"><div className="loading-line" style={{ marginTop: '2rem' }} /></div>
  if (!user) return <Navigate to="/masuk" replace />

  async function saveProfile(e) {
    e.preventDefault()
    setSaved('')
    try {
      const updated = await api.updateMe({ name: name.trim(), phone: phone.trim() })
      setUser(updated)
      setSaved('Tersimpan.')
    } catch (err) {
      setError(err.message)
    }
  }

  async function cancelBooking(id) {
    try {
      const updated = await api.cancelBooking(id)
      setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)))
    } catch (err) {
      setError(err.message)
    }
  }

  async function deleteScreening(id) {
    try {
      await api.deleteScreening(id)
      setScreenings((prev) => prev.filter((s) => s.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  async function deleteAccount() {
    try {
      await api.deleteMe()
      setUser(null)
      await logout()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="wrap" style={{ maxWidth: '880px' }}>
      <div className="spread" style={{ marginTop: '1rem' }}>
        <div>
          <p className="section-label">Akun saya</p>
          <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)' }}>Halo, {user.name}</h1>
          <p className="small muted" style={{ margin: 0 }}>{user.email}</p>
        </div>
        <div className="row">
          {user.role === 'admin' && <Link to="/admin" className="btn btn-quiet btn-sm">Panel admin</Link>}
          <button type="button" className="btn btn-quiet btn-sm" onClick={logout}>Keluar</button>
        </div>
      </div>

      {error && <div className="notice notice-error" style={{ marginTop: '1rem' }}>{error}</div>}

      <section style={{ marginTop: '2.2rem' }} aria-labelledby="janji">
        <div className="spread">
          <h2 id="janji" style={{ fontSize: '1.35rem' }}>Pengajuan janji</h2>
          <Link to="/direktori" className="btn btn-plain btn-sm">Cari layanan lain</Link>
        </div>
        {!bookings && <p className="small muted">Memuat…</p>}
        {bookings && bookings.length === 0 && (
          <div className="empty">
            <p>Belum ada pengajuan janji.</p>
            <p className="small muted" style={{ marginBottom: '0.8rem' }}>
              Mulai dari layanan gratis di puskesmas bila Anda ingin biaya pasti nol.
            </p>
            <Link to="/direktori?free=true" className="btn btn-quiet btn-sm">Lihat layanan gratis</Link>
          </div>
        )}
        {bookings && bookings.length > 0 && (
          <ul className="list-plain">
            {bookings.map((b) => (
              <li className="booking-item" key={b.id}>
                <div className="spread">
                  <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>
                      {b.facility?.name || 'Layanan'}
                    </h3>
                    <p className="small" style={{ margin: 0 }}>
                      {formatDate(b.slot_date)} · {b.slot?.start_time}–{b.slot?.end_time}
                      {b.slot?.label ? ` · ${b.slot.label}` : ''}
                    </p>
                    <p className="small muted" style={{ margin: '0.3rem 0 0' }}>
                      Kode <span className="code">{b.code}</span> ·{' '}
                      <span className={`status status-${b.status}`}>{STATUS_LABEL[b.status] || b.status}</span>
                    </p>
                  </div>
                  {b.status === 'pending' && (
                    <button type="button" className="btn btn-quiet btn-sm" onClick={() => cancelBooking(b.id)}>
                      Batalkan
                    </button>
                  )}
                </div>
                {b.follow_up_note && (
                  <p className="tiny muted" style={{ marginTop: '0.6rem', maxWidth: '64ch' }}>
                    {b.follow_up_note}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <hr className="rule" />

      <section aria-labelledby="skrining-riwayat">
        <div className="spread">
          <h2 id="skrining-riwayat" style={{ fontSize: '1.35rem' }}>Hasil skrining yang disimpan</h2>
          <Link to="/skrining" className="btn btn-plain btn-sm">Isi skrining baru</Link>
        </div>
        <p className="small muted" style={{ maxWidth: '58ch' }}>
          Hanya Anda yang bisa melihat daftar ini. Jawaban per butir tidak
          ditampilkan di mana pun, termasuk kepada admin.
        </p>
        {screenings && screenings.length === 0 && (
          <p className="small">Belum ada hasil yang disimpan.</p>
        )}
        {screenings && screenings.length > 0 && (
          <ul className="list-plain">
            {screenings.map((s) => (
              <li className="booking-item" key={s.id}>
                <div className="spread">
                  <div>
                    <strong>{s.score} / 25</strong>
                    <span className="small muted"> · {s.level.replace('_', ' ')}</span>
                    <p className="tiny muted" style={{ margin: '0.2rem 0 0' }}>
                      {formatDate(String(s.created_at).slice(0, 10))}
                    </p>
                  </div>
                  <button type="button" className="btn btn-plain btn-sm" onClick={() => deleteScreening(s.id)}>
                    Hapus
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <hr className="rule" />

      <section aria-labelledby="profil">
        <h2 id="profil" style={{ fontSize: '1.35rem' }}>Profil</h2>
        <form className="form-grid" onSubmit={saveProfile} style={{ maxWidth: '420px' }}>
          <label className="field">
            <span className="field-label">Nama panggilan</span>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label className="field">
            <span className="field-label">Nomor telepon (opsional)</span>
            <input className="input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>
          <div className="row">
            <button type="submit" className="btn btn-primary btn-sm">Simpan perubahan</button>
            {saved && <span className="small muted">{saved}</span>}
          </div>
        </form>
      </section>

      <hr className="rule" />

      <section aria-labelledby="hapus-akun">
        <h2 id="hapus-akun" style={{ fontSize: '1.2rem' }}>Hapus akun</h2>
        <p className="small muted" style={{ maxWidth: '58ch' }}>
          Akun, pengajuan janji, dan hasil skrining Anda akan dihapus permanen.
          Tindakan ini tidak bisa dibatalkan.
        </p>
        {!confirmDelete ? (
          <button type="button" className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(true)}>
            Saya ingin menghapus akun
          </button>
        ) : (
          <div className="notice notice-error" style={{ maxWidth: '520px' }}>
            <h3>Yakin menghapus semuanya?</h3>
            <p>Data tidak dapat dikembalikan setelah dihapus.</p>
            <div className="row" style={{ marginTop: '0.7rem' }}>
              <button type="button" className="btn btn-danger btn-sm" onClick={deleteAccount}>
                Ya, hapus akun saya
              </button>
              <button type="button" className="btn btn-quiet btn-sm" onClick={() => setConfirmDelete(false)}>
                Batal
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
