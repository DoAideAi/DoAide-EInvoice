import Seo from '../components/Seo'
import { ROUTE_META } from '../routeMeta'

const PLANS = [
  {
    name: 'Free',
    price: '₹0',
    period: 'forever',
    features: ['5 invoices per month', 'E-Invoice JSON generation', 'E-Way Bill JSON', 'HSN code lookup', 'Basic PDF invoice', 'AI HSN suggestions'],
    cta: 'Current Plan',
    ctaClass: 'btn-ghost cursor-default',
    highlight: false,
  },
  {
    name: 'Premium',
    price: '₹299',
    period: '/month',
    features: [
      'Unlimited invoices',
      'Bulk CSV upload',
      'Branded PDF invoices',
      'E-Way Bill integration',
      'Priority AI suggestions',
      'JSON + PDF export',
      'Email support',
    ],
    cta: 'Coming Soon',
    ctaClass: 'btn-primary',
    highlight: true,
  },
]

export default function Pricing() {
  const meta = ROUTE_META['/pricing']

  return (
    <div>
      <Seo title={meta.title} description={meta.description} path={meta.path} />

      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Simple, Transparent Pricing</h1>
        <p className="mt-2 text-gray-600">Start free. Upgrade when you need more.</p>
      </div>

      <div className="mx-auto grid max-w-2xl gap-6 sm:grid-cols-2">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`card flex flex-col ${plan.highlight ? 'ring-2 ring-brand' : ''}`}
          >
            {plan.highlight && (
              <span className="-mt-7 mb-3 self-center rounded-full bg-brand px-3 py-1 text-xs font-bold text-white">
                RECOMMENDED
              </span>
            )}
            <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
            <p className="mt-2 mb-4">
              <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
              <span className="text-sm text-gray-500">{plan.period}</span>
            </p>
            <ul className="mb-6 flex-1 space-y-2">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-0.5 text-emerald-500">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <button className={plan.ctaClass + ' w-full'}>{plan.cta}</button>
          </div>
        ))}
      </div>

      <div className="mt-12 card text-center">
        <h2 className="text-lg font-bold text-gray-900">Need Enterprise Features?</h2>
        <p className="mt-2 text-sm text-gray-600">
          Custom branding, API access, dedicated support, and on-premise deployment.
          Contact us at <a href="mailto:support@doaide.com" className="font-semibold text-brand underline">support@doaide.com</a>
        </p>
      </div>
    </div>
  )
}
