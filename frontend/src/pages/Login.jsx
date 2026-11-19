import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../lib/auth'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await login({ email, password })
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
        <p className="section-label">Masuk</p>
        <h1 style={{ fontSize: '1.9rem' }}>Lanjutkan dari tempat Anda berhenti</h1>
        <p className="small muted">
          Akun dipakai untuk menyimpan pengajuan janji dan hasil skrining Anda.
          Direktori tetap bisa dibaca tanpa masuk.
        </p>

        <form className="form-grid" onSubmit={submit} style={{ marginTop: '1.4rem' }}>
          <label className="field">
            <span className="field-label">Email</span>
            <input
              className="input"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="field">
            <span className="field-label">Kata sandi</span>
            <input
              className="input"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error && <div className="notice notice-error">{error}</div>}
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? 'Memeriksa…' : 'Masuk'}
          </button>
        </form>

        <p className="small" style={{ marginTop: '1.2rem' }}>
          Belum punya akun? <Link to="/daftar">Buat akun</Link> — cukup nama
          panggilan dan email.
        </p>
        <p className="tiny muted" style={{ marginTop: '1.5rem' }}>
          Akun demo: demo@jejakmental.id / demo1234 · Admin: admin@jejakmental.id / admin123
        </p>
      </div>
    </div>
  )
}
