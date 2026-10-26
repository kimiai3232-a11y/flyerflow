import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getStoresNearby } from '@/lib/ingestion'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const radius = searchParams.get('radius') ? parseInt(searchParams.get('radius')!) : 25
  const chain = searchParams.get('chain') || undefined

  if (!lat || !lng) {
    return NextResponse.json({ error: 'lat and lng required' }, { status: 400 })
  }

  try {
    const stores = await getStoresNearby(parseFloat(lat), parseFloat(lng), radius, chain)

    return NextResponse.json({
      stores: stores.map(store => ({
        id: store.id,
        chain: store.chain,
        name: store.name,
        address: store.address,
        city: store.city,
        province: store.province,
        postalCode: store.postalCode,
        latitude: store.latitude,
        longitude: store.longitude,
        phone: store.phone,
        distance: calculateDistance(
          parseFloat(lat),
          parseFloat(lng),
          store.latitude,
          store.longitude
        ),
      })),
    })
  } catch (error) {
    console.error('Stores API error:', error)
    return NextResponse.json({ error: 'Failed to fetch stores' }, { status: 500 })
  }
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c * 10) / 10 // Round to 1 decimal
}