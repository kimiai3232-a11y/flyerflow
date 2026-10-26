'use client'

interface StructuredDataProps {
  data: Record<string, unknown>
}

export function StructuredData({ data }: StructuredDataProps) {
  const scriptContent = JSON.stringify(data)
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `{"@context":"https://schema.org",${scriptContent.slice(1)}`
      }}
    />
  )
}

// WebSite schema
export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'FlyerFlow',
    url: 'https://flyerflow.ca',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://flyerflow.ca/?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

// Organization schema
export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'FlyerFlow',
    url: 'https://flyerflow.ca',
    logo: 'https://flyerflow.ca/logo.png',
    sameAs: [
      'https://twitter.com/flyerflow',
      'https://facebook.com/flyerflow',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-800-FLYERFLOW',
      contactType: 'customer service',
      availableLanguage: ['English', 'French'],
    },
  }
}

// Store schema for a retail location
export function storeSchema(store: {
  id: string
  name: string
  address: string
  city: string
  province: string
  postalCode: string
  latitude: number
  longitude: number
  phone: string | null
  chain: { name: string; url: string }
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Store',
    '@id': `https://flyerflow.ca/stores/${store.id}`,
    name: store.name,
    address: {
      '@type': 'PostalAddress',
      streetAddress: store.address,
      addressLocality: store.city,
      addressRegion: store.province,
      postalCode: store.postalCode,
      addressCountry: 'CA',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: store.latitude,
      longitude: store.longitude,
    },
    telephone: store.phone,
    url: `https://flyerflow.ca/stores/${store.id}`,
    parentOrganization: {
      '@type': 'Organization',
      name: store.chain.name,
      url: store.chain.url,
    },
  }
}

// Product schema for a sale item
export function productSchema(item: {
  id: string
  name: string
  description: string | null
  brand: string | null
  regularPrice: number | null
  salePrice: number
  currency: string
  validFrom: string
  validTo: string
  imageUrl: string | null
  productUrl: string | null
  store: {
    id: string
    name: string
    address: string
    city: string
    province: string
    postalCode: string
  }
  chain: { name: string; url: string }
}) {
  const offers = {
    '@type': 'AggregateOffer',
    priceCurrency: item.currency,
    lowPrice: item.salePrice / 100,
    highPrice: item.regularPrice ? item.regularPrice / 100 : item.salePrice / 100,
    availability: 'https://schema.org/InStock',
    validFrom: item.validFrom,
    validThrough: item.validTo,
    seller: {
      '@type': 'Organization',
      name: item.chain.name,
      url: item.chain.url,
    },
    offeredBy: {
      '@type': 'Store',
      name: item.store.name,
      address: {
        '@type': 'PostalAddress',
        streetAddress: item.store.address,
        addressLocality: item.store.city,
        addressRegion: item.store.province,
        postalCode: item.store.postalCode,
        addressCountry: 'CA',
      },
    },
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `https://flyerflow.ca/products/${item.id}`,
    name: item.name,
    description: item.description,
    brand: item.brand ? { '@type': 'Brand', name: item.brand } : undefined,
    image: item.imageUrl,
    url: item.productUrl,
    offers,
  }
}

// BreadcrumbList schema
export function breadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}