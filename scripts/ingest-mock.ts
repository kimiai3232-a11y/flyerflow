#!/usr/bin/env node

import { seedMockData } from '../src/lib/mock-data.js'

async function runMockIngestion() {
  console.log('Starting mock data ingestion...')
  const startTime = Date.now()

  try {
    await seedMockData()

    const duration = ((Date.now() - startTime) / 1000).toFixed(1)
    console.log(`\nMock ingestion completed in ${duration}s`)
    console.log('Database now has realistic flyer data for all 4 chains!')

  } catch (error) {
    console.error('Mock ingestion failed:', error)
    process.exit(1)
  }
}

runMockIngestion()