const BASE = import.meta.env.VITE_API_URL || '/api'

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

async function request(path, { method = 'GET', body, signal } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    signal,
  })

  if (res.status === 204) return null

  const text = await res.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }

  if (!res.ok) {
    let message = 'Ada kendala saat menghubungi server.'
    if (data && typeof data === 'object' && data.detail) {
      if (typeof data.detail === 'string') message = data.detail
      else if (Array.isArray(data.detail) && data.detail[0]?.msg) {
        message = 'Data yang dikirim belum lengkap atau formatnya tidak sesuai.'
      }
    } else if (typeof data === 'string' && data && data.length < 200) {
      message = data
    }
    throw new ApiError(message, res.status)
  }
  return data
}

function qs(params = {}) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '' || value === false) return
    if (Array.isArray(value)) value.forEach((v) => search.append(key, v))
    else search.append(key, value)
  })
  const str = search.toString()
  return str ? `?${str}` : ''
}

export const api = {
  health: () => request('/health'),

  facilities: (params, signal) => request(`/facilities${qs(params)}`, { signal }),
  districts: () => request('/facilities/districts'),
  facility: (slug) => request(`/facilities/${slug}`),
  availability: (slug, days = 14) => request(`/facilities/${slug}/availability?days=${days}`),

  emergency: () => request('/emergency'),

  screeningForm: () => request('/screening/form'),
  submitScreening: (body) => request('/screening', { method: 'POST', body }),
  myScreenings: () => request('/screening/mine'),
  deleteScreening: (id) => request(`/screening/${id}`, { method: 'DELETE' }),

  login: (body) => request('/auth/login', { method: 'POST', body }),
  register: (body) => request('/auth/register', { method: 'POST', body }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request('/auth/me'),
  updateMe: (body) => request('/auth/me', { method: 'PATCH', body }),
  deleteMe: () => request('/auth/me', { method: 'DELETE' }),

  bookings: () => request('/bookings'),
  createBooking: (body) => request('/bookings', { method: 'POST', body }),
  cancelBooking: (id) => request(`/bookings/${id}/cancel`, { method: 'POST' }),

  adminStats: () => request('/admin/stats'),
  adminFacilities: () => request('/admin/facilities'),
  adminUpdateFacility: (id, body) => request(`/admin/facilities/${id}`, { method: 'PATCH', body }),
  adminBookings: () => request('/admin/bookings'),
  adminCancelBooking: (id) => request(`/admin/bookings/${id}/cancel`, { method: 'POST' }),
  adminSlots: (facilityId) => request(`/admin/facilities/${facilityId}/slots`),
  adminCreateSlot: (facilityId, body) => request(`/admin/facilities/${facilityId}/slots`, { method: 'POST', body }),
  adminUpdateSlot: (id, body) => request(`/admin/slots/${id}`, { method: 'PATCH', body }),
  adminDeleteSlot: (id) => request(`/admin/slots/${id}`, { method: 'DELETE' }),
}
