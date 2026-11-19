const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']
const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

export const KIND_LABEL = {
  hospital: 'Rumah sakit umum',
  psychiatric_hospital: 'Rumah sakit jiwa',
  clinic: 'Klinik',
  puskesmas: 'Puskesmas',
  practice: 'Praktik mandiri',
  nonprofit: 'Layanan komunitas',
}

export const KIND_OPTIONS = [
  { value: 'puskesmas', label: 'Puskesmas (banyak yang gratis)' },
  { value: 'hospital', label: 'Rumah sakit umum' },
  { value: 'psychiatric_hospital', label: 'Rumah sakit jiwa' },
  { value: 'clinic', label: 'Klinik' },
  { value: 'nonprofit', label: 'Layanan komunitas' },
]

export function dayName(index) {
  return DAYS[index] ?? ''
}

export function weekdayOf(value) {
  if (!value) return ''
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return ''
  return DAYS[(date.getDay() + 6) % 7]
}

export function formatDate(value, { withDay = true, withYear = true } = {}) {
  if (!value) return ''
  const date = typeof value === 'string' ? new Date(`${value}T00:00:00`) : value
  if (Number.isNaN(date.getTime())) return ''
  const day = withDay ? `${DAYS[(date.getDay() + 6) % 7]}, ` : ''
  const year = withYear ? ` ${date.getFullYear()}` : ''
  return `${day}${date.getDate()} ${MONTHS[date.getMonth()]}${year}`
}

export function formatShortDate(value) {
  if (!value) return ''
  const date = typeof value === 'string' ? new Date(`${value}T00:00:00`) : value
  if (Number.isNaN(date.getTime())) return ''
  return `${DAYS[(date.getDay() + 6) % 7].slice(0, 3)}, ${date.getDate()} ${MONTHS[date.getMonth()].slice(0, 3)}`
}

export function relativeDay(value) {
  if (!value) return ''
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const date = new Date(`${value}T00:00:00`)
  const diff = Math.round((date - today) / 86400000)
  if (diff === 0) return 'hari ini'
  if (diff === 1) return 'besok'
  if (diff > 1 && diff < 7) return `${diff} hari lagi`
  return ''
}

export function costLabel(facility) {
  if (facility.cost_min === 0 && facility.cost_max === 0) return 'Gratis'
  if (facility.cost_min && facility.cost_max && facility.cost_min !== facility.cost_max) {
    return `Rp${facility.cost_min.toLocaleString('id-ID')}–${facility.cost_max.toLocaleString('id-ID')}`
  }
  if (facility.cost_min) return `mulai Rp${facility.cost_min.toLocaleString('id-ID')}`
  return 'Biaya belum dipastikan'
}

export function telHref(number) {
  if (!number) return undefined
  const digits = number.replace(/[^\d+]/g, '')
  return `tel:${digits}`
}

export function waHref(number, text) {
  if (!number) return undefined
  const digits = number.replace(/\D/g, '').replace(/^0/, '62')
  const msg = text ? `?text=${encodeURIComponent(text)}` : ''
  return `https://wa.me/${digits}${msg}`
}
