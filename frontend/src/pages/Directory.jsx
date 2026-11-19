import { Link, useSearchParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import { formatDate, KIND_OPTIONS } from '../lib/format'
import FacilityCard, { FacilitySkeleton } from '../components/FacilityCard'

const SORTS = [
  { value: 'relevance', label: 'Paling terjangkau lebih dulu' },
  { value: 'available', label: 'Jadwal terdekat' },
  { value: 'name', label: 'Nama A–Z' },
]

const QUICK = [
  { key: 'free', label: 'Gratis' },
  { key: 'bpjs', label: 'Terima BPJS' },
  { key: 'online', label: 'Bisa daring' },
  { key: 'emergency', label: 'IGD 24 jam' },
]

export default function Directory() {
  const [params, setParams] = useSearchParams()
  const [data, setData] = useState(null)
  const [districts, setDistricts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState(params.get('q') || '')

  const kind = params.get('kind') || ''
  const district = params.get('district') || ''
  const sort = params.get('sort') || 'relevance'
  const active = QUICK.filter((q) => params.get(q.key) === 'true').map((q) => q.key)

  useEffect(() => {
    api.districts().then(setDistricts).catch(() => {})
  }, [])

  const query = useMemo(() => {
    const base = { kind: kind || undefined, district: district || undefined, sort }
    active.forEach((key) => {
      base[key] = true
    })
    return base
  }, [kind, district, sort, active.join(',')])

  useEffect(() => {
    const controller = new AbortController()
    let cancelled = false
    setLoading(true)
    setError('')

    const timer = setTimeout(() => {
      api
        .facilities({ ...query, q: search.trim() || undefined }, controller.signal)
        .then((res) => {
          if (!cancelled) setData(res)
        })
        .catch((err) => {
          if (!cancelled && err.name !== 'AbortError') setError(err.message)
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }, 220)

    return () => {
      cancelled = true
      clearTimeout(timer)
      controller.abort()
    }
  }, [query, search])

  function update(patch) {
    const next = new URLSearchParams(params)
    Object.entries(patch).forEach(([key, value]) => {
      if (value === '' || value === false || value === null) next.delete(key)
      else next.set(key, value)
    })
    setParams(next, { replace: true })
  }

  function toggle(key) {
    update({ [key]: active.includes(key) ? null : 'true' })
  }

  function clearAll() {
    setSearch('')
    setParams(new URLSearchParams(), { replace: true })
  }

  const hasFilter = search.trim() || kind || district || active.length > 0

  return (
    <div className="wrap">
      <div style={{ paddingTop: '1rem' }}>
        <p className="section-label">Direktori</p>
        <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.4rem)' }}>
          Layanan kesehatan jiwa di Kota Palu
        </h1>
        <p className="lead">
          {data?.meta
            ? `${data.meta.total} layanan tercatat. Data ditinjau terakhir ${formatDate(data.meta.reviewed_on)}.`
            : 'Memuat direktori…'}
        </p>
      </div>

      <form
        className="filters"
        role="search"
        aria-label="Saring direktori"
        onSubmit={(e) => e.preventDefault()}
        style={{ marginTop: '1.5rem' }}
      >
        <div className="search-row">
          <label className="sr-only" htmlFor="q">
            Cari layanan
          </label>
          <input
            id="q"
            className="input"
            type="search"
            placeholder="Cari nama, layanan, atau kecamatan…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <label className="select-inline">
            <span>Urutkan</span>
            <select className="select" value={sort} onChange={(e) => update({ sort: e.target.value })}>
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="filter-chips" role="group" aria-label="Penyaring cepat">
          {QUICK.map((q) => (
            <button
              key={q.key}
              type="button"
              className="chip"
              aria-pressed={active.includes(q.key)}
              onClick={() => toggle(q.key)}
            >
              {q.label}
            </button>
          ))}
          <span aria-hidden="true" style={{ width: '0.4rem' }} />
          <label className="select-inline">
            <span className="sr-only">Jenis layanan</span>
            <select className="select" value={kind} onChange={(e) => update({ kind: e.target.value })}>
              <option value="">Semua jenis layanan</option>
              {KIND_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
          <label className="select-inline">
            <span className="sr-only">Kecamatan</span>
            <select className="select" value={district} onChange={(e) => update({ district: e.target.value })}>
              <option value="">Semua kecamatan</option>
              {districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </label>
          {hasFilter && (
            <button type="button" className="btn btn-plain btn-sm" onClick={clearAll}>
              Hapus penyaring
            </button>
          )}
        </div>
      </form>

      <div className="results-head" aria-live="polite">
        <span>
          {loading ? 'Mencari…' : `${data?.items.length ?? 0} hasil`}
          {search.trim() ? ` untuk “${search.trim()}”` : ''}
        </span>
        {data?.meta && <span>Ditulis hanya dari sumber publik</span>}
      </div>

      {error && <div className="notice notice-error">{error}</div>}

      {loading && !data && <FacilitySkeleton />}

      {!loading && data?.items.length === 0 && (
        <div className="empty">
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', marginBottom: '0.4rem' }}>
            Belum ada yang cocok dengan penyaring ini.
          </p>
          <p className="small muted" style={{ marginBottom: '0.8rem' }}>
            Coba hapus satu penyaring, atau cari dengan kata yang lebih umum
            seperti “puskesmas” atau “konseling”.
          </p>
          <button type="button" className="btn btn-quiet btn-sm" onClick={clearAll}>
            Tampilkan semua layanan
          </button>
        </div>
      )}

      {data && data.items.length > 0 && (
        <ul className="result-list" style={{ opacity: loading ? 0.6 : 1, transition: 'opacity 120ms ease' }}>
          {data.items.map((f) => (
            <FacilityCard key={f.id} facility={f} />
          ))}
        </ul>
      )}

      <p className="small muted" style={{ marginTop: '1.5rem', maxWidth: '62ch' }}>
        Konseling psikolog di beberapa puskesmas Kota Palu diselenggarakan gratis
        melalui program Dinas Kesehatan. Untuk layanan yang belum mencantumkan
        tarif, biaya perlu ditanyakan langsung — kami tidak menebak angka.{' '}
        <Link to="/tentang">Pelajari sumber data kami</Link>.
      </p>
    </div>
  )
}
