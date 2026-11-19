import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../lib/auth'

const LINKS = [
  { to: '/direktori', label: 'Direktori layanan' },
  { to: '/skrining', label: 'Skrining singkat' },
  { to: '/bantuan', label: 'Bantuan segera' },
]

function NavItem({ to, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      style={({ isActive }) =>
        isActive
          ? { color: 'var(--leaf)', background: 'var(--leaf-soft)', fontWeight: 500 }
          : undefined
      }
    >
      {label}
    </NavLink>
  )
}

export default function Layout() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setOpen(false)
    // Pengguna pembaca layar diberi tahu halaman berganti, tanpa memindahkan
    // fokus secara paksa.
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname])

  // Live region mengumumkan judul halaman baru.
  const [announce, setAnnounce] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => {
      const h1 = document.querySelector('main h1')
      setAnnounce(h1 ? `Halaman: ${h1.textContent}` : '')
    }, 250)
    return () => clearTimeout(timer)
  }, [location.pathname])

  function close() {
    setOpen(false)
  }

  return (
    <div className="site">
      <a className="skip-link" href="#main">
        Langsung ke isi
      </a>

      <header className="site-header">
        <div className="wrap header-inner">
          <Link to="/" className="brand" onClick={close}>
            <span className="brand-mark" aria-hidden="true" />
            <span>
              JejakMental
              <span className="brand-sub" style={{ display: 'block', marginTop: '-0.15rem' }}>
                layanan jiwa di Palu
              </span>
            </span>
          </Link>

          <button
            type="button"
            className="menu-toggle"
            aria-expanded={open}
            aria-controls="primary-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? 'Tutup menu' : 'Menu'}
          </button>

          <nav
            id="primary-nav"
            className={`nav${open ? ' is-open' : ''}`}
            aria-label="Navigasi utama"
          >
            {LINKS.map((link) => (
              <NavItem key={link.to} {...link} onClick={close} />
            ))}
            {user ? (
              <NavLink to="/akun" onClick={close}>
                Akun saya
              </NavLink>
            ) : (
              <NavLink to="/masuk" onClick={close}>
                Masuk
              </NavLink>
            )}
          </nav>

          <div className="header-actions">
            {user ? (
              <button type="button" className="btn btn-quiet btn-sm" onClick={logout}>
                Keluar
              </button>
            ) : (
              <Link
                to="/skrining"
                className="btn btn-primary btn-sm"
                onClick={close}
              >
                Mulai dari sini
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="sr-only" aria-live="polite">
        {announce}
      </div>

      <main id="main" className="site-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="wrap footer-grid">
          <div>
            <Link to="/" className="brand" style={{ fontSize: '1.1rem' }}>
              <span className="brand-mark" aria-hidden="true" />
              JejakMental
            </Link>
            <p style={{ marginTop: '0.7rem', maxWidth: '34ch' }}>
              Direktori layanan kesehatan jiwa di Kota Palu. Dibuat untuk membantu
              orang menemukan bantuan tanpa harus menjelaskan dirinya berkali-kali.
            </p>
            <p className="tiny">
              Proyek mata kuliah Rekayasa Perangkat Lunak, Universitas Tadulako.
            </p>
          </div>

          <div>
            <h4>Mulai dari</h4>
            <ul>
              <li><Link to="/direktori?free=true">Layanan gratis</Link></li>
              <li><Link to="/direktori?kind=puskesmas">Puskesmas</Link></li>
              <li><Link to="/direktori?online=true">Konseling daring</Link></li>
              <li><Link to="/skrining">Skrining singkat</Link></li>
            </ul>
          </div>

          <div>
            <h4>Penting</h4>
            <ul>
              <li><Link to="/bantuan">Bantuan segera &amp; darurat</Link></li>
              <li><Link to="/tentang">Tentang &amp; sumber data</Link></li>
              <li><Link to="/privasi">Privasi &amp; data Anda</Link></li>
            </ul>
            <p className="tiny" style={{ marginTop: '0.9rem' }}>
              JejakMental bukan layanan darurat dan tidak memberikan diagnosis.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
