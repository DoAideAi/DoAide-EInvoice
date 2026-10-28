import { lazy, Suspense } from 'react'
import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/Layout'
import Seo from './components/Seo'
import Home from './pages/Home'

const EWay = lazy(() => import('./pages/EWay'))
const HSN = lazy(() => import('./pages/HSN'))
const Bulk = lazy(() => import('./pages/Bulk'))
const Pricing = lazy(() => import('./pages/Pricing'))

function NotFound() {
  return (
    <div className="py-16 text-center">
      <Seo title="Page not found — DoAide E-Invoice" description="This page does not exist." path="/404" />
      <h1 className="mb-4 text-xl font-bold">Page not found</h1>
      <Link to="/" className="btn-primary">
        Go Home
      </Link>
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="eway" element={<EWay />} />
              <Route path="hsn" element={<HSN />} />
              <Route path="bulk" element={<Bulk />} />
              <Route path="pricing" element={<Pricing />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </HelmetProvider>
    </ErrorBoundary>
  )
}
