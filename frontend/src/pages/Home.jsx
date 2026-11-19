import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import { costLabel, formatShortDate, KIND_LABEL } from '../lib/format'

const SORTS = [
  { value: 'relevance', label: 'Paling terjangkau lebih dulu' },
  { value: 'available', label: 'Jadwal terdekat' },
  { value: 'name', label: 'Nama A–Z' },
]

export default function Home() {
  const [facilities, setFacilities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [contact, setContact] = useState(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([api.facilities({ sort: 'relevance' }), api.emergency()])
      .then(([list, emergency]) => {
        if (cancelled) return
        setFacilities(list.items)
        setContact(emergency.contacts[0])
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  const picks = useMemo(() => {
    const featured = []
    const seen = new Set()
    for (const item of facilities) {
      const urgent = item.cost_min === 0 ? 'gratis' : item.emergency_24h ? 'igd' : null
      if (urgent && !seen.has(urgent)) {
        featured.push(item)
        seen.add(urgent)
      }
      if (featured.length === 2) break
    }
    const clinic = facilities.find((f) => f.online_available)
    if (clinic && !featured.includes(clinic)) featured.push(clinic)
    return featured.slice(0, 3)
  }, [facilities])

  return (
    <div className="wrap">
      <section className="hero">
        <div>
          <p className="section-label">Kota Palu · Sulawesi Tengah</p>
          <h1>
            Mencari bantuan untuk <em>pikiran sendiri</em> seharusnya tidak
            perlu berbelit.
          </h1>
          <p className="lead">
            JejakMental mengumpulkan layanan kesehatan jiwa di Kota Palu —
            puskesmas dengan psikolog gratis, rumah sakit, klinik swasta — beserta
            biaya, jam layanan, dan sumber datanya. Semuanya boleh dibaca tanpa
            membuat akun.
          </p>
          <div className="hero-actions">
            <Link to="/direktori?free=true" className="btn btn-primary">
              Lihat layanan gratis
            </Link>
            <Link to="/direktori" className="btn btn-quiet">
              Jelajahi semua layanan
            </Link>
          </div>
          <p className="small muted" style={{ marginTop: '1rem', maxWidth: '52ch' }}>
            Tidak yakin harus mulai dari mana?{' '}
            <Link to="/skrining">Coba skrining lima pertanyaan</Link> — tanpa
            diagnosis, tanpa akun, hasilnya hanya untuk Anda.
          </p>
        </div>

        <div className="stack">
          <div className="card">
            <p className="section-label" style={{ marginBottom: '1rem' }}>
              Empat langkah, tanpa drama
            </p>
            <ol className="hero-steps">
              <li>
                <span className="step-num">1</span>
                <span>
                  <strong>Kenali pilihan.</strong> Saring berdasarkan biaya,
                  jarak, atau apakah bisa daring.
                </span>
              </li>
              <li>
                <span className="step-num">2</span>
                <span>
                  <strong>Baca detailnya.</strong> Siapa yang melayani, berapa
                  biayanya, dan apa saja persyaratannya.
                </span>
              </li>
              <li>
                <span className="step-num">3</span>
                <span>
                  <strong>Pilih cara menghubungi.</strong> Telepon, WhatsApp,
                  atau ajukan janji lewat JejakMental.
                </span>
              </li>
              <li>
                <span className="step-num">4</span>
                <span>
                  <strong>Boleh berubah pikiran.</strong> Tidak ada tagihan
                  mendadak atau pesan pengingat terus-menerus.
                </span>
              </li>
            </ol>
          </div>
        </div>
      </section>

      {contact && (
        <section aria-labelledby="bantuan-cepat" style={{ marginTop: '2rem' }}>
          <div className="callbar">
            <div>
              <h2 id="bantuan-cepat" style={{ color: 'inherit', fontSize: '1.25rem', marginBottom: '0.25rem' }}>
                Sedang dalam krisis?
              </h2>
              <p style={{ margin: 0, maxWidth: '52ch' }}>
                {contact.name} menerima panggilan {contact.hours}. Bila nyawa
                terancam, hubungi layanan darurat lebih dulu.
              </p>
            </div>
            <div className="row">
              <a className="btn" href={`tel:${contact.dial}`}>
                Hubungi {contact.number}
              </a>
              <Link className="btn" to="/bantuan">
                Semua kontak darurat
              </Link>
            </div>
          </div>
        </section>
      )}

      <hr className="rule" />

      <section aria-labelledby="pilihan">
        <div className="spread">
          <div>
            <p className="section-label">Pilihan awal</p>
            <h2 id="pilihan">Tempat yang sering jadi langkah pertama</h2>
          </div>
          <Link to="/direktori" className="btn btn-quiet btn-sm">
            Semua layanan ({facilities.length})
          </Link>
        </div>

        {error && <div className="notice notice-error" style={{ marginTop: '1rem' }}>{error}</div>}
        {loading && (
          <div style={{ marginTop: '1.2rem' }}>
            <div className="loading-line" />
            <div className="skeleton-row" />
            <div className="skeleton-row" />
          </div>
        )}

        <ul className="result-list" style={{ marginTop: '1.2rem' }}>
          {picks.map((f) => {
            const isFree = f.cost_min === 0 && f.cost_max === 0
            return (
              <li className="result" key={f.id}>
                <Link to={`/direktori/${f.slug}`} className="result-link">
                  <div className="result-top">
                    <div>
                      <h3 className="result-title">{f.name}</h3>
                      <div className="result-meta">
                        {KIND_LABEL[f.kind]} · {f.district}
                      </div>
                    </div>
                    {f.next_available && (
                      <span className="result-next">
                        {formatShortDate(f.next_available)}
                      </span>
                    )}
                  </div>
                  <p className="result-desc">{f.summary}</p>
                  <div className="result-tags">
                    <span className={`tag ${isFree ? 'tag-free' : ''}`}>{costLabel(f)}</span>
                    {f.services.slice(0, 2).map((s) => (
                      <span className="tag" key={s}>{s}</span>
                    ))}
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </section>

      <hr className="rule" />

      <section aria-labelledby="cara-kerja" className="measure">
        <p className="section-label">Tentang data</p>
        <h2 id="cara-kerja">Kami hanya menulis yang bisa diperiksa</h2>
        <p>
          Setiap entri mencantumkan sumber publiknya. Bila biaya atau jam layanan
          belum dipublikasikan resmi, bidang itu dikosongkan — bukan ditebak.
          Tanggal peninjauan terakhir tertera di halaman direktori, dan Anda bisa
          memberi tahu kami bila ada yang sudah berubah.
        </p>
        <p>
          <Link to="/tentang">Baca cara kami menyusun data →</Link>
        </p>
      </section>
    </div>
  )
}
