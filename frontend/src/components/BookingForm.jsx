import { Link } from 'react-router-dom'
import { useState } from 'react'
import { api } from '../lib/api'
import { formatDate } from '../lib/format'

export default function BookingForm({ facility, slot, date, isLoggedIn, onClose }) {
  const [notes, setNotes] = useState('')
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  async function submit(event) {
    event.preventDefault()
    setStatus('loading')
    setError('')
    try {
      const booking = await api.createBooking({
        slot_id: slot.id,
        slot_date: date,
        notes: notes.trim() || null,
        contact_phone: phone.trim() || null,
      })
      setResult(booking)
      setStatus('done')
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="spread">
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.3rem' }}>Perlu akun untuk mengajukan janji</h3>
          <button type="button" className="btn btn-plain btn-sm" onClick={onClose}>Tutup</button>
        </div>
        <p className="small muted">
          Akun hanya dipakai untuk menyimpan pengajuan Anda. Kami tidak meminta
          nomor identitas atau riwayat kesehatan.
        </p>
        <div className="row" style={{ marginTop: '0.8rem' }}>
          <Link to="/masuk" className="btn btn-primary btn-sm">Masuk</Link>
          <Link to="/daftar" className="btn btn-quiet btn-sm">Buat akun baru</Link>
        </div>
      </div>
    )
  }

  if (status === 'done' && result) {
    return (
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <p className="section-label">Pengajuan tercatat</p>
        <h3 style={{ fontSize: '1.3rem' }}>Terima kasih, permintaan Anda sudah kami simpan.</h3>
        <p className="small">
          Kode: <span className="code">{result.code}</span> · {facility.name} ·{' '}
          {formatDate(date)} pukul {slot.start_time}
        </p>
        <div className="notice notice-warn" style={{ marginTop: '0.9rem' }}>
          <h3>Ini belum janji resmi</h3>
          <p>
            JejakMental belum terhubung langsung dengan sistem {facility.name}.
            Tim kami akan menghubungi Anda lewat nomor yang dicantumkan. Untuk
            kepastian lebih cepat, silakan juga menghubungi fasilitas langsung.
          </p>
        </div>
        <div className="row" style={{ marginTop: '0.9rem' }}>
          <Link to="/akun" className="btn btn-primary btn-sm">Lihat di akun saya</Link>
          <button type="button" className="btn btn-quiet btn-sm" onClick={onClose}>Tutup</button>
        </div>
      </div>
    )
  }

  return (
    <form className="card" style={{ marginTop: '1.5rem' }} onSubmit={submit}>
      <div className="spread">
        <div>
          <p className="section-label" style={{ marginBottom: '0.2rem' }}>Ajukan janji (slot contoh)</p>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>
            {formatDate(date)} · {slot.start_time}–{slot.end_time}
          </h3>
          <p className="small muted" style={{ margin: 0 }}>{slot.label} · {facility.name}</p>
        </div>
        <button type="button" className="btn btn-plain btn-sm" onClick={onClose}>Tutup</button>
      </div>

      <div className="form-grid" style={{ marginTop: '1rem' }}>
        <label className="field">
          <span className="field-label">Nomor yang bisa dihubungi (boleh dikosongkan)</span>
          <input
            className="input"
            type="tel"
            inputMode="tel"
            placeholder="Contoh: 0812 3456 7890"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
          />
          <span className="field-hint">Dipakai hanya untuk konfirmasi jadwal oleh tim JejakMental.</span>
        </label>

        <label className="field">
          <span className="field-label">Catatan untuk petugas (opsional)</span>
          <textarea
            className="textarea"
            maxLength={500}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Misalnya: ini kunjungan pertama, atau ingin dihubungi setelah pukul 17.00."
          />
          <span className="field-hint">
            Tidak perlu menuliskan keluhan atau diagnosis di sini. Cukup hal praktis.
          </span>
        </label>
      </div>

      {error && <div className="notice notice-error" style={{ marginTop: '0.9rem' }}>{error}</div>}

      <div className="row" style={{ marginTop: '1rem' }}>
        <button type="submit" className="btn btn-primary" disabled={status === 'loading'}>
          {status === 'loading' ? 'Menyimpan…' : 'Simpan pengajuan'}
        </button>
        <span className="tiny muted">Tidak ada biaya untuk menyimpan pengajuan.</span>
      </div>
    </form>
  )
}
