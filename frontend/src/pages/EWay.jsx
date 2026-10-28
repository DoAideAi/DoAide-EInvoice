import { useCallback, useState } from 'react'
import Seo from '../components/Seo'
import PartyForm from '../components/PartyForm'
import ItemsTable from '../components/ItemsTable'
import InvoiceResult from '../components/InvoiceResult'
import UsageBadge from '../components/UsageBadge'
import { ROUTE_META } from '../routeMeta'
import { generateEWay } from '../lib/api'
import { today } from '../lib/format'

const EMPTY_PARTY = { gstin: '', legal_name: '', address: '', city: '', state: '', pincode: '', phone: '', email: '' }
const EMPTY_ITEM = { description: '', hsn_code: '', quantity: 1, unit: 'NOS', unit_price: 0, discount: 0, gst_rate: 18 }

export default function EWay() {
  const meta = ROUTE_META['/eway']
  const [seller, setSeller] = useState({ ...EMPTY_PARTY })
  const [buyer, setBuyer] = useState({ ...EMPTY_PARTY })
  const [items, setItems] = useState([{ ...EMPTY_ITEM }])
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [invoiceDate, setInvoiceDate] = useState(today())
  const [isIGST, setIsIGST] = useState(false)
  const [transport, setTransport] = useState({
    transporter_id: '',
    transporter_name: '',
    transport_mode: '1',
    vehicle_number: '',
    vehicle_type: 'R',
    distance_km: 0,
    transport_doc_number: '',
    transport_doc_date: '',
  })
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const setT = useCallback((key, val) => setTransport((p) => ({ ...p, [key]: val })), [])

  const handleGenerate = useCallback(async () => {
    setError('')
    setResult(null)
    if (!invoiceNumber || !seller.gstin || !seller.legal_name || !buyer.gstin || !buyer.legal_name) {
      setError('Please fill invoice number, seller & buyer details')
      return
    }
    setLoading(true)
    try {
      const res = await generateEWay({
        invoice_number: invoiceNumber,
        invoice_date: invoiceDate,
        seller,
        buyer,
        items,
        is_igst: isIGST,
        ...transport,
        distance_km: +transport.distance_km,
      })
      if (res.error === 'free_limit_reached') {
        setError(`Free limit reached. Upgrade to Premium for unlimited usage.`)
        return
      }
      setResult(res.eway_json)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [invoiceNumber, invoiceDate, seller, buyer, items, isIGST, transport])

  return (
    <div>
      <Seo title={meta.title} description={meta.description} path={meta.path} />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">E-Way Bill Generator</h1>
        <p className="mt-1 text-sm text-gray-600">Generate e-way bill data for goods transport under GST.</p>
      </div>

      <UsageBadge />

      <div className="space-y-4">
        <div className="card">
          <h3 className="section-title">Document Details</h3>
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
          <PartyForm title="From (Consignor)" party={seller} onChange={setSeller} />
          <PartyForm title="To (Consignee)" party={buyer} onChange={setBuyer} />
        </div>

        <ItemsTable items={items} onChange={setItems} />

        <div className="card">
          <h3 className="section-title">Transport Details</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="label">Transporter ID (GSTIN)</label>
              <input className="input font-mono uppercase" value={transport.transporter_id} onChange={(e) => setT('transporter_id', e.target.value.toUpperCase())} />
            </div>
            <div>
              <label className="label">Transporter Name</label>
              <input className="input" value={transport.transporter_name} onChange={(e) => setT('transporter_name', e.target.value)} />
            </div>
            <div>
              <label className="label">Transport Mode</label>
              <select className="input" value={transport.transport_mode} onChange={(e) => setT('transport_mode', e.target.value)}>
                <option value="1">Road</option>
                <option value="2">Rail</option>
                <option value="3">Air</option>
                <option value="4">Ship</option>
              </select>
            </div>
            <div>
              <label className="label">Vehicle Number</label>
              <input className="input font-mono uppercase" value={transport.vehicle_number} onChange={(e) => setT('vehicle_number', e.target.value.toUpperCase())} placeholder="KA01AB1234" />
            </div>
            <div>
              <label className="label">Vehicle Type</label>
              <select className="input" value={transport.vehicle_type} onChange={(e) => setT('vehicle_type', e.target.value)}>
                <option value="R">Regular</option>
                <option value="O">Over Dimensional Cargo</option>
              </select>
            </div>
            <div>
              <label className="label">Distance (km)</label>
              <input className="input" type="number" min={0} value={transport.distance_km} onChange={(e) => setT('distance_km', e.target.value)} />
            </div>
            <div>
              <label className="label">Transport Doc Number</label>
              <input className="input" value={transport.transport_doc_number} onChange={(e) => setT('transport_doc_number', e.target.value)} />
            </div>
            <div>
              <label className="label">Transport Doc Date</label>
              <input className="input" value={transport.transport_doc_date} onChange={(e) => setT('transport_doc_date', e.target.value)} placeholder="DD/MM/YYYY" />
            </div>
          </div>
        </div>

        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}

        <button onClick={handleGenerate} disabled={loading} className="btn-primary">
          {loading ? 'Generating...' : 'Generate E-Way Bill JSON'}
        </button>

        <InvoiceResult data={result} type="e-way-bill" />
      </div>
    </div>
  )
}
