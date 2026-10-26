import { prisma } from '@/lib/prisma'

export interface ChainConfig {
  id: string
  name: string
  slug: string
  websiteUrl: string
  flyerUrl: string
  logoUrl?: string
}

export const TORONTO_CHAINS: ChainConfig[] = [
  {
    id: 'walmart-ca',
    name: 'Walmart Canada',
    slug: 'walmart',
    websiteUrl: 'https://www.walmart.ca',
    flyerUrl: 'https://www.walmart.ca/flyer',
    logoUrl: 'https://www.walmart.ca/favicon.ico',
  },
  {
    id: 'canadian-tire',
    name: 'Canadian Tire',
    slug: 'canadian-tire',
    websiteUrl: 'https://www.canadiantire.ca',
    flyerUrl: 'https://www.canadiantire.ca/en/flyer.html',
    logoUrl: 'https://www.canadiantire.ca/favicon.ico',
  },
  {
    id: 'giant-tiger',
    name: 'Giant Tiger',
    slug: 'giant-tiger',
    websiteUrl: 'https://www.giandtiger.com',
    flyerUrl: 'https://www.giandtiger.com/flyers',
    logoUrl: 'https://www.giandtiger.com/favicon.ico',
  },
  {
    id: 'dollarama',
    name: 'Dollarama',
    slug: 'dollarama',
    websiteUrl: 'https://www.dollarama.com',
    flyerUrl: 'https://www.dollarama.com/flyer',
    logoUrl: 'https://www.dollarama.com/favicon.ico',
  },
]

export interface FlyerData {
  externalId: string
  title: string
  validFrom: Date
  validTo: Date
  flyerUrl: string
  pdfUrl?: string
  items: SaleItemData[]
}

export interface SaleItemData {
  externalId: string
  name: string
  description?: string
  category?: string
  subcategory?: string
  brand?: string
  regularPrice?: number // in cents
  salePrice: number // in cents
  unit?: string
  quantity?: number
  imageUrl?: string
  productUrl?: string
  validFrom: Date
  validTo: Date
  isFeatured?: boolean
  tags?: string[]
}

export interface StoreData {
  externalId: string
  name: string
  address: string
  city: string
  province: string
  postalCode: string
  latitude: number
  longitude: number
  phone?: string
  hours?: Record<string, string>
}

export async function seedChains() {
  for (const chain of TORONTO_CHAINS) {
    await prisma.chain.upsert({
      where: { slug: chain.slug },
      update: chain,
      create: chain,
    })
  }
  console.log('Chains seeded')
}

export async function seedCategories() {
  const categories = [
    { name: 'Groceries', slug: 'groceries', icon: '🛒', sortOrder: 1 },
    { name: 'Electronics', slug: 'electronics', icon: '📱', sortOrder: 2 },
    { name: 'Home & Garden', slug: 'home-garden', icon: '🏠', sortOrder: 3 },
    { name: 'Clothing', slug: 'clothing', icon: '👕', sortOrder: 4 },
    { name: 'Health & Beauty', slug: 'health-beauty', icon: '💊', sortOrder: 5 },
    { name: 'Sports & Outdoors', slug: 'sports-outdoors', icon: '⚽', sortOrder: 6 },
    { name: 'Automotive', slug: 'automotive', icon: '🚗', sortOrder: 7 },
    { name: 'Toys & Games', slug: 'toys-games', icon: '🧸', sortOrder: 8 },
    { name: 'Office & School', slug: 'office-school', icon: '📚', sortOrder: 9 },
    { name: 'Pet Supplies', slug: 'pet-supplies', icon: '🐾', sortOrder: 10 },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    })
  }
  console.log('Categories seeded')
}

