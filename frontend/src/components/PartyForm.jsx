import { useCallback, useState } from 'react'
import { stateFromGSTIN } from '../lib/states'
import { autofillGSTIN } from '../lib/api'

const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/

export default function PartyForm({ title, party, onChange }) {
  const [gstinError, setGstinError] = useState('')

  const set = useCallback(
    (key, value) => {
      const updated = { ...party, [key]: value }
      if (key === 'gstin') {
        const v = value.toUpperCase()
        updated.gstin = v
        setGstinError(v && !GSTIN_RE.test(v) ? 'Invalid GSTIN format' : '')
        const st = stateFromGSTIN(v)
        if (st) updated.state = st.code
      }
      onChange(updated)
    },
    [party, onChange],
  )

  const handleAutofill = useCallback(async () => {
    if (!party.gstin || !GSTIN_RE.test(party.gstin)) return
    try {
      const { result } = await autofillGSTIN(party.gstin)
      if (result?.state_code) {
        onChange({ ...party, state: result.state_code })
      }
    } catch {}
  }, [party, onChange])

  return (
    <div className="card">
      <h3 className="section-title">{title}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label">GSTIN *</label>
          <div className="flex gap-2">
            <input
              className={`input flex-1 font-mono uppercase ${gstinError ? 'border-red-400' : ''}`}
              value={party.gstin}
              onChange={(e) => set('gstin', e.target.value)}
              placeholder="29ABCDE1234F1Z5"
              maxLength={15}
            />
            <button type="button" onClick={handleAutofill} className="btn-ghost text-sm" title="Auto-detect state">
              Auto
            </button>
          </div>
          {gstinError && <p className="mt-1 text-xs text-red-500">{gstinError}</p>}
        </div>
        <div className="sm:col-span-2">
          <label className="label">Legal Name *</label>
          <input className="input" value={party.legal_name} onChange={(e) => set('legal_name', e.target.value)} placeholder="Business Legal Name" />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Address</label>
          <input className="input" value={party.address} onChange={(e) => set('address', e.target.value)} placeholder="Street address" />
        </div>
        <div>
          <label className="label">City</label>
          <input className="input" value={party.city} onChange={(e) => set('city', e.target.value)} placeholder="City" />
        </div>
        <div>
          <label className="label">Pincode</label>
          <input className="input" value={party.pincode} onChange={(e) => set('pincode', e.target.value)} placeholder="560001" maxLength={6} />
        </div>
        <div>
          <label className="label">State Code</label>
          <input className="input font-mono" value={party.state} onChange={(e) => set('state', e.target.value)} placeholder="29" maxLength={2} />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" value={party.phone} onChange={(e) => set('phone', e.target.value)} placeholder="9876543210" />
        </div>
      </div>
    </div>
  )
}
