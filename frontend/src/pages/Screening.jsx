import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'

export default function Screening() {
  const { user } = useAuth()
  const [form, setForm] = useState(null)
  const [answers, setAnswers] = useState({})
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [started, setStarted] = useState(false)
  const [save, setSave] = useState(false)

  useEffect(() => {
    api
      .screeningForm()
      .then(setForm)
      .catch((err) => setError(err.message))
  }, [])

  const answered = useMemo(
    () => (form ? form.questions.filter((q) => answers[q.position] !== undefined).length : 0),
    [answers, form],
  )

  const complete = form ? answered === form.questions.length : false
  const progress = form ? Math.round((answered / form.questions.length) * 100) : 0

  async function submit() {
    setSubmitting(true)
    setError('')
    try {
      const data = await api.submitScreening({
        instrument: form.instrument,
        answers,
        save: save && Boolean(user),
      })
      setResult(data)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  function startOver() {
    setAnswers({})
    setResult(null)
    setStarted(true)
  }

  if (error && !form) {
    return (
      <div className="wrap">
        <div className="notice notice-error" style={{ marginTop: '2rem' }}>{error}</div>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="wrap">
        <div className="loading-line" style={{ marginTop: '2rem' }} />
        <p className="small muted" style={{ marginTop: '1rem' }}>Menyiapkan pertanyaan…</p>
      </div>
    )
  }

  if (result) {
    return (
      <div className="wrap screen-shell">
        <p className="section-label" style={{ marginTop: '1rem' }}>Hasil skrining</p>
        <div className="spread">
          <div>
            <div className="result-score">
              {result.score} <small>dari 25</small>
            </div>
            <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', marginTop: '0.7rem' }}>
              {result.headline}
            </h1>
          </div>
        </div>
        <p className="lead">{result.meaning}</p>

        <hr className="rule" />

        <section aria-labelledby="saran">
          <h2 id="saran" style={{ fontSize: '1.3rem' }}>Langkah kecil yang mungkin membantu</h2>
          <ul className="suggestion-list">
            {result.suggestions.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </section>

        <div className="notice notice-warn" style={{ marginTop: '1.5rem' }}>
          <h3>Ingat</h3>
          <p>{result.disclaimer}</p>
        </div>

        <div className="row" style={{ marginTop: '1.5rem' }}>
          <Link to="/direktori?free=true" className="btn btn-primary">Lihat layanan gratis</Link>
          <Link to="/bantuan" className="btn btn-quiet">Bantuan segera</Link>
          <button type="button" className="btn btn-plain" onClick={startOver}>
            Isi ulang
          </button>
        </div>

        {result.saved && (
          <p className="small muted" style={{ marginTop: '1rem' }}>
            Hasil ini tersimpan di akun Anda dan hanya bisa dilihat oleh Anda.{' '}
            <Link to="/akun">Buka akun saya</Link>
          </p>
        )}
        {!result.saved && (
          <p className="small muted" style={{ marginTop: '1rem' }}>
            Hasil ini tidak disimpan di server. Bila ingin menyimpannya,{' '}
            <Link to="/masuk">masuk</Link> lalu isi ulang dengan opsi “simpan hasil”.
          </p>
        )}
      </div>
    )
  }

  if (!started) {
    return (
      <div className="wrap screen-shell">
        <p className="section-label" style={{ marginTop: '1rem' }}>Skrining singkat</p>
        <h1 style={{ fontSize: 'clamp(1.7rem, 3.2vw, 2.4rem)' }}>{form.title}</h1>
        <p className="lead">{form.intro}</p>

        <div className="card panel panel-safe" style={{ marginTop: '1.2rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
            Sebelum mulai
          </h2>
          <ul className="suggestion-list small">
            <li>{form.timeframe} Jawab dengan perasaan Anda sendiri, bukan yang seharusnya.</li>
            <li>Lima pertanyaan, sekitar dua menit. Bisa berhenti kapan saja.</li>
            <li>Anda tidak perlu akun. Bila tidak masuk, jawaban tidak disimpan di server.</li>
            <li>{form.disclaimer}</li>
          </ul>
        </div>

        <div className="row" style={{ marginTop: '1.3rem' }}>
          <button type="button" className="btn btn-primary" onClick={() => setStarted(true)}>
            Mulai — lima pertanyaan
          </button>
          <Link to="/direktori" className="btn btn-quiet">Lewati, langsung ke direktori</Link>
        </div>
        <p className="tiny muted" style={{ marginTop: '1rem' }}>
          Instrumen: {form.source}. Bukan alat diagnosis dan tidak dipakai untuk
          menentukan pengobatan.
        </p>
      </div>
    )
  }

  return (
    <div className="wrap screen-shell">
      <div className="spread" style={{ marginTop: '1rem' }}>
        <div>
          <p className="section-label" style={{ marginBottom: '0.2rem' }}>Skrining singkat</p>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '0' }}>{form.title}</h1>
        </div>
        <span className="small muted">
          {answered} dari {form.questions.length} terjawab
        </span>
      </div>
      <p className="small muted" style={{ marginTop: '0.3rem' }}>{form.timeframe}</p>
      <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-label="Kemajuan pengisian">
        <span style={{ width: `${progress}%` }} />
      </div>

      <form onSubmit={(e) => e.preventDefault()}>
        {form.questions.map((q, index) => (
          <fieldset className="question" key={q.id} style={{ border: 0, margin: 0, paddingLeft: 0, paddingRight: 0 }}>
            <legend className="sr-only">Pertanyaan {index + 1}</legend>
            <h3>
              <span className="muted tiny" style={{ marginRight: '0.4rem' }}>
                {index + 1}.
              </span>
              {q.text}
            </h3>
            <div className="options">
              {form.options.map((option) => {
                const checked = answers[q.position] === option.value
                return (
                  <label className={`option${checked ? ' is-selected' : ''}`} key={option.value}>
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      checked={checked}
                      onChange={() => setAnswers((prev) => ({ ...prev, [q.position]: option.value }))}
                    />
                    <span>{option.label}</span>
                  </label>
                )
              })}
            </div>
          </fieldset>
        ))}

        {user && (
          <label className="checkbox" style={{ marginTop: '1.2rem' }}>
            <input type="checkbox" checked={save} onChange={(e) => setSave(e.target.checked)} />
            <span>
              Simpan hasil di akun saya agar bisa dilihat kembali. Tanpa centang,
              jawaban hanya dipakai untuk menampilkan hasil saat ini.
            </span>
          </label>
        )}

        {error && <div className="notice notice-error" style={{ marginTop: '1rem' }}>{error}</div>}

        <div className="row" style={{ marginTop: '1.3rem' }}>
          <button type="submit" className="btn btn-primary" disabled={!complete || submitting} onClick={submit}>
            {submitting ? 'Menghitung…' : 'Lihat hasil'}
          </button>
          <button type="button" className="btn btn-plain" onClick={() => setStarted(false)}>
            Berhenti dulu
          </button>
        </div>
        {!complete && (
          <p className="tiny muted" style={{ marginTop: '0.6rem' }}>
            Tombol aktif setelah semua pertanyaan terjawab.
          </p>
        )}
      </form>
    </div>
  )
}
