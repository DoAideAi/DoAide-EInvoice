import { formatINR } from '../lib/format'

export default function InvoiceResult({ data, type = 'e-invoice' }) {
  if (!data) return null

  const copyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2)).catch(() => {})
  }

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${type}_${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const vals = type === 'e-invoice' ? data.ValDtls : data
  const totalInv = vals?.TotInvVal ?? vals?.totInvValue ?? 0

  return (
    <div className="card mt-4 border-2 border-emerald-200 bg-emerald-50">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-bold text-emerald-800">
          {type === 'e-invoice' ? 'IRN JSON Generated' : 'E-Way Bill JSON Generated'}
        </h3>
        <div className="flex gap-2">
          <button type="button" onClick={copyJSON} className="btn-ghost text-sm">
            Copy
          </button>
          <button type="button" onClick={downloadJSON} className="btn-success text-sm">
            Download JSON
          </button>
        </div>
      </div>
      {totalInv > 0 && <p className="mb-3 text-2xl font-bold text-emerald-700">{formatINR(totalInv)}</p>}
      <details className="group">
        <summary className="cursor-pointer text-sm font-medium text-emerald-700">View JSON</summary>
        <pre className="mt-2 max-h-96 overflow-auto rounded-lg bg-gray-900 p-4 text-xs text-green-400">{JSON.stringify(data, null, 2)}</pre>
      </details>
    </div>
  )
}
