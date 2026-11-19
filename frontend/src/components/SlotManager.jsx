import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { dayName } from '../lib/format'

const MODE_LABEL = {
  bookable: 'Bisa diajukan lewat web (slot contoh)',
  call_to_book: 'Hanya pratinjau — pasien menghubungi fasilitas',
}

const EMPTY = {
  weekday: 0,
  start_time: '09:00',
  end_time: '11:00',
  label: '',
  capacity: 1,
  mode: 'call_to_book',
}

function toForm(slot) {
  return {
    weekday: slot.weekday,
    start_time: slot.start_time,
    end_time: slot.end_time,
    label: slot.label || '',
    capacity: slot.capacity,
    mode: slot.mode,
  }
}

export default function SlotManager({ facility, onClose }) {
  const [slots, setSlots] = useState(null)
  const [form, setForm] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    api
      .adminSlots(facility.id)
      .then((data) => !cancelled && setSlots(data))
      .catch((err) => !cancelled && setError(err.message))
    return () => {
      cancelled = true
    }
  }, [facility.id])

  function startCreate() {
    setEditingId('new')
    setForm({ ...EMPTY })
  }

  function startEdit(slot) {
    setEditingId(slot.id)
    setForm(toForm(slot))
  }

  async function save() {
    setBusy(true)
    setError('')
    const body = {
      weekday: Number(form.weekday),
      start_time: form.start_time,
      end_time: form.end_time,
      label: form.label.trim() || null,
      capacity: Number(form.capacity) || 1,
      mode: form.mode,
    }
    try {
      if (editingId === 'new') {
        const created = await api.adminCreateSlot(facility.id, body)
        setSlots((prev) => [...(prev || []), created])
      } else {
        const updated = await api.adminUpdateSlot(editingId, body)
        setSlots((prev) => prev.map((s) => (s.id === editingId ? updated : s)))
      }
      setEditingId(null)
      setForm(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function remove(slot) {
    if (!window.confirm('Hapus jadwal ini? Pengajuan yang sudah ada tetap tercatat.')) return
    try {
      await api.adminDeleteSlot(slot.id)
      setSlots((prev) => prev.filter((s) => s.id !== slot.id))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div style={{ marginTop: '0.8rem', maxWidth: '640px' }}>
      <div className="spread">
        <strong className="small">Jadwal praktik — {facility.name}</strong>
        <button type="button" className="btn btn-plain btn-sm" onClick={onClose}>Tutup</button>
      </div>

      {error && <div className="notice notice-error" style={{ marginTop: '0.6rem' }}>{error}</div>}
      {slots === null && !error && <p className="small muted">Memuat jadwal…</p>}

      {slots && slots.length === 0 && (
        <p className="small muted" style={{ marginTop: '0.5rem' }}>Belum ada jadwal tercatat.</p>
      )}

      {slots && slots.length > 0 && (
        <table className="data-table" style={{ marginTop: '0.6rem' }}>
          <thead>
            <tr>
              <th scope="col">Hari</th>
              <th scope="col">Jam</th>
              <th scope="col">Keterangan</th>
              <th scope="col">Kuota</th>
              <th scope="col">Mode</th>
              <th scope="col">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {slots.map((s) => (
              <tr key={s.id}>
                <td className="small">{dayName(s.weekday)}</td>
                <td className="small nowrap">{s.start_time}–{s.end_time}</td>
                <td className="small">{s.label || '—'}</td>
                <td className="small">{s.taken}/{s.capacity}</td>
                <td className="tiny">{MODE_LABEL[s.mode]}</td>
                <td>
                  <div className="row" style={{ gap: '0.3rem' }}>
                    <button type="button" className="btn btn-quiet btn-sm" onClick={() => startEdit(s)}>Ubah</button>
                    <button type="button" className="btn btn-quiet btn-sm" onClick={() => remove(s)}>Hapus</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editingId === null && (
        <button type="button" className="btn btn-quiet btn-sm" style={{ marginTop: '0.7rem' }} onClick={startCreate}>
          Tambah jadwal
        </button>
      )}

      {form && (
        <div className="form-grid" style={{ marginTop: '0.8rem', paddingTop: '0.8rem', borderTop: '1px solid var(--line)' }}>
          <label className="field">
            <span className="field-label">Hari</span>
            <select
              className="select"
              style={{ width: '100%' }}
              value={form.weekday}
              onChange={(e) => setForm((f) => ({ ...f, weekday: e.target.value }))}
            >
              {[0, 1, 2, 3, 4, 5, 6].map((d) => (
                <option key={d} value={d}>{dayName(d)}</option>
              ))}
            </select>
          </label>
          <div className="row" style={{ gap: '0.8rem' }}>
            <label className="field" style={{ flex: '1 1 140px' }}>
              <span className="field-label">Jam mulai</span>
              <input
                className="input"
                type="time"
                value={form.start_time}
                onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))}
                required
              />
            </label>
            <label className="field" style={{ flex: '1 1 140px' }}>
              <span className="field-label">Jam selesai</span>
              <input
                className="input"
                type="time"
                value={form.end_time}
                onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))}
                required
              />
            </label>
          </div>
          <label className="field">
            <span className="field-label">Keterangan</span>
            <input
              className="input"
              maxLength={120}
              placeholder="Misalnya: Klinik Jiwa, hanya pasien dewasa"
              value={form.label}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
            />
          </label>
          <label className="field">
            <span className="field-label">Kuota per sesi</span>
            <input
              className="input"
              type="number"
              min={1}
              max={50}
              value={form.capacity}
              onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
            />
          </label>
          <label className="field">
            <span className="field-label">Cara memesan</span>
            <select
              className="select"
              style={{ width: '100%' }}
              value={form.mode}
              onChange={(e) => setForm((f) => ({ ...f, mode: e.target.value }))}
            >
              <option value="call_to_book">{MODE_LABEL.call_to_book}</option>
              <option value="bookable">{MODE_LABEL.bookable}</option>
            </select>
            <span className="field-hint">
              Pakai “hanya pratinjau” untuk jadwal resmi yang dipublikasikan.
              Mode “slot contoh” hanya untuk demonstrasi alur pengajuan.
            </span>
          </label>
          <div className="row">
            <button type="button" className="btn btn-primary btn-sm" onClick={save} disabled={busy}>
              {busy ? 'Menyimpan…' : 'Simpan jadwal'}
            </button>
            <button
              type="button"
              className="btn btn-quiet btn-sm"
              onClick={() => { setForm(null); setEditingId(null) }}
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
