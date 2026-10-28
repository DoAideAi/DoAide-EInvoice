import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getUsage } from '../lib/api'

export default function UsageBadge() {
  const [usage, setUsage] = useState(null)

  useEffect(() => {
    getUsage().then(setUsage).catch(() => {})
  }, [])

  if (!usage) return null

  const pct = Math.round((usage.count / usage.limit) * 100)
  const atLimit = usage.count >= usage.limit

  return (
    <div className={`mb-4 flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm ${atLimit ? 'bg-amber-50 text-amber-800' : 'bg-blue-50 text-blue-800'}`}>
      <div className="flex-1">
        <span className="font-semibold">{usage.count}/{usage.limit}</span> free invoices used this month
        <div className="mt-1 h-1.5 w-full max-w-[200px] rounded-full bg-gray-200">
          <div className={`h-full rounded-full ${atLimit ? 'bg-amber-500' : 'bg-brand'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
        </div>
      </div>
      {atLimit && (
        <Link to="/pricing" className="btn-primary text-xs">
          Upgrade
        </Link>
      )}
    </div>
  )
}
