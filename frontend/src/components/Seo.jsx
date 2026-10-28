import { Helmet } from 'react-helmet-async'

export const SITE_URL = 'https://einvoice.doaide.com'

export default function Seo({ title, description, path = '/' }) {
  const url = `${SITE_URL}${path}`
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="DoAide E-Invoice" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  )
}

export const webAppLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'DoAide E-Invoice',
  url: SITE_URL,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Any (web browser)',
  inLanguage: 'en-IN',
  description: 'Free GST e-invoice and e-way bill generator for Indian businesses. IRN-compliant JSON, PDF export, bulk upload.',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
  publisher: { '@type': 'Organization', name: 'DoAide', url: 'https://doaide.com' },
}