export async function saveFlyer(chainSlug: string, flyer: FlyerData) {
  const chain = await prisma.chain.findUnique({ where: { slug: chainSlug } })
  if (!chain) throw new Error(`Chain not found: ${chainSlug}`)

  const savedFlyer = await prisma.flyer.upsert({
    where: {
      chainId_externalId: {
        chainId: chain.id,
        externalId: flyer.externalId,
      },
    },
    update: {
      title: flyer.title,
      validFrom: flyer.validFrom,
      validTo: flyer.validTo,
      flyerUrl: flyer.flyerUrl,
      pdfUrl: flyer.pdfUrl,
      status: 'ACTIVE',
      fetchedAt: new Date(),
    },
    create: {
      chainId: chain.id,
      externalId: flyer.externalId,
      title: flyer.title,
      validFrom: flyer.validFrom,
      validTo: flyer.validTo,
      flyerUrl: flyer.flyerUrl,
      pdfUrl: flyer.pdfUrl,
      status: 'ACTIVE',
    },
  })

  // Save items
  for (const item of flyer.items) {
    await prisma.saleItem.upsert({
      where: {
        flyerId_externalId: {
          flyerId: savedFlyer.id,
          externalId: item.externalId,
        },
      },
      update: {
        name: item.name,
        description: item.description,
        category: item.category,
        subcategory: item.subcategory,
        brand: item.brand,
        regularPrice: item.regularPrice,
        salePrice: item.salePrice,
        unit: item.unit,
        quantity: item.quantity,
        imageUrl: item.imageUrl,
        productUrl: item.productUrl,
        validFrom: item.validFrom,
        validTo: item.validTo,
        isFeatured: item.isFeatured ?? false,
        tags: item.tags?.join(',') ?? null,
      },
      create: {
        flyerId: savedFlyer.id,
        externalId: item.externalId,
        name: item.name,
        description: item.description,
        category: item.category,
        subcategory: item.subcategory,
        brand: item.brand,
        regularPrice: item.regularPrice,
        salePrice: item.salePrice,
        unit: item.unit,
        quantity: item.quantity,
        imageUrl: item.imageUrl,
        productUrl: item.productUrl,
        validFrom: item.validFrom,
        validTo: item.validTo,
        isFeatured: item.isFeatured ?? false,
        tags: item.tags?.join(',') ?? null,
      },
    })
  }

  console.log(`Saved flyer: ${flyer.title} with ${flyer.items.length} items`)
  return savedFlyer
}

export async function saveStores(chainSlug: string, stores: StoreData[]) {
  const chain = await prisma.chain.findUnique({ where: { slug: chainSlug } })
  if (!chain) throw new Error(`Chain not found: ${chainSlug}`)

  for (const store of stores) {
    await prisma.store.upsert({
      where: {
        chainId_externalId: {
          chainId: chain.id,
          externalId: store.externalId,
        },
      },
      update: {
        name: store.name,
        address: store.address,
        city: store.city,
        province: store.province,
        postalCode: store.postalCode,
        latitude: store.latitude,
        longitude: store.longitude,
        phone: store.phone,
        hours: store.hours ? JSON.stringify(store.hours) : null,
      },
      create: {
        chainId: chain.id,
        externalId: store.externalId,
        name: store.name,
        address: store.address,
        city: store.city,
        province: store.province,
        postalCode: store.postalCode,
        latitude: store.latitude,
        longitude: store.longitude,
        phone: store.phone,
        hours: store.hours ? JSON.stringify(store.hours) : null,
      },
    })
  }
  console.log(`Saved ${stores.length} stores for ${chainSlug}`)
}

export async function expireOldFlyers() {
  const now = new Date()
  const result = await prisma.flyer.updateMany({
    where: {
      validTo: { lt: now },
      status: 'ACTIVE',
    },
    data: { status: 'EXPIRED' },
  })
  console.log(`Expired ${result.count} flyers`)
  return result.count
}

export async function getActiveFlyers(chainSlug?: string) {
  const now = new Date()
  return prisma.flyer.findMany({
    where: {
      status: 'ACTIVE',
      validFrom: { lte: now },
      validTo: { gte: now },
      chain: chainSlug ? { slug: chainSlug } : undefined,
    },
    include: {
      chain: true,
      items: {
        where: {
          validFrom: { lte: now },
          validTo: { gte: now },
        },
        orderBy: { salePrice: 'asc' },
      },
    },
    orderBy: { validFrom: 'desc' },
  })
}

export async function getStoresNearby(
  latitude: number,
  longitude: number,
  radiusKm: number = 25,
  chainSlug?: string
) {
  // Simple bounding box filter (approximate)
  const latDelta = radiusKm / 111
  const lngDelta = radiusKm / (111 * Math.cos((latitude * Math.PI) / 180))

  return prisma.store.findMany({
    where: {
      isActive: true,
      latitude: { gte: latitude - latDelta, lte: latitude + latDelta },
      longitude: { gte: longitude - lngDelta, lte: longitude + lngDelta },
      chain: chainSlug ? { slug: chainSlug } : undefined,
    },
    include: { chain: true },
  })
}