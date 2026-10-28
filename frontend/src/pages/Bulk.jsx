import { useCallback, useState } from 'react'
import Seo from '../components/Seo'
import InvoiceResult from '../components/InvoiceResult'
import UsageBadge from '../components/UsageBadge'
import { ROUTE_META } from '../routeMeta'
import { uploadBulk } from '../lib/api'

export default function Bulk() {
  const meta = ROUTE_META['/bulk']
  const [file, setFile] = useState(null)
  const [results, setResults] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleUpload = useCallback(async () => {
    if (!file) {
      setError('Please select a CSV file')
      return
    }
    setError('')
    setResults(null)
    setLoading(true)
    try {
      const res = await uploadBulk(file)
      if (res.error === 'free_limit_reached') {
        setError(`Free limit reached. Upgrade to Premium for bulk upload.`)
        return
      }
      setResults(res.invoices)
    } catch (e) {
      setError('Upload failed: ' + e.message)
    } finally {
      setLoading(false)
    }
  }, [file])

  return (
    <div>
      <Seo title={meta.title} description={meta.description} path={meta.path} />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bulk Invoice Upload</h1>
        <p className="mt-1 text-sm text-gray-600">Upload a CSV file with multiple invoices to generate IRN JSON for all at once.</p>
      </div>

      <UsageBadge />

      <div className="space-y-4">
        <div className="card">
          <h3 className="section-title">Upload CSV</h3>
          <p className="mb-3 text-sm text-gray-600">
            Your CSV must have these columns: invoice_number, invoice_date, seller_gstin, seller_name, buyer_gstin, buyer_name, item_description, hsn_code, quantity, unit_price, gst_rate, is_igst
          </p>
          <a href="/api/bulk/sample" download className="mb-4 inline-block text-sm font-semibold text-brand underline">
            Download sample CSV template
          </a>
          <div className="mt-3">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-xl file:border-0 file:bg-brand file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-hover"
            />
          </div>
        </div>

        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}

        <button onClick={handleUpload} disabled={loading || !file} className="btn-primary">
          {loading ? 'Processing...' : 'Generate All Invoices'}
        </button>

        {results && (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-emerald-700">{results.length} invoice(s) generated successfully</p>
            {results.map((inv, i) => (
              <InvoiceResult key={i} data={inv} type="e-invoice" />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
