import { Link, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import { formatDate, KIND_LABEL } from '../lib/format'
import SlotManager from '../components/SlotManager'

export default function Admin() {
  const { user, ready } = useAuth()
  const [stats, setStats] = useState(null)
  const [facilities, setFacilities] = useState(null)
  const [bookings, setBookings] = useState(null)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('data')
  const [editing, setEditing] = useState(null)
  const [draft, setDraft] = useState({})
  const [slotFor, setSlotFor] = useState(null)

  useEffect(() => {
    if (!user || user.role !== 'admin') return
    Promise.all([api.adminStats(), api.adminFacilities(), api.adminBookings()])
      .then(([s, f, b]) => {
        setStats(s)
        setFacilities(f)
        setBookings(b)
      })
      .catch((err) => setError(err.message))
  }, [user])

  if (!ready) return <div className="wrap"><div className="loading-line" style={{ marginTop: '2rem' }} /></div>
  if (!user) return <Navigate to="/masuk" replace />
  if (user.role !== 'admin') {
    return (
      <div className="wrap">
        <div className="empty" style={{ marginTop: '2rem' }}>
          <p>Bagian ini hanya untuk pengelola data.</p>
          <Link to="/" className="btn btn-quiet btn-sm">Kembali ke beranda</Link>
        </div>
      </div>
    )
  }

  function startEdit(f) {
    setEditing(f.id)
    setDraft({
      summary: f.summary,
      phone: f.phone || '',
      cost_note: f.cost_note || '',
      opening_note: f.opening_note || '',
      is_verified: f.is_verified,
      source_url: f.source_url || '',
    })
  }

  async function saveEdit(id) {
    try {
      const updated = await api.adminUpdateFacility(id, {
        summary: draft.summary,
        phone: draft.phone || null,
        cost_note: draft.cost_note || null,
        opening_note: draft.opening_note || null,
        is_verified: draft.is_verified,
        source_url: draft.source_url || null,
      })
      setFacilities((prev) => prev.map((f) => (f.id === id ? { ...f, ...updated } : f)))
      setEditing(null)
    } catch (err) {
      setError(err.message)
    }
  }

  async function cancelBooking(id) {
    try {
      await api.adminCancelBooking(id)
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: 'cancelled' } : b)))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="wrap">
      <div className="spread" style={{ marginTop: '1rem' }}>
        <div>
          <p className="section-label">Panel admin</p>
          <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)' }}>Menjaga data tetap jujur</h1>
          <p className="small muted" style={{ maxWidth: '60ch' }}>
            Ubah hanya bidang yang Anda yakini dari sumber resmi. Bidang yang
            belum diketahui sebaiknya dikosongkan, bukan diisi perkiraan.
          </p>
        </div>
        <Link to="/akun" className="btn btn-quiet btn-sm">Akun saya</Link>
      </div>

      {error && <div className="notice notice-error" style={{ marginTop: '1rem' }}>{error}</div>}

      {stats && (
        <div className="row" style={{ marginTop: '1.5rem', gap: '1.5rem' }}>
          {[
            ['Entri direktori', stats.facilities],
            ['Sudah tayang', stats.published],
            ['Belum terverifikasi', stats.unverified],
            ['Pengajuan aktif', stats.bookings_pending],
            ['Pengguna', stats.users],
            ['Skrining tersimpan', stats.screenings],
          ].map(([label, value]) => (
            <div key={label}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.7rem', lineHeight: 1.1 }}>{value}</div>
              <div className="tiny muted">{label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="filter-chips" style={{ marginTop: '2rem' }} role="tablist" aria-label="Bagian admin">
        <button type="button" className="chip" aria-pressed={tab === 'data'} onClick={() => setTab('data')}>
          Entri direktori
        </button>
        <button type="button" className="chip" aria-pressed={tab === 'booking'} onClick={() => setTab('booking')}>
          Pengajuan janji
        </button>
      </div>

      {tab === 'data' && (
        <div style={{ marginTop: '1.2rem' }}>
          {slotFor && (
            <div className="card" style={{ marginBottom: '1.2rem' }}>
              <SlotManager facility={slotFor} onClose={() => setSlotFor(null)} />
            </div>
          )}
          {!facilities && <p className="small muted">Memuat…</p>}
          {facilities && (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">Nama</th>
                    <th scope="col">Jenis</th>
                    <th scope="col">Kecamatan</th>
                    <th scope="col">Status data</th>
                    <th scope="col">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {facilities.map((f) => (
                    <tr key={f.id}>
                      <td>
                        <Link to={`/direktori/${f.slug}`}>{f.name}</Link>
                        {editing === f.id && (
                          <div className="form-grid" style={{ marginTop: '0.8rem', maxWidth: '520px' }}>
                            <label className="field">
                              <span className="field-label">Ringkasan</span>
                              <textarea
                                className="textarea"
                                value={draft.summary}
                                onChange={(e) => setDraft((d) => ({ ...d, summary: e.target.value }))}
                              />
                            </label>
                            <label className="field">
                              <span className="field-label">Telepon</span>
                              <input
                                className="input"
                                value={draft.phone}
                                onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
                              />
                            </label>
                            <label className="field">
                              <span className="field-label">Catatan biaya</span>
                              <input
                                className="input"
                                value={draft.cost_note}
                                onChange={(e) => setDraft((d) => ({ ...d, cost_note: e.target.value }))}
                              />
                            </label>
                            <label className="field">
                              <span className="field-label">Jam layanan</span>
                              <input
                                className="input"
                                value={draft.opening_note}
                                onChange={(e) => setDraft((d) => ({ ...d, opening_note: e.target.value }))}
                              />
                            </label>
                            <label className="field">
                              <span className="field-label">Sumber publik (URL)</span>
                              <input
                                className="input"
                                value={draft.source_url}
                                onChange={(e) => setDraft((d) => ({ ...d, source_url: e.target.value }))}
                              />
                            </label>
                            <label className="checkbox">
                              <input
                                type="checkbox"
                                checked={draft.is_verified}
                                onChange={(e) => setDraft((d) => ({ ...d, is_verified: e.target.checked }))}
                              />
                              <span>Sudah dicek ke sumber resmi</span>
                            </label>
                            <div className="row">
                              <button type="button" className="btn btn-primary btn-sm" onClick={() => saveEdit(f.id)}>
                                Simpan
                              </button>
                              <button type="button" className="btn btn-quiet btn-sm" onClick={() => setEditing(null)}>
                                Batal
                              </button>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="small">{KIND_LABEL[f.kind]}</td>
                      <td className="small">{f.district || '—'}</td>
                      <td className="small">
                        {f.is_verified ? 'Terverifikasi' : 'Perlu dicek'}
                        <span className="tiny muted" style={{ display: 'block' }}>
                          {f.reviewed_on ? formatDate(String(f.reviewed_on).slice(0, 10)) : ''}
                        </span>
                      </td>
                      <td>
                        <div className="row" style={{ gap: '0.3rem' }}>
                          <button type="button" className="btn btn-quiet btn-sm" onClick={() => startEdit(f)}>
                            Ubah
                          </button>
                          <button type="button" className="btn btn-quiet btn-sm" onClick={() => setSlotFor(f)}>
                            Jadwal
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'booking' && (
        <div style={{ marginTop: '1.2rem' }}>
          {!bookings && <p className="small muted">Memuat…</p>}
          {bookings && bookings.length === 0 && <p className="small">Belum ada pengajuan.</p>}
          {bookings && bookings.length > 0 && (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">Kode</th>
                    <th scope="col">Layanan</th>
                    <th scope="col">Tanggal</th>
                    <th scope="col">Kontak</th>
                    <th scope="col">Status</th>
                    <th scope="col">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id}>
                      <td><span className="code">{b.code}</span></td>
                      <td className="small">
                        <Link to={`/direktori/${b.facility_slug}`}>{b.facility}</Link>
                        <span className="tiny muted" style={{ display: 'block' }}>{b.slot}</span>
                      </td>
                      <td className="small nowrap">{formatDate(b.slot_date)}</td>
                      <td className="small nowrap">
                        {b.contact}
                        <span className="tiny muted" style={{ display: 'block' }}>{b.user_ref}</span>
                      </td>
                      <td className="small">
                        <span className={`status status-${b.status}`}>{b.status}</span>
                      </td>
                      <td>
                        {b.status !== 'cancelled' && (
                          <button type="button" className="btn btn-quiet btn-sm" onClick={() => cancelBooking(b.id)}>
                            Batalkan
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
