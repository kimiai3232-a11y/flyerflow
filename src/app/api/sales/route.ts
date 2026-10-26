import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getActiveFlyers, getStoresNearby } from '@/lib/ingestion'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const chain = searchParams.get('chain') || undefined
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const radius = searchParams.get('radius') ? parseInt(searchParams.get('radius')!) : 25
  const category = searchParams.get('category') || undefined
  const query = searchParams.get('q') || undefined

  try {
    // If location provided, get nearby stores
    let storeIds: string[] | undefined
    if (lat && lng) {
      const stores = await getStoresNearby(parseFloat(lat), parseFloat(lng), radius, chain)
      storeIds = stores.map(s => s.id)
    }

    // Get active flyers with items
    const flyers = await getActiveFlyers(chain)

    // Filter items
    let allItems = flyers.flatMap(flyer =>
      flyer.items.map(item => ({
        ...item,
        flyer: {
          id: flyer.id,
          title: flyer.title,
          validFrom: flyer.validFrom,
          validTo: flyer.validTo,
          flyerUrl: flyer.flyerUrl,
          chain: flyer.chain,
        },
        storeIds: storeIds,
      }))
    )

    // Apply filters
    if (category) {
      allItems = allItems.filter(item =>
        item.category?.toLowerCase().includes(category.toLowerCase())
      )
    }

    if (query) {
      const q = query.toLowerCase()
      allItems = allItems.filter(item =>
        item.name.toLowerCase().includes(q) ||
        item.brand?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q)
      )
    }

    // Sort by sale price ascending
    allItems.sort((a, b) => a.salePrice - b.salePrice)

    // Group by chain for summary
    const chainSummary = flyers.map(flyer => ({
      chain: flyer.chain,
      flyerId: flyer.id,
      flyerTitle: flyer.title,
      validFrom: flyer.validFrom,
      validTo: flyer.validTo,
      itemCount: flyer.items.length,
      flyerUrl: flyer.flyerUrl,
    }))

    return NextResponse.json({
      items: allItems,
      chains: chainSummary,
      totalItems: allItems.length,
      stores: storeIds?.length ? storeIds : undefined,
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Failed to fetch sales' }, { status: 500 })
  }
}