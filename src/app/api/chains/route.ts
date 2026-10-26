import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const chains = await prisma.chain.findMany({
      where: { isActive: true },
      include: {
        affiliateLink: true,
        _count: {
          select: { stores: true, flyers: true },
        },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({
      chains: chains.map(chain => ({
        id: chain.id,
        name: chain.name,
        slug: chain.slug,
        logoUrl: chain.logoUrl,
        websiteUrl: chain.websiteUrl,
        flyerUrl: chain.flyerUrl,
        storeCount: chain._count.stores,
        flyerCount: chain._count.flyers,
        affiliateUrl: chain.affiliateLink
          ? `${chain.affiliateLink.baseUrl}?${chain.affiliateLink.paramName}=${chain.affiliateLink.paramValue}`
          : chain.websiteUrl,
      })),
    })
  } catch (error) {
    console.error('Chains API error:', error)
    return NextResponse.json({ error: 'Failed to fetch chains' }, { status: 500 })
  }
}