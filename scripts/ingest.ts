#!/usr/bin/env node

import { PrismaClient } from '@prisma/client'
import { seedChains, seedCategories, saveFlyer, saveStores, expireOldFlyers } from '../src/lib/ingestion'
import { getScraper } from '../src/lib/scrapers'

const prisma = new PrismaClient()

async function runIngestion() {
  console.log('Starting flyer ingestion...')
  const startTime = Date.now()

  try {
    // Seed reference data
    await seedChains()
    await seedCategories()

    // Expire old flyers
    await expireOldFlyers()

    // Chains to process
    const chainSlugs = ['walmart', 'canadian-tire', 'giant-tiger', 'dollarama']

    for (const chainSlug of chainSlugs) {
      console.log(`\nProcessing ${chainSlug}...`)

      const scraper = getScraper(chainSlug)
      if (!scraper) {
        console.log(`No scraper for ${chainSlug}`)
        continue
      }

      try {
        // Fetch and save stores
        const stores = await scraper.fetchStores()
        if (stores.length > 0) {
          await saveStores(chainSlug, stores)
        }

        // Fetch and save flyer
        const flyer = await scraper.fetchFlyer()
        if (flyer) {
          await saveFlyer(chainSlug, flyer)
        } else {
          console.log(`No flyer data for ${chainSlug}`)
        }

        await scraper.close()
      } catch (error) {
        console.error(`Error processing ${chainSlug}:`, error)
        await scraper.close()
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1)
    console.log(`\nIngestion completed in ${duration}s`)

  } catch (error) {
    console.error('Ingestion failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

runIngestion()