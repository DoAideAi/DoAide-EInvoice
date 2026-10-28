import { useCallback, useState } from 'react'
import Seo from '../components/Seo'
import { ROUTE_META } from '../routeMeta'
import { searchHSN, suggestHSN } from '../lib/api'

export default function HSN() {
  const meta = ROUTE_META['/hsn']
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [aiQuery, setAiQuery] = useState('')
  const [aiResults, setAiResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return
    setLoading(true)
    try {
      const { results: r } = await searchHSN(query, 30)
      setResults(r || [])
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [query])

  const handleAISuggest = useCallback(async () => {
    if (!aiQuery.trim()) return
    setAiLoading(true)
    try {
      const { results: r } = await suggestHSN(aiQuery)
      setAiResults(r || [])
    } catch {
      setAiResults([])
    } finally {
      setAiLoading(false)
    }
  }, [aiQuery])

  return (
    <div>
      <Seo title={meta.title} description={meta.description} path={meta.path} />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">HSN Code Lookup</h1>
        <p className="mt-1 text-sm text-gray-600">Search HSN/SAC codes with descriptions and GST rates.</p>
      </div>

      <div className="space-y-6">
        <div className="card">
          <h3 className="section-title">Search by Code or Description</h3>
          <div className="flex gap-2">
            <input
              className="input flex-1"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Enter HSN code or product name..."
            />
            <button onClick={handleSearch} disabled={loading} className="btn-primary">
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {results.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-left">
                    <th className="px-3 py-2 font-semibold">HSN Code</th>
                    <th className="px-3 py-2 font-semibold">Description</th>
                    <th className="px-3 py-2 font-semibold">Category</th>
                    <th className="px-3 py-2 text-right font-semibold">GST Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={i} className="border-b hover:bg-blue-50">
                      <td className="px-3 py-2 font-mono font-semibold text-brand">{r.code}</td>
                      <td className="px-3 py-2">{r.description}</td>
                      <td className="px-3 py-2 text-gray-500">{r.category || '—'}</td>
                      <td className="px-3 py-2 text-right font-semibold">{r.rate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {results.length === 0 && query && !loading && (
            <p className="mt-3 text-sm text-gray-500">No results found. Try a different search term or use AI suggestions below.</p>
          )}
        </div>

        <div className="card border-2 border-purple-200">
          <h3 className="section-title flex items-center gap-2">
            <span className="rounded bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-700">AI</span>
            Smart HSN Suggestion
          </h3>
          <p className="mb-3 text-sm text-gray-600">Describe your product or service and our AI will suggest the best matching HSN codes.</p>
          <div className="flex gap-2">
            <input
              className="input flex-1"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAISuggest()}
              placeholder="e.g., cotton shirts for men, IT consulting services..."
            />
            <button onClick={handleAISuggest} disabled={aiLoading} className="btn-primary bg-purple-600 hover:bg-purple-700">
              {aiLoading ? 'Thinking...' : 'Suggest'}
            </button>
          </div>

          {aiResults.length > 0 && (
            <div className="mt-4 space-y-2">
              {aiResults.map((r, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border bg-white p-3">
                  <span className="font-mono text-lg font-bold text-purple-600">{r.code}</span>
                  <span className="flex-1 text-sm">{r.description}</span>
                  <span className="rounded bg-purple-50 px-2 py-1 text-sm font-semibold text-purple-700">{r.rate}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
