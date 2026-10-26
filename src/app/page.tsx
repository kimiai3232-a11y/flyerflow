'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { StructuredData, websiteSchema, organizationSchema, productSchema } from '@/lib/structured-data'

interface Chain {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  storeCount: number
  itemCount?: number
}

interface SaleItem {
  id: string
  name: string
  description: string | null
  category: string | null
  brand: string | null
  regularPrice: number | null
  salePrice: number
  unit: string | null
  quantity: number | null
  imageUrl: string | null
  productUrl: string | null
  validFrom: string
  validTo: string
  isFeatured: boolean
  flyer: {
    id: string
    title: string
    validFrom: string
    validTo: string
    flyerUrl: string
    chain: {
      id: string
      name: string
      slug: string
      logoUrl: string | null
    }
  }
}

interface Store {
  id: string
  chain: {
    id: string
    name: string
    slug: string
    logoUrl: string | null
  }
  name: string
  address: string
  city: string
  province: string
  postalCode: string
  latitude: number
  longitude: number
  phone: string | null
  distance: number
}

interface Location {
  lat: number
  lng: number
  city: string
  province: string
}

export default function Home() {
  const [location, setLocation] = useState<Location | null>(null)
  const [chains, setChains] = useState<Chain[]>([])
  const [sales, setSales] = useState<SaleItem[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [selectedChains, setSelectedChains] = useState<string[]>([])
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [radius, setRadius] = useState(25)
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [manualLocation, setManualLocation] = useState('')
  const [geolocationError, setGeolocationError] = useState<string | null>(null)
  const [manualLocationError, setManualLocationError] = useState<string | null>(null)

  // Refs for focus management
  const mainContentRef = useRef<HTMLElement>(null)
  const locationModalRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  // Fetch chains on mount
  useEffect(() => {
    fetchChains()
  }, [])

  // Fetch sales when location or filters change
  useEffect(() => {
    if (location) {
      fetchSales()
      fetchStores()
    }
  }, [location, selectedChains, categoryFilter, searchQuery, radius])

  // Focus management for location modal
  useEffect(() => {
    if (showLocationModal) {
      previousActiveElement.current = document.activeElement as HTMLElement
      // Focus the first button in the modal
      setTimeout(() => {
        locationModalRef.current?.querySelector('button')?.focus()
      }, 0)
      // Trap focus
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      previousActiveElement.current?.focus()
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [showLocationModal])

  // Handle escape key for modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showLocationModal) {
        setShowLocationModal(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [showLocationModal])

  const fetchChains = async () => {
    try {
      const res = await fetch('/api/chains')
      const data = await res.json()
      setChains(data.chains)
      setSelectedChains(data.chains.map((c: Chain) => c.slug))
    } catch (error) {
      console.error('Failed to fetch chains:', error)
    }
  }

  const fetchSales = async () => {
    if (!location) return
    setLoading(true)
    try {
      const params = new URLSearchParams({
        lat: location.lat.toString(),
        lng: location.lng.toString(),
        radius: radius.toString(),
      })
      if (selectedChains.length > 0) {
        params.set('chain', selectedChains[0])
      }
      if (categoryFilter) params.set('category', categoryFilter)
      if (searchQuery) params.set('q', searchQuery)

      const res = await fetch(`/api/sales?${params}`)
      const data = await res.json()
      setSales(data.items)
    } catch (error) {
      console.error('Failed to fetch sales:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStores = async () => {
    if (!location) return
    try {
      const params = new URLSearchParams({
        lat: location.lat.toString(),
        lng: location.lng.toString(),
        radius: radius.toString(),
      })
      if (selectedChains.length > 0) {
        params.set('chain', selectedChains[0])
      }
      const res = await fetch(`/api/stores?${params}`)
      const data = await res.json()
      setStores(data.stores)
    } catch (error) {
      console.error('Failed to fetch stores:', error)
    }
  }

  const handleGeolocation = useCallback(() => {
    setGeolocationError(null)
    if (!navigator.geolocation) {
      setGeolocationError('Geolocation is not supported by your browser')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          city: 'Toronto',
          province: 'ON',
        })
        setShowLocationModal(false)
      },
      (error) => {
        console.error('Geolocation error:', error)
        let message = 'Unable to get your location. Please enter it manually.'
        if (error.code === error.PERMISSION_DENIED) {
          message = 'Location permission denied. Please enable location access or enter manually.'
        } else if (error.code === error.TIMEOUT) {
          message = 'Location request timed out. Please try again or enter manually.'
        }
        setGeolocationError(message)
      }
    )
  }, [])

  const handleManualLocation = async () => {
    setManualLocationError(null)
    if (!manualLocation.trim()) {
      setManualLocationError('Please enter a location')
      return
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualLocation + ', Toronto, ON')}&limit=1`
      )
      const data = await res.json()
      if (data.length > 0) {
        setLocation({
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          city: 'Toronto',
          province: 'ON',
        })
        setShowLocationModal(false)
      } else {
        setManualLocationError('Location not found. Try a postal code or address.')
      }
    } catch (error) {
      console.error('Geocoding error:', error)
      setManualLocationError('Failed to find location. Please try again.')
    }
  }

  const formatPrice = (cents: number) => {
    return '$' + (cents / 100).toFixed(2)
  }

  const getDiscountPercent = (regular: number | null, sale: number) => {
    if (!regular || regular <= sale) return 0
    return Math.round(((regular - sale) / regular) * 100)
  }

  const categories = [
    'All',
    'Electronics',
    'Groceries',
    'Home & Garden',
    'Clothing',
    'Health & Beauty',
    'Sports & Outdoors',
    'Automotive',
    'Toys & Games',
    'Office & School',
    'Pet Supplies',
  ]

  const handleChainToggle = (chainSlug: string) => {
    setSelectedChains(prev =>
      prev.includes(chainSlug)
        ? prev.filter(s => s !== chainSlug)
        : [...prev, chainSlug]
    )
  }

  const clearAllChains = () => setSelectedChains([])
  const selectAllChains = () => setSelectedChains(chains.map(c => c.slug))

  if (!location) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main id="main-content" className="max-w-2xl mx-auto px-4 py-16" role="main">
          {/* Header */}
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              FlyerFlow
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Find weekly sales at big-chain stores near you
            </p>
          </header>

          {/* Location Modal */}
          <section
            ref={locationModalRef}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8"
            aria-labelledby="location-heading"
            role="dialog"
            aria-modal="true"
          >
            <div className="text-center mb-6">
              <div className="mx-auto h-12 w-12 text-blue-600 dark:text-blue-400" aria-hidden="true">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 id="location-heading" className="mt-4 text-2xl font-semibold text-gray-900 dark:text-white">
                Allow Location Access
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                We'll show you stores and sales near you
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleGeolocation}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
                aria-describedby="geolocation-desc"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Use My Current Location
              </button>
              <p id="geolocation-desc" className="sr-only">
                Uses browser geolocation API to find your current position
              </p>

              {geolocationError && (
                <div
                  role="alert"
                  className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm"
                >
                  {geolocationError}
                </div>
              )}

              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or enter manually</span>
                </div>
              </div>

              <div>
                <label htmlFor="manual-location" className="sr-only">
                  Enter address, postal code, or neighborhood
                </label>
                <input
                  id="manual-location"
                  type="text"
                  value={manualLocation}
                  onChange={(e) => {
                    setManualLocation(e.target.value)
                    setManualLocationError(null)
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleManualLocation()}
                  placeholder="Enter address, postal code, or neighborhood"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none"
                  autoComplete="off"
                  aria-describedby={manualLocationError ? 'manual-error' : undefined}
                />
                {manualLocationError && (
                  <p id="manual-error" role="alert" className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {manualLocationError}
                  </p>
                )}
                <button
                  onClick={handleManualLocation}
                  className="mt-3 w-full px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:bg-gray-50 dark:focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
                >
                  Search Location
                </button>
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              We currently cover <strong>Toronto, ON</strong> with 4 major chains:
              <span className="ml-2 flex flex-wrap gap-1 justify-center" aria-label="Available chains">
                {chains.map(chain => (
                  <span
                    key={chain.slug}
                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded"
                  >
                    {chain.name}
                  </span>
                ))}
              </span>
            </p>
          </section>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40" role="banner">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-2xl font-bold text-blue-600 dark:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 rounded"
                aria-label="FlyerFlow home"
              >
                FlyerFlow
              </Link>
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <span>{location.city}, {location.province}</span>
                <button
                  onClick={() => setShowLocationModal(true)}
                  className="ml-2 text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                >
                  Change
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <label htmlFor="search-input" className="sr-only">Search deals</label>
                <input
                  id="search-input"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search deals..."
                  className="w-64 px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <button
                onClick={() => setShowLocationModal(true)}
                className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Change location"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <nav className="border-t border-gray-200 dark:border-gray-700 px-4 py-3" aria-label="Filters">
            <div className="flex flex-wrap items-center gap-4">
              {/* Chain Filter */}
              <fieldset className="flex items-center gap-2">
                <legend className="text-sm font-medium text-gray-700 dark:text-gray-200">Stores:</legend>
                <div className="flex flex-wrap gap-1" role="group" aria-label="Store selection">
                  {chains.map(chain => (
                    <label
                      key={chain.slug}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm cursor-pointer transition-colors ${
                        selectedChains.includes(chain.slug)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedChains.includes(chain.slug)}
                        onChange={() => handleChainToggle(chain.slug)}
                        className="sr-only"
                        aria-label={chain.name}
                      />
                      {chain.logoUrl && (
                        <img src={chain.logoUrl} alt="" className="h-4 w-4 rounded" aria-hidden="true" />
                      )}
                      <span>{chain.name}</span>
                      <span className="px-1.5 py-0.5 text-xs rounded-full bg-white/20 dark:bg-white/10"
                            aria-label={`${chain.itemCount || 0} items`}>
                        {chain.itemCount || 0}
                      </span>
                    </label>
                  ))}
                </div>
                {selectedChains.length > 0 && selectedChains.length < chains.length && (
                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={selectAllChains}
                      type="button"
                      className="px-2 py-1 text-xs text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                    >
                      All
                    </button>
                    <button
                      onClick={clearAllChains}
                      type="button"
                      className="px-2 py-1 text-xs text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                    >
                      None
                    </button>
                  </div>
                )}
              </fieldset>

              <div className="w-full md:w-auto flex-1">
                <label htmlFor="category-filter" className="sr-only">Filter by category</label>
                <select
                  id="category-filter"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full md:w-48 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none"
                >
                  <option value="">All Categories</option>
                  {categories.slice(1).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <fieldset className="flex items-center gap-2">
                <legend className="text-sm text-gray-600 dark:text-gray-300">Radius:</legend>
                <select
                  value={radius}
                  onChange={(e) => setRadius(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none"
                  aria-label="Search radius"
                >
                  <option value={5}>5 km</option>
                  <option value={10}>10 km</option>
                  <option value={25}>25 km</option>
                  <option value={50}>50 km</option>
                </select>
              </fieldset>

              <div className="flex gap-2 ml-auto" role="group" aria-label="View mode">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900`}
                  aria-pressed={viewMode === 'list'}
                  aria-label="List view"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'map'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900`}
                  aria-pressed={viewMode === 'map'}
                  aria-label="Map view"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-5.447A1 1 0 013 12.382V5.25A1 1 0 013.894 4.159L12 10.364l8.106-6.205A1 1 0 0121 5.25v7.132a1 1 0 01-.894.993L12 18.364l-8.106 6.205a1 1 0 01-1.894-.993V10.364z" />
                  </svg>
                </button>
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* Structured Data */}
      <StructuredData data={websiteSchema()} />
      <StructuredData data={organizationSchema()} />
      {sales.length > 0 && (
        <>
          {sales.map(item => (
            <StructuredData
              key={item.id}
              data={productSchema({
                id: item.id,
                name: item.name,
                description: item.description,
                brand: item.brand,
                regularPrice: item.regularPrice,
                salePrice: item.salePrice,
                currency: 'CAD',
                validFrom: item.validFrom,
                validTo: item.validTo,
                imageUrl: item.imageUrl,
                productUrl: item.productUrl,
                store: {
                  id: item.flyer.chain.id,
                  name: item.flyer.chain.name,
                  address: '',
                  city: location?.city || 'Toronto',
                  province: location?.province || 'ON',
                  postalCode: '',
                },
                chain: {
                  name: item.flyer.chain.name,
                  url: item.flyer.chain.logoUrl ? `https://${new URL(item.flyer.chain.logoUrl).hostname}` : 'https://flyerflow.ca',
                },
              })}
            />
          ))}
        </>
      )}

      {/* Main Content */}
      <main
        ref={mainContentRef}
        id="main-content"
        className="max-w-7xl mx-auto px-4 py-6"
        role="main"
      >
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {loading ? 'Loading sales...' : `${sales.length} deals found`}
        </div>

        {viewMode === 'list' ? (
          <SaleListView
            sales={sales}
            loading={loading}
            formatPrice={formatPrice}
            getDiscountPercent={getDiscountPercent}
          />
        ) : (
          <MapView
            location={location}
            stores={stores}
            chains={chains}
            selectedChains={selectedChains}
          />
        )}
      </main>

      {/* Location Modal */}
      {showLocationModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            ref={locationModalRef}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 id="modal-title" className="text-xl font-semibold text-gray-900 dark:text-white">
                Change Location
              </h2>
              <button
                onClick={() => setShowLocationModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1"
                aria-label="Close location dialog"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <button
              onClick={handleGeolocation}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors mb-4"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Use My Current Location
            </button>

            {geolocationError && (
              <div
                role="alert"
                className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm"
              >
                {geolocationError}
              </div>
            )}

            <div className="relative mb-4" aria-hidden="true">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or enter manually</span>
              </div>
            </div>

            <div>
              <label htmlFor="manual-location-modal" className="sr-only">
                Enter address, postal code, or neighborhood
              </label>
              <input
                id="manual-location-modal"
                type="text"
                value={manualLocation}
                onChange={(e) => {
                  setManualLocation(e.target.value)
                  setManualLocationError(null)
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleManualLocation()}
                placeholder="Address, postal code, or neighborhood"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none mb-3"
                autoComplete="off"
                aria-describedby={manualLocationError ? 'modal-manual-error' : undefined}
              />
              {manualLocationError && (
                <p id="modal-manual-error" role="alert" className="mb-3 text-sm text-red-600 dark:text-red-400">
                  {manualLocationError}
                </p>
              )}
              <button
                onClick={handleManualLocation}
                className="w-full px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:bg-gray-50 dark:focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
              >
                Search Location
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6 mt-auto" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center md:text-left">
              &copy; 2026 FlyerFlow. All rights reserved.
            </p>
            <nav className="flex flex-wrap items-center justify-center gap-4" aria-label="Legal links">
              <Link href="/terms" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
                Terms
              </Link>
              <span className="text-gray-400" aria-hidden="true">|</span>
              <Link href="/privacy" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
                Privacy
              </Link>
              <span className="text-gray-400" aria-hidden="true">|</span>
              <Link href="/affiliate-disclosure" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
                Affiliate Disclosure
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}

function SaleListView({ sales, loading, formatPrice, getDiscountPercent }: {
  sales: SaleItem[]
  loading: boolean
  formatPrice: (cents: number) => string
  getDiscountPercent: (regular: number | null, sale: number) => number
}) {
  if (loading) {
    return (
      <section aria-label="Sales loading" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <article key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 animate-pulse space-y-3" aria-hidden="true">
            <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          </article>
        ))}
      </section>
    )
  }

  if (sales.length === 0) {
    return (
      <section aria-label="No sales found" className="text-center py-16">
        <div className="mx-auto h-16 w-16 text-gray-400" aria-hidden="true">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No sales found</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Try adjusting your filters or search radius
        </p>
      </section>
    )
  }

  return (
    <section aria-label={`Sales results: ${sales.length} deals found`} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {sales.map(item => (
        <SaleCard
          key={item.id}
          item={item}
          formatPrice={formatPrice}
          getDiscountPercent={getDiscountPercent}
        />
      ))}
    </section>
  )
}

