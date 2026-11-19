import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { telHref } from '../lib/format'

const KIND_TITLE = {
  crisis: 'Dukungan emosional & krisis',
  medical: 'Gawat darurat medis',
  er: 'Instalasi gawat darurat',
}

export default function Emergency() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.emergency().then(setData).catch((err) => setError(err.message))
    document.title = 'Bantuan segera — JejakMental'
  }, [])

  return (
    <div className="wrap" style={{ maxWidth: '860px' }}>
      <p className="section-label" style={{ marginTop: '1rem' }}>Bantuan segera</p>
      <h1>Bila saat ini terasa tidak aman</h1>
      <p className="lead">
        Anda tidak perlu menjelaskan panjang lebar. Cukup sebutkan bahwa Anda
        butuh bantuan sekarang dan di mana Anda berada.
      </p>

      {error && <div className="notice notice-error">{error}</div>}
      {!data && !error && <div className="loading-line" style={{ marginTop: '1.5rem' }} />}

      {data && (
        <>
          <section style={{ marginTop: '1.8rem' }} aria-labelledby="langkah">
            <h2 id="langkah" style={{ fontSize: '1.3rem' }}>Yang bisa dilakukan sekarang</h2>
            <ol className="suggestion-list">
              {data.guidance.map((g) => (
                <li key={g}>{g}</li>
              ))}
              <li>
                Bila Anda sedang bersama seseorang yang berisiko, tetap dampingi
                dan jauhkan benda yang berbahaya bila aman dilakukan.
              </li>
            </ol>
          </section>

          <hr className="rule" />

          <section aria-labelledby="kontak">
            <h2 id="kontak" style={{ fontSize: '1.3rem' }}>Kontak di Kota Palu &amp; nasional</h2>
            <ul className="contact-list">
              {data.contacts.map((c) => (
                <li key={c.id}>
                  <div>
                    <div className="tiny muted" style={{ letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>
                      {KIND_TITLE[c.kind] || 'Kontak'}
                    </div>
                    <h3 style={{ fontSize: '1.15rem', margin: '0.25rem 0 0.15rem' }}>{c.name}</h3>
                    <div className="contact-number">{c.number}</div>
                    {c.dial_hint && <p className="small muted" style={{ margin: '0.2rem 0 0' }}>{c.dial_hint}</p>}
                    <p className="small" style={{ margin: '0.4rem 0 0', maxWidth: '52ch' }}>{c.note}</p>
                    <p className="tiny muted" style={{ margin: '0.35rem 0 0' }}>
                      Jam: {c.hours}
                      {c.alt ? ` · Alternatif: ${c.alt}` : ''}
                    </p>
                  </div>
                  <div className="stack" style={{ minWidth: '180px' }}>
                    <a className="btn btn-primary btn-sm" href={telHref(c.dial || c.number)}>
                      Hubungi sekarang
                    </a>
                    {c.url && (
                      <a className="btn btn-quiet btn-sm" href={c.url} target="_blank" rel="noreferrer noopener">
                        Buka situs
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <p className="tiny muted" style={{ marginTop: '1rem' }}>{data.note}</p>
          </section>
        </>
      )}

      <hr className="rule" />

      <section aria-labelledby="tidak-darurat" className="measure">
        <h2 id="tidak-darurat" style={{ fontSize: '1.3rem' }}>Kalau keadaannya tidak mendesak</h2>
        <p>
          Anda tetap bisa memulai dari layanan biasa: konseling psikolog gratis
          di puskesmas, atau konsultasi daring dari rumah.{' '}
          <Link to="/direktori?free=true">Lihat layanan tanpa biaya</Link>.
        </p>
        <p className="small muted">
          JejakMental tidak memantau pesan secara langsung dan bukan layanan
          darurat. Bila ragu, menghubungi layanan darurat lebih dulu adalah
          pilihan yang wajar.
        </p>
      </section>
    </div>
  )
}
