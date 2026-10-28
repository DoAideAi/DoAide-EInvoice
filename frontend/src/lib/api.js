const BASE = import.meta.env.VITE_API_URL || ''

async function request(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...opts.headers },
    ...opts,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `HTTP ${res.status}`)
  }
  return res
}

export async function searchHSN(query, limit = 20) {
  const res = await request(`/api/hsn/search?q=${encodeURIComponent(query)}&limit=${limit}`)
  return res.json()
}

export async function suggestHSN(description) {
  const res = await request('/api/hsn/suggest', {
    method: 'POST',
    body: JSON.stringify({ description }),
  })
  return res.json()
}

export async function autofillGSTIN(gstin) {
  const res = await request('/api/gstin/autofill', {
    method: 'POST',
    body: JSON.stringify({ gstin }),
  })
  return res.json()
}

export async function generateInvoice(data) {
  const res = await request('/api/invoice/generate', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function downloadInvoicePDF(data) {
  const res = await fetch(`${BASE}/api/invoice/pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('PDF generation failed')
  return res.blob()
}

export async function generateEWay(data) {
  const res = await request('/api/eway/generate', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function uploadBulk(file) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(`${BASE}/api/bulk/upload`, { method: 'POST', body: formData })
  if (!res.ok) throw new Error('Upload failed')
  return res.json()
}

export async function getUsage() {
  const res = await request('/api/usage')
  return res.json()
}