function SaleCard({ item, formatPrice, getDiscountPercent }: {
  item: SaleItem
  formatPrice: (cents: number) => string
  getDiscountPercent: (regular: number | null, sale: number) => number
}) {
  const discount = getDiscountPercent(item.regularPrice, item.salePrice)
  const chain = item.flyer.chain
  const cardId = `sale-card-${item.id}`

  return (
    <article
      id={cardId}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 dark:focus-within:ring-offset-gray-900"
    >
      {item.imageUrl && (
        <div className="relative h-40 bg-gray-100 dark:bg-gray-700">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {item.isFeatured && (
            <span className="absolute top-2 left-2 px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded"
                  aria-label="Featured deal">
              Featured
            </span>
          )}
        </div>
      )}

      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded"
                aria-label={`Store: ${chain.name}`}>
            {chain.name}
          </span>
          {item.category && (
            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded"
                  aria-label={`Category: ${item.category}`}>
              {item.category}
            </span>
          )}
        </div>

        <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2">
          {item.name}
        </h3>

        {item.brand && (
          <p className="text-sm text-gray-500 dark:text-gray-400" aria-label={`Brand: ${item.brand}`}>
            {item.brand}
          </p>
        )}

        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400"
                aria-label={`Sale price: ${formatPrice(item.salePrice)}`}>
            {formatPrice(item.salePrice)}
          </span>
          {item.regularPrice && item.regularPrice > item.salePrice && (
            <>
              <span className="text-lg text-gray-400 line-through"
                    aria-label={`Regular price: ${formatPrice(item.regularPrice)}`}>
                {formatPrice(item.regularPrice)}
              </span>
              <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-xs font-medium rounded"
                    aria-label={`${discount}% off`}>
                -{discount}% off
              </span>
            </>
          )}
        </div>

        {item.unit && item.quantity && item.quantity > 1 && (
          <p className="text-sm text-gray-500 dark:text-gray-400"
             aria-label={`Unit price: ${formatPrice(item.salePrice)} per ${item.quantity} ${item.unit}`}>
            {formatPrice(item.salePrice)} / {item.quantity} {item.unit}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
          <time dateTime={item.validTo} className="whitespace-nowrap">
            Valid until {new Date(item.validTo).toLocaleDateString('en-CA', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </time>
          {item.productUrl && (
            <a
              href={item.productUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            >
              View Deal →
            </a>
          )}
        </div>
      </div>
    </article>
  )
}

function MapView({ location, stores, chains, selectedChains }: {
  location: Location
  stores: Store[]
  chains: Chain[]
  selectedChains: string[]
}) {
  return (
    <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden" aria-label="Map view">
      <div className="h-96 bg-gray-100 dark:bg-gray-700 flex items-center justify-center relative">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 text-gray-400" aria-hidden="true">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
          </div>
          <h2 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Map View</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Interactive map coming soon. Showing {stores.length} nearby stores.
          </p>
        </div>

        {/* Store markers would go here */}
        {stores.map(store => (
          <div
            key={store.id}
            className="absolute p-2 bg-white dark:bg-gray-800 rounded shadow-lg border border-gray-200 dark:border-gray-700 text-xs"
            style={{
              left: `${50 + (store.longitude - location.lng) * 100}%`,
              top: `${50 - (store.latitude - location.lat) * 100}%`,
            }}
            role="img"
            aria-label={`${store.chain.name}, ${store.distance} km away, ${store.address}`}
          >
            <div className="font-medium">{store.chain.name}</div>
            <div>{store.distance} km away</div>
          </div>
        ))}
      </div>

      {/* Store List Sidebar */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 max-h-64 overflow-y-auto">
        <h3 className="font-medium text-gray-900 dark:text-white mb-3">Nearby Stores</h3>
        <ul className="space-y-2" role="list">
          {stores.slice(0, 10).map(store => (
            <li key={store.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              {store.chain.logoUrl && (
                <img src={store.chain.logoUrl} alt="" className="h-8 w-8 rounded" aria-hidden="true" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                  {store.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {store.distance} km • {store.address}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}