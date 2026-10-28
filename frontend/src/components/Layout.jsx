import { Suspense } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'

const NAV = [
  { to: '/', label: 'E-Invoice', icon: '🧾', end: true },
  { to: '/eway', label: 'E-Way Bill', icon: '🚚' },
  { to: '/hsn', label: 'HSN Lookup', icon: '🔍' },
  { to: '/bulk', label: 'Bulk Upload', icon: '📤' },
  { to: '/pricing', label: 'Pricing', icon: '💎' },
]

function Loader() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
    </div>
  )
}

export default function Layout() {
  return (
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col">
      <header className="no-print sticky top-0 z-30 bg-brand-dark text-white shadow">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-lg font-bold">eI</span>
            <span className="leading-tight">
              <span className="block text-lg font-bold">DoAide E-Invoice</span>
              <span className="block text-xs text-blue-200">GST E-Invoice & E-Way Bill</span>
            </span>
          </Link>
        </div>
        <nav className="hidden border-t border-white/10 px-2 sm:flex">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `px-4 py-2 text-sm font-medium ${isActive ? 'border-b-2 border-white text-white' : 'text-blue-200 hover:text-white'}`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="flex-1 px-4 pb-24 pt-4 sm:pb-8">
        <Suspense fallback={<Loader />}>
          <Outlet />
        </Suspense>
      </main>

      <footer className="no-print px-4 pb-24 text-center text-xs text-gray-500 sm:pb-6">
        <a
          href="https://doaide.com"
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 font-semibold text-brand-dark shadow-sm ring-1 ring-black/5"
        >
          <span className="h-2 w-2 rounded-full bg-brand-light" />
          A DoAide Product
        </a>
      </footer>

      <nav className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)] sm:hidden">
        <div className="mx-auto grid max-w-4xl grid-cols-5">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `flex h-14 flex-col items-center justify-center gap-0.5 text-[10px] font-semibold ${isActive ? 'bg-blue-50 text-brand' : 'text-gray-500'}`
              }
            >
              <span className="text-xl leading-none" aria-hidden>
                {n.icon}
              </span>
              {n.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
