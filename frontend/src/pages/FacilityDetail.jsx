import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { costLabel, formatDate, formatShortDate, KIND_LABEL, relativeDay, telHref, waHref, weekdayOf } from '../lib/format'
import { useAuth } from '../lib/auth'
import BookingForm from '../components/BookingForm'

function InfoRow({ label, children }) {
  if (!children) return null
  return (
    <li>
      <span className="k">{label}</span>
      <span>{children}</span>
    </li>
  )
}

export default function FacilityDetail() {
  const { slug } = useParams()
  const { user } = useAuth()
  const [facility, setFacility] = useState(null)
  const [availability, setAvailability] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeSlot, setActiveSlot] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    setActiveSlot(null)
    Promise.all([api.facility(slug), api.availability(slug, 21)])
      .then(([detail, days]) => {
        if (cancelled) return
        setFacility(detail)
        setAvailability(days)
        document.title = `${detail.name} — JejakMental`
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [slug])

  if (loading) {
    return (
      <div className="wrap">
        <div className="loading-line" style={{ marginTop: '2rem' }} />
        <p className="muted small" style={{ marginTop: '1rem' }}>Memuat detail layanan…</p>
      </div>
    )
  }

  if (error || !facility) {
    return (
      <div className="wrap">
        <div className="empty" style={{ marginTop: '2rem' }}>
          <p>{error || 'Layanan tidak ditemukan.'}</p>
          <Link to="/direktori" className="btn btn-quiet btn-sm">Kembali ke direktori</Link>
        </div>
      </div>
    )
  }

  const isFree = facility.cost_min === 0 && facility.cost_max === 0
  const bookableDays = availability
    .map((day) => ({ ...day, slots: day.slots.filter((s) => s.mode === 'bookable') }))
    .filter((d) => d.slots.length > 0)
  const previewDays = availability.filter((d) => d.slots.some((s) => s.mode === 'call_to_book'))
  const hasSlots = availability.length > 0

  const callText = `Halo, saya ingin bertanya jadwal layanan kesehatan jiwa di ${facility.name}.`

  return (
    <div className="wrap">
      <div className="detail-head">
        <div className="breadcrumbs">
          <Link to="/direktori">Direktori</Link> / {facility.name}
        </div>
        <div className="spread">
          <div style={{ maxWidth: '58ch' }}>
            <p className="section-label" style={{ marginBottom: '0.4rem' }}>
              {KIND_LABEL[facility.kind]}
              {facility.district ? ` · ${facility.district}` : ''}
            </p>
            <h1 style={{ fontSize: 'clamp(1.7rem, 3.4vw, 2.6rem)' }}>{facility.name}</h1>
            <p className="lead" style={{ marginTop: '0.6rem' }}>{facility.summary}</p>
            <div className="result-tags" style={{ marginTop: '1rem' }}>
              <span className={`tag ${isFree ? 'tag-free' : 'tag-outline'}`}>{costLabel(facility)}</span>
              {facility.accepts_bpjs && <span className="tag">BPJS</span>}
              {facility.online_available && <span className="tag tag-online">Bisa daring</span>}
              {facility.emergency_24h && <span className="tag tag-urgent">IGD 24 jam</span>}
              {!facility.is_verified && <span className="tag tag-outline">Belum diverifikasi</span>}
            </div>
          </div>

          <div className="stack" style={{ minWidth: '250px' }}>
            {facility.phone ? (
              <a className="btn btn-primary btn-block" href={telHref(facility.phone)}>
                Telepon {facility.phone}
              </a>
            ) : (
              <div className="notice small">
                Nomor telepon layanan ini belum dipublikasikan. Lihat catatan akses di
                bawah atau hubungi Dinas Kesehatan Kota Palu.
              </div>
            )}
            {facility.whatsapp && (
              <a
                className="btn btn-quiet btn-block"
                href={waHref(facility.whatsapp, callText)}
                target="_blank"
                rel="noreferrer noopener"
              >
                Tanya lewat WhatsApp
              </a>
            )}
            {facility.website && (
              <a
                className="btn btn-quiet btn-block"
                href={facility.website}
                target="_blank"
                rel="noreferrer noopener"
              >
                Situs resmi
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="detail-grid">
        <div className="stack-lg">
          <section aria-labelledby="praktis">
            <h2 id="praktis" style={{ fontSize: '1.35rem' }}>Yang perlu diketahui</h2>
            <ul className="info-list">
              <InfoRow label="Alamat">{facility.address}</InfoRow>
              <InfoRow label="Layanan">
                <span className="row" style={{ gap: '0.35rem' }}>
                  {facility.services.map((s) => (
                    <span className="tag" key={s}>{s}</span>
                  ))}
                </span>
              </InfoRow>
              <InfoRow label="Untuk usia">
                {facility.age_groups.join(', ')}
              </InfoRow>
              <InfoRow label="Biaya">
                <strong>{isFree ? 'Gratis' : costLabel(facility)}</strong>
                {facility.cost_note && (
                  <span className="small muted" style={{ display: 'block', marginTop: '0.2rem' }}>
                    {facility.cost_note}
                  </span>
                )}
              </InfoRow>
              <InfoRow label="Jam layanan">{facility.opening_note}</InfoRow>
              {facility.online_note && <InfoRow label="Layanan daring">{facility.online_note}</InfoRow>}
              {facility.access_note && <InfoRow label="Catatan akses">{facility.access_note}</InfoRow>}
            </ul>
          </section>

          <section aria-labelledby="jadwal">
            <div className="spread">
              <h2 id="jadwal" style={{ fontSize: '1.35rem' }}>Jadwal 3 minggu ke depan</h2>
              <span className="tiny muted">
                {facility.reviewed_on ? `Data ${formatDate(facility.reviewed_on)}` : ''}
              </span>
            </div>

            {!hasSlots && (
              <p className="small muted">
                Jadwal praktik belum dipublikasikan oleh layanan ini. Silakan
                hubungi langsung untuk menanyakan waktu yang tersedia.
              </p>
            )}

            {bookableDays.length > 0 && (
              <div className="card" style={{ marginTop: '0.8rem' }}>
                <h3 style={{ fontSize: '1rem', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
                  Ajukan janji lewat JejakMental
                </h3>
                <p className="small muted" style={{ marginTop: '0.2rem' }}>
                  Slot bertanda putus-putus adalah jadwal contoh untuk
                  mendemokan alur pengajuan. Tim JejakMental akan menghubungi
                  Anda untuk konfirmasi; kepastian akhir tetap dari layanan.
                </p>
                <div style={{ marginTop: '0.9rem' }}>
                  {bookableDays.slice(0, 4).map((day) => (
                    <div key={day.date} className="day-group" style={{ paddingBottom: '0.6rem' }}>
                      <span className="day-name">
                        {formatShortDate(day.date)}{' '}
                        <span className="muted" style={{ fontWeight: 400 }}>
                          {relativeDay(day.date)}
                        </span>
                      </span>
                      <div>
                        {day.slots.map((slot) => {
                          const full = slot.remaining === 0
                          return (
                            <button
                              type="button"
                              key={slot.id}
                              className={`slot-pill is-demo${full ? ' is-full' : ''}`}
                              disabled={full}
                              onClick={() => setActiveSlot({ slot, date: day.date })}
                              style={{ font: 'inherit', fontSize: '0.88rem', cursor: full ? 'not-allowed' : 'pointer' }}
                            >
                              {slot.start_time}
                              <span className="slot-tag">
                                {full ? 'penuh' : `${slot.remaining} tempat`}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {previewDays.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
                  Jam pratinjau — konfirmasi lewat fasilitas
                </h3>
                <table className="slot-table" style={{ marginTop: '0.5rem' }}>
                  <thead>
                    <tr>
                      <th scope="col">Hari</th>
                      <th scope="col">Jam</th>
                      <th scope="col">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewDays.slice(0, 6).map((day) => (
                      <tr key={day.date}>
                        <td className="nowrap">
                          {weekdayOf(day.date)}
                          <span className="tiny muted" style={{ display: 'block' }}>
                            {formatShortDate(day.date)}
                          </span>
                        </td>
                        <td>
                          {day.slots
                            .filter((s) => s.mode === 'call_to_book')
                            .map((s) => `${s.start_time}–${s.end_time}`)
                            .join(', ')}
                        </td>
                        <td className="small muted">
                          {day.slots.find((s) => s.mode === 'call_to_book')?.label || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="tiny muted" style={{ marginTop: '0.6rem' }}>
                  Jam ini diambil dari informasi publik layanan. Ketersediaan
                  dokter dan perubahan jadwal hanya bisa dipastikan oleh fasilitas.
                </p>
              </div>
            )}
          </section>

          {activeSlot && (
            <BookingForm
              facility={facility}
              slot={activeSlot.slot}
              date={activeSlot.date}
              isLoggedIn={Boolean(user)}
              onClose={() => setActiveSlot(null)}
            />
          )}
        </div>

        <aside className="stack" style={{ position: 'sticky', top: '5.5rem' }}>
          <div className="card">
            <p className="section-label">Sumber data</p>
            <p className="small">
              Informasi di halaman ini disusun dari sumber publik lembaga terkait.
              Bila ada yang keliru, mohon beri tahu kami agar diperbaiki.
            </p>
            {facility.source_url && (
              <a
                className="btn btn-quiet btn-sm btn-block"
                href={facility.source_url}
                target="_blank"
                rel="noreferrer noopener"
                style={{ marginTop: '0.7rem' }}
              >
                Buka sumber publik
              </a>
            )}
            <Link to="/tentang" className="btn btn-plain btn-sm" style={{ marginTop: '0.6rem' }}>
              Bagaimana data ini diperiksa
            </Link>
          </div>

          <div className="card panel panel-note">
            <p className="section-label" style={{ marginBottom: '0.35rem' }}>Bila terasa berat</p>
            <p className="small">
              Anda boleh berhenti kapan saja. Bila muncul pikiran untuk menyakiti
              diri, hubungi layanan darurat di{' '}
              <Link to="/bantuan">halaman bantuan segera</Link>.
            </p>
          </div>

          <div>
            <Link to="/direktori" className="btn btn-plain btn-sm">← Semua layanan</Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
