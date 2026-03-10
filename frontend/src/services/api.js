const API_BASE = import.meta.env.VITE_API_URL || '/api'

export function getToken() {
  return localStorage.getItem('accessToken')
}

export function setToken(token) {
  if (token) localStorage.setItem('accessToken', token)
}

export function clearToken() {
  localStorage.removeItem('accessToken')
}

async function parseResponse(res) {
  const text = await res.text().catch(() => '')
  let body = {}
  try {
    body = text ? JSON.parse(text) : {}
  } catch (e) {
    body = { message: text }
  }
  return { ok: res.ok, status: res.status, body }
}

export async function apiFetch(path, opts = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`

  const headers = new Headers(opts.headers || {})
  // JSON by default
  if (!(opts.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(url, { ...opts, headers })
  const parsed = await parseResponse(res)

  if (!parsed.ok) {
    const err = new Error(parsed.body?.message || 'API error')
    err.status = parsed.status
    err.body = parsed.body
    throw err
  }

  return parsed.body
}

export default apiFetch
