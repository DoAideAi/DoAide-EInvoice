import { useCallback, useState } from 'react'
import Seo from '../components/Seo'
import PartyForm from '../components/PartyForm'
import ItemsTable from '../components/ItemsTable'
import InvoiceResult from '../components/InvoiceResult'
import UsageBadge from '../components/UsageBadge'
import { ROUTE_META } from '../routeMeta'
import { generateInvoice, downloadInvoicePDF } from '../lib/api'
import { today } from '../lib/format'

const EMPTY_PARTY = { gstin: '', legal_name: '', address: '', city: '', state: '', pincode: '', phone: '', email: '' }
const EMPTY_ITEM = { description: '', hsn_code: '', quantity: 1, unit: 'NOS', unit_price: 0, discount: 0, gst_rate: 18 }

export default function Home() {
  const meta = ROUTE_META['/']
  const [seller, setSeller] = useState({ ...EMPTY_PARTY })
  const [buyer, setBuyer] = useState({ ...EMPTY_PARTY })
  const [items, setItems] = useState([{ ...EMPTY_ITEM }])
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [invoiceDate, setInvoiceDate] = useState(today())
  const [isIGST, setIsIGST] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)

  const formData = useCallback(
    () => ({
      invoice_number: invoiceNumber,
      invoice_date: invoiceDate,
      seller,
      buyer,
      items,
      is_igst: isIGST,
    }),
    [invoiceNumber, invoiceDate, seller, buyer, items, isIGST],
  )

  const handleGenerate = useCallback(async () => {
    setError('')
    setResult(null)
    if (!invoiceNumber || !seller.gstin || !seller.legal_name || !buyer.gstin || !buyer.legal_name) {
      setError('Please fill invoice number, seller GSTIN & name, buyer GSTIN & name')
      return
    }
    if (!items.some((it) => it.description && it.unit_price > 0)) {
      setError('Add at least one item with description and price')
      return
    }
    setLoading(true)
    try {
      const res = await generateInvoice(formData())
      if (res.error === 'free_limit_reached') {
        setError(`Free limit reached (${res.limit}/month). Upgrade to Premium for unlimited invoices.`)
        return
      }
      setResult(res.irn_json)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [invoiceNumber, seller, buyer, items, formData])

  const handlePDF = useCallback(async () => {
    setPdfLoading(true)
    try {
      const blob = await downloadInvoicePDF(formData())
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice_${invoiceNumber || 'draft'}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      setError('PDF generation failed: ' + e.message)
    } finally {
      setPdfLoading(false)
    }
  }, [formData, invoiceNumber])

  return (
    <div>
      <Seo title={meta.title} description={meta.description} path={meta.path} />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">E-Invoice Generator</h1>
        <p className="mt-1 text-sm text-gray-600">Generate IRN-compliant e-invoice JSON for the GST e-invoice portal. Free, no login required.</p>
      </div>

      <UsageBadge />

      <div className="space-y-4">
        <div className="card">
          <h3 className="section-title">Invoice Details</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="label">Invoice Number *</label>
              <input className="input" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} placeholder="INV-001" />
            </div>
            <div>
              <label className="label">Invoice Date *</label>
              <input className="input" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} placeholder="DD/MM/YYYY" />
            </div>
            <div className="flex items-end gap-3 pb-1">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" checked={isIGST} onChange={(e) => setIsIGST(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-brand" />
                Inter-state (IGST)
              </label>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <PartyForm title="Seller Details" party={seller} onChange={setSeller} />
          <PartyForm title="Buyer Details" party={buyer} onChange={setBuyer} />
        </div>

        <ItemsTable items={items} onChange={setItems} />

        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}

        <div className="flex flex-wrap gap-3">
          <button onClick={handleGenerate} disabled={loading} className="btn-primary">
            {loading ? 'Generating...' : 'Generate IRN JSON'}
          </button>
          <button onClick={handlePDF} disabled={pdfLoading} className="btn-ghost">
            {pdfLoading ? 'Creating PDF...' : 'Download PDF'}
          </button>
        </div>

        <InvoiceResult data={result} type="e-invoice" />
      </div>
    </div>
  )
}
