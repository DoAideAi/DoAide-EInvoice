import { useCallback, useEffect, useRef, useState } from 'react'
import { searchHSN } from '../lib/api'
import { formatINR } from '../lib/format'

const EMPTY_ITEM = { description: '', hsn_code: '', quantity: 1, unit: 'NOS', unit_price: 0, discount: 0, gst_rate: 18 }

function HSNDropdown({ query, onSelect }) {
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }
    const t = setTimeout(async () => {
      try {
        const { results: r } = await searchHSN(query, 8)
        setResults(r || [])
        setOpen(true)
      } catch {}
    }, 300)
    return () => clearTimeout(t)
  }, [query])

  if (!open || !results.length) return null

  return (
    <div className="absolute z-20 mt-1 max-h-48 w-72 overflow-y-auto rounded-lg border bg-white shadow-lg">
      {results.map((r) => (
        <button
          key={r.code}
          type="button"
          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-blue-50"
          onClick={() => {
            onSelect(r)
            setOpen(false)
          }}
        >
          <span className="font-mono font-semibold text-brand">{r.code}</span>
          <span className="flex-1 truncate text-gray-600">{r.description}</span>
          <span className="text-xs text-gray-400">{r.rate}%</span>
        </button>
      ))}
    </div>
  )
}

export default function ItemsTable({ items, onChange }) {
  const addItem = useCallback(() => onChange([...items, { ...EMPTY_ITEM }]), [items, onChange])

  const removeItem = useCallback(
    (idx) => {
      if (items.length <= 1) return
      onChange(items.filter((_, i) => i !== idx))
    },
    [items, onChange],
  )

  const updateItem = useCallback(
    (idx, key, value) => {
      const updated = items.map((it, i) => (i === idx ? { ...it, [key]: value } : it))
      onChange(updated)
    },
    [items, onChange],
  )

  const handleHSNSelect = useCallback(
    (idx, hsn) => {
      const updated = items.map((it, i) => (i === idx ? { ...it, hsn_code: hsn.code, gst_rate: hsn.rate ?? it.gst_rate } : it))
      onChange(updated)
    },
    [items, onChange],
  )

  const totalTaxable = items.reduce((s, it) => s + it.quantity * it.unit_price - it.discount, 0)

  return (
    <div className="card">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="section-title mb-0">Line Items</h3>
        <button type="button" onClick={addItem} className="btn-ghost text-sm">
          + Add Item
        </button>
      </div>
      <div className="space-y-4">
        {items.map((item, idx) => {
          const taxable = item.quantity * item.unit_price - item.discount
          return (
            <div key={idx} className="rounded-xl border border-gray-200 bg-gray-50 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-500">Item {idx + 1}</span>
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem(idx)} className="text-sm text-red-500 hover:text-red-700">
                    Remove
                  </button>
                )}
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="label">Description</label>
                  <input className="input" value={item.description} onChange={(e) => updateItem(idx, 'description', e.target.value)} placeholder="Product/Service" />
                </div>
                <div className="relative">
                  <label className="label">HSN Code</label>
                  <input
                    className="input font-mono"
                    value={item.hsn_code}
                    onChange={(e) => updateItem(idx, 'hsn_code', e.target.value)}
                    placeholder="Search HSN"
                  />
                  <HSNDropdown query={item.hsn_code} onSelect={(hsn) => handleHSNSelect(idx, hsn)} />
                </div>
                <div>
                  <label className="label">Qty</label>
                  <input className="input" type="number" min={0} step="any" value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', +e.target.value)} />
                </div>
                <div>
                  <label className="label">Unit Price (₹)</label>
                  <input className="input" type="number" min={0} step="any" value={item.unit_price} onChange={(e) => updateItem(idx, 'unit_price', +e.target.value)} />
                </div>
                <div>
                  <label className="label">GST %</label>
                  <select className="input" value={item.gst_rate} onChange={(e) => updateItem(idx, 'gst_rate', +e.target.value)}>
                    <option value={0}>0%</option>
                    <option value={5}>5%</option>
                    <option value={12}>12%</option>
                    <option value={18}>18%</option>
                    <option value={28}>28%</option>
                  </select>
                </div>
                <div>
                  <label className="label">Discount (₹)</label>
                  <input className="input" type="number" min={0} step="any" value={item.discount} onChange={(e) => updateItem(idx, 'discount', +e.target.value)} />
                </div>
                <div>
                  <label className="label">Unit</label>
                  <select className="input" value={item.unit} onChange={(e) => updateItem(idx, 'unit', e.target.value)}>
                    {['NOS', 'KGS', 'MTR', 'LTR', 'PCS', 'SET', 'BOX', 'BAG', 'SQM', 'SQF'].map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <p className="pb-3 text-sm font-semibold text-gray-700">Taxable: {formatINR(taxable)}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <p className="mt-3 text-right text-sm font-bold text-gray-700">Total Taxable: {formatINR(totalTaxable)}</p>
    </div>
  )
}
