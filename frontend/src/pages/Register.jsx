import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../lib/auth'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })
  const [accept, setAccept] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim() || null,
        accept_terms: accept,
      })
      navigate('/akun', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="wrap">
      <div className="form-narrow" style={{ margin: '2rem auto 0' }}>
        <p className="section-label">Buat akun</p>
        <h1 style={{ fontSize: '1.9rem' }}>Cukup yang benar-benar perlu</h1>
        <p className="small muted">
          Kami tidak meminta nomor identitas, tanggal lahir, alamat, atau riwayat
          kesehatan. Anda bisa menghapus akun beserta datanya kapan saja.
        </p>

        <form className="form-grid" onSubmit={submit} style={{ marginTop: '1.4rem' }}>
          <label className="field">
            <span className="field-label">Nama panggilan</span>
            <input
              className="input"
              required
              minLength={2}
              maxLength={80}
              autoComplete="nickname"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
            />
            <span className="field-hint">Tidak harus nama lengkap.</span>
          </label>
          <label className="field">
            <span className="field-label">Email</span>
            <input
              className="input"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
            />
          </label>
          <label className="field">
            <span className="field-label">Kata sandi</span>
            <input
              className="input"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
            />
            <span className="field-hint">Minimal 8 karakter.</span>
          </label>
          <label className="field">
            <span className="field-label">Nomor telepon (opsional)</span>
            <input
              className="input"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
            />
            <span className="field-hint">Hanya dipakai bila Anda mengajukan janji.</span>
          </label>

          <label className="checkbox">
            <input type="checkbox" checked={accept} onChange={(e) => setAccept(e.target.checked)} />
            <span>
              Saya paham data saya disimpan untuk keperluan akun dan pengajuan
              janji, dan saya bisa menghapusnya sendiri. Lihat{' '}
              <Link to="/privasi">catatan privasi</Link>.
            </span>
          </label>

          {error && <div className="notice notice-error">{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={busy || !accept}>
            {busy ? 'Membuat akun…' : 'Buat akun'}
          </button>
        </form>

        <p className="small" style={{ marginTop: '1.2rem' }}>
          Sudah punya akun? <Link to="/masuk">Masuk</Link>
        </p>
      </div>
    </div>
  )
}
