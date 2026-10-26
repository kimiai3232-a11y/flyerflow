import { chromium, Browser } from 'playwright'
import { FlyerData, SaleItemData, StoreData } from './ingestion'

export interface Scraper {
  name: string
  fetchFlyer(): Promise<FlyerData | null>
  fetchStores(): Promise<StoreData[]>
  close(): Promise<void>
}

export abstract class BaseScraper implements Scraper {
  abstract name: string
  protected browser: Browser | null = null

  async init() {
    if (!this.browser) {
      this.browser = await chromium.launch({ headless: true })
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
  }

  abstract fetchFlyer(): Promise<FlyerData | null>
  abstract fetchStores(): Promise<StoreData[]>

  protected async parsePrice(priceStr: string): Promise<number> {
    // Convert price string like "$4.99" or "4.99" to cents
    const cleaned = priceStr.replace(/[$,]/g, '').trim()
    const dollars = parseFloat(cleaned)
    return Math.round(dollars * 100)
  }

  protected generateExternalId(prefix: string, identifier: string): string {
    return `${prefix}-${identifier.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`
  }
}

// Walmart Canada Scraper
export class WalmartScraper extends BaseScraper {
  name = 'walmart'

  async fetchFlyer(): Promise<FlyerData | null> {
    await this.init()
    if (!this.browser) throw new Error('Browser not initialized')

    const page = await this.browser.newPage()
    try {
      // Walmart Canada flyer page
      await page.goto('https://www.walmart.ca/flyer', { waitUntil: 'networkidle' })

      // Wait for flyer content to load
      await page.waitForSelector('[data-automation="flyer-page"]', { timeout: 10000 })

      // Extract flyer metadata
      const flyerData = await page.evaluate(() => {
        const flyerEl = document.querySelector('[data-automation="flyer-page"]')
        if (!flyerEl) return null

        // Get flyer title and dates
        const titleEl = flyerEl.querySelector('[data-automation="flyer-title"]')
        const dateEl = flyerEl.querySelector('[data-automation="flyer-dates"]')
        const pdfLink = flyerEl.querySelector('a[href$=".pdf"]')

        const title = titleEl?.textContent?.trim() || 'Walmart Weekly Flyer'
        const dateText = dateEl?.textContent?.trim() || ''
        const pdfUrl = pdfLink?.getAttribute('href') || undefined

        // Parse dates from text like "Dec 2 - Dec 8"
        const dateMatch = dateText.match(/(\w+\s+\d+)\s*[-–]\s*(\w+\s+\d+)/i)
        let validFrom = new Date()
        let validTo = new Date()
        validTo.setDate(validTo.getDate() + 7)

        if (dateMatch) {
          const year = new Date().getFullYear()
          validFrom = new Date(`${dateMatch[1]}, ${year}`)
          validTo = new Date(`${dateMatch[2]}, ${year}`)
        }

        return {
          title,
          validFrom,
          validTo,
          pdfUrl,
        }
      })

      if (!flyerData) return null

      // Extract sale items
      const items = await page.evaluate(() => {
        const itemEls = document.querySelectorAll('[data-automation="flyer-item"]')
        const items: any[] = []

        itemEls.forEach((el, index) => {
          const nameEl = el.querySelector('[data-automation="item-name"]')
          const priceEl = el.querySelector('[data-automation="item-price"]')
          const regularPriceEl = el.querySelector('[data-automation="item-regular-price"]')
          const imageEl = el.querySelector('img')
          const linkEl = el.querySelector('a[href*="/product/"]')
          const categoryEl = el.querySelector('[data-automation="item-category"]')

          const name = nameEl?.textContent?.trim()
          const salePrice = priceEl?.textContent?.trim()
          const regularPrice = regularPriceEl?.textContent?.trim()
          const imageUrl = imageEl?.getAttribute('src')
          const productUrl = linkEl?.getAttribute('href')
          const category = categoryEl?.textContent?.trim()

          if (name && salePrice) {
            items.push({
              externalId: `walmart-item-${index}`,
              name,
              salePrice,
              regularPrice: regularPrice || undefined,
              imageUrl,
              productUrl: productUrl ? `https://www.walmart.ca${productUrl}` : undefined,
              category,
            })
          }
        })

        return items
      })

      const saleItems: SaleItemData[] = items.map(item => ({
        externalId: item.externalId,
        name: item.name,
        salePrice: this.parsePriceSync(item.salePrice),
        regularPrice: item.regularPrice ? this.parsePriceSync(item.regularPrice) : undefined,
        imageUrl: item.imageUrl,
        productUrl: item.productUrl,
        category: item.category,
        validFrom: flyerData.validFrom,
        validTo: flyerData.validTo,
      }))

      return {
        externalId: this.generateExternalId('walmart', flyerData.title),
        title: flyerData.title,
        validFrom: flyerData.validFrom,
        validTo: flyerData.validTo,
        flyerUrl: 'https://www.walmart.ca/flyer',
        pdfUrl: flyerData.pdfUrl,
        items: saleItems,
      }
    } catch (error) {
      console.error('Walmart scraper error:', error)
      return null
    } finally {
      await page.close()
    }
  }

  parsePriceSync(priceStr: string): number {
    const cleaned = priceStr.replace(/[$,]/g, '').trim()
    const dollars = parseFloat(cleaned)
    return Math.round(dollars * 100)
  }

  async fetchStores(): Promise<StoreData[]> {
    // Walmart store locations would come from their store finder API
    // For now, return major Toronto locations manually
    return [
      {
        externalId: '1017',
        name: 'Walmart Toronto - Dufferin Mall',
        address: '900 Dufferin St',
        city: 'Toronto',
        province: 'ON',
        postalCode: 'M6H 4A9',
        latitude: 43.6568,
        longitude: -79.4338,
        phone: '416-531-1122',
      },
      {
        externalId: '1038',
        name: 'Walmart Toronto - Stockyards',
        address: '1900 St Clair Ave W',
        city: 'Toronto',
        province: 'ON',
        postalCode: 'M6N 0A1',
        latitude: 43.6756,
        longitude: -79.4826,
        phone: '416-656-9988',
      },
      {
        externalId: '3105',
        name: 'Walmart Toronto - Scarborough',
        address: '200 Scarborough Town Centre',
        city: 'Toronto',
        province: 'ON',
        postalCode: 'M1P 4P4',
        latitude: 43.7742,
        longitude: -79.2578,
        phone: '416-290-1133',
      },
      {
        externalId: '3156',
        name: 'Walmart Toronto - North York',
        address: '4700 Keele St',
        city: 'Toronto',
        province: 'ON',
        postalCode: 'M3J 1P3',
        latitude: 43.7564,
        longitude: -79.4762,
        phone: '416-633-5566',
      },
    ]
  }
}

// Canadian Tire Scraper
export class CanadianTireScraper extends BaseScraper {
  name = 'canadian-tire'

  async fetchFlyer(): Promise<FlyerData | null> {
    await this.init()
    if (!this.browser) throw new Error('Browser not initialized')

    const page = await this.browser.newPage()
    try {
      await page.goto('https://www.canadiantire.ca/en/flyer.html', { waitUntil: 'networkidle' })
      await page.waitForSelector('.flyer-container', { timeout: 10000 })

      const flyerData = await page.evaluate(() => {
        const container = document.querySelector('.flyer-container')
        if (!container) return null

        const titleEl = container.querySelector('.flyer-title, h1')
        const dateEl = container.querySelector('.flyer-date, .valid-dates')
        const pdfLink = container.querySelector('a[href$=".pdf"]')

        const title = titleEl?.textContent?.trim() || 'Canadian Tire Weekly Flyer'
        const dateText = dateEl?.textContent?.trim() || ''
        const pdfUrl = pdfLink?.getAttribute('href') || undefined

        let dateMatch: RegExpMatchArray | null = dateText.match(/(\w+\s+\d+)\s*[-–]\s*(\w+\s+\d+)/i)
        let validFrom = new Date()
        let validTo = new Date()
        validTo.setDate(validTo.getDate() + 7)

        if (dateMatch) {
          const year = new Date().getFullYear()
          validFrom = new Date(`${dateMatch[1]}, ${year}`)
          validTo = new Date(`${dateMatch[2]}, ${year}`)
        }

        return { title, validFrom, validTo, pdfUrl }
      })

      if (!flyerData) return null

      const items = await page.evaluate(() => {
        const itemEls = document.querySelectorAll('.flyer-item, .product-tile')
        const items: any[] = []

        itemEls.forEach((el, index) => {
          const nameEl = el.querySelector('.product-name, .item-title')
          const priceEl = el.querySelector('.sale-price, .price')
          const regularPriceEl = el.querySelector('.regular-price, .was-price')
          const imageEl = el.querySelector('img')
          const linkEl = el.querySelector('a[href*="/product/"]')
          const categoryEl = el.querySelector('.category, .department')

          const name = nameEl?.textContent?.trim()
          const salePrice = priceEl?.textContent?.trim()
          const regularPrice = regularPriceEl?.textContent?.trim()
          const imageUrl = imageEl?.getAttribute('src')
          const productUrl = linkEl?.getAttribute('href')
          const category = categoryEl?.textContent?.trim()

          if (name && salePrice) {
            items.push({
              externalId: `ct-item-${index}`,
              name,
              salePrice,
              regularPrice: regularPrice || undefined,
              imageUrl,
              productUrl: productUrl ? `https://www.canadiantire.ca${productUrl}` : undefined,
              category,
            })
          }
        })

        return items
      })

      const saleItems: SaleItemData[] = items.map(item => ({
        externalId: item.externalId,
        name: item.name,
        salePrice: this.parsePriceSync(item.salePrice),
        regularPrice: item.regularPrice ? this.parsePriceSync(item.regularPrice) : undefined,
        imageUrl: item.imageUrl,
        productUrl: item.productUrl,
        category: item.category,
        validFrom: flyerData.validFrom,
        validTo: flyerData.validTo,
      }))

      return {
        externalId: this.generateExternalId('ct', flyerData.title),
        title: flyerData.title,
        validFrom: flyerData.validFrom,
        validTo: flyerData.validTo,
        flyerUrl: 'https://www.canadiantire.ca/en/flyer.html',
        pdfUrl: flyerData.pdfUrl,
        items: saleItems,
      }
    } catch (error) {
      console.error('Canadian Tire scraper error:', error)
      return null
    } finally {
      await page.close()
    }
  }

  parsePriceSync(priceStr: string): number {
    const cleaned = priceStr.replace(/[$,]/g, '').trim()
    const dollars = parseFloat(cleaned)
    return Math.round(dollars * 100)
  }

  async fetchStores(): Promise<StoreData[]> {
    return [
      {
        externalId: '642',
        name: 'Canadian Tire - Dufferin Mall',
        address: '900 Dufferin St',
        city: 'Toronto',
        province: 'ON',
        postalCode: 'M6H 4A9',
        latitude: 43.6568,
        longitude: -79.4338,
        phone: '416-531-2233',
      },
      {
        externalId: '626',
        name: 'Canadian Tire - Stockyards',
        address: '1900 St Clair Ave W',
        city: 'Toronto',
        province: 'ON',
        postalCode: 'M6N 0A1',
        latitude: 43.6756,
        longitude: -79.4826,
        phone: '416-656-7788',
      },
      {
        externalId: '431',
        name: 'Canadian Tire - Scarborough Town Centre',
        address: '300 Borough Dr',
        city: 'Toronto',
        province: 'ON',
        postalCode: 'M1P 4P5',
        latitude: 43.7742,
        longitude: -79.2578,
        phone: '416-290-3344',
      },
    ]
  }
}

// Giant Tiger Scraper
export class GiantTigerScraper extends BaseScraper {
  name = 'giant-tiger'

  async fetchFlyer(): Promise<FlyerData | null> {
    await this.init()
    if (!this.browser) throw new Error('Browser not initialized')

    const page = await this.browser.newPage()
    try {
      await page.goto('https://www.giandtiger.com/flyers', { waitUntil: 'networkidle' })
      await page.waitForSelector('.flyer-grid, .flyer-list', { timeout: 10000 })

      const flyerData = await page.evaluate(() => {
        const flyerEl = document.querySelector('.flyer-grid .flyer-card:first-child, .flyer-list .flyer-item:first-child')
        if (!flyerEl) return null

        const titleEl = flyerEl.querySelector('.flyer-title, h3, h2')
        const dateEl = flyerEl.querySelector('.flyer-date, .valid-date')
        const linkEl = flyerEl.querySelector('a')
        const pdfLink = flyerEl.querySelector('a[href$=".pdf"]')

        const title = titleEl?.textContent?.trim() || 'Giant Tiger Weekly Flyer'
        const dateText = dateEl?.textContent?.trim() || ''
        const flyerUrl = linkEl?.getAttribute('href') || 'https://www.giandtiger.com/flyers'
        const pdfUrl = pdfLink?.getAttribute('href') || undefined

        const dateMatch = dateText.match(/(\w+\s+\d+)\s*[-–]\s*(\w+\s+\d+)/i)
        let validFrom = new Date()
        let validTo = new Date()
        validTo.setDate(validTo.getDate() + 7)

        if (dateMatch) {
          const year = new Date().getFullYear()
          validFrom = new Date(`${dateMatch[1]}, ${year}`)
          validTo = new Date(`${dateMatch[2]}, ${year}`)
        }

        return { title, validFrom, validTo, flyerUrl, pdfUrl }
      })

      if (!flyerData) return null

      // Navigate to flyer detail page for items
      await page.goto(flyerData.flyerUrl, { waitUntil: 'networkidle' })
      await page.waitForSelector('.flyer-item, .product-item', { timeout: 10000 })

      const items = await page.evaluate(() => {
        const itemEls = document.querySelectorAll('.flyer-item, .product-item')
        const items: any[] = []

        itemEls.forEach((el, index) => {
          const nameEl = el.querySelector('.product-name, .item-name')
          const priceEl = el.querySelector('.price, .sale-price')
          const imageEl = el.querySelector('img')
          const linkEl = el.querySelector('a')
          const categoryEl = el.querySelector('.category')

          const name = nameEl?.textContent?.trim()
          const salePrice = priceEl?.textContent?.trim()
          const imageUrl = imageEl?.getAttribute('src')
          const productUrl = linkEl?.getAttribute('href')
          const category = categoryEl?.textContent?.trim()

          if (name && salePrice) {
            items.push({
              externalId: `gt-item-${index}`,
              name,
              salePrice,
              imageUrl,
              productUrl: productUrl ? `https://www.giandtiger.com${productUrl}` : undefined,
              category,
            })
          }
        })

        return items
      })

      const saleItems: SaleItemData[] = items.map(item => ({
        externalId: item.externalId,
        name: item.name,
        salePrice: this.parsePriceSync(item.salePrice),
        imageUrl: item.imageUrl,
        productUrl: item.productUrl,
        category: item.category,
        validFrom: flyerData.validFrom,
        validTo: flyerData.validTo,
      }))

      return {
        externalId: this.generateExternalId('gt', flyerData.title),
        title: flyerData.title,
        validFrom: flyerData.validFrom,
        validTo: flyerData.validTo,
        flyerUrl: flyerData.flyerUrl,
        pdfUrl: flyerData.pdfUrl,
        items: saleItems,
      }
    } catch (error) {
      console.error('Giant Tiger scraper error:', error)
      return null
    } finally {
      await page.close()
    }
  }

  parsePriceSync(priceStr: string): number {
    const cleaned = priceStr.replace(/[$,]/g, '').trim()
    const dollars = parseFloat(cleaned)
    return Math.round(dollars * 100)
  }

  async fetchStores(): Promise<StoreData[]> {
    return [
      {
        externalId: '2112',
        name: 'Giant Tiger - Dufferin Mall',
        address: '900 Dufferin St',
        city: 'Toronto',
        province: 'ON',
        postalCode: 'M6H 4A9',
        latitude: 43.6568,
        longitude: -79.4338,
      },
      {
        externalId: '2156',
        name: 'Giant Tiger - Jane & Finch',
        address: '1911 Finch Ave W',
        city: 'Toronto',
        province: 'ON',
        postalCode: 'M3N 2J1',
        latitude: 43.7736,
        longitude: -79.5064,
      },
      {
        externalId: '2201',
        name: 'Giant Tiger - Scarborough',
        address: '3785 Kingston Rd',
        city: 'Toronto',
        province: 'ON',
        postalCode: 'M1J 3H5',
        latitude: 43.7534,
        longitude: -79.1592,
      },
    ]
  }
}

// Dollarama Scraper
export class DollaramaScraper extends BaseScraper {
  name = 'dollarama'

  async fetchFlyer(): Promise<FlyerData | null> {
    await this.init()
    if (!this.browser) throw new Error('Browser not initialized')

    const page = await this.browser.newPage()
    try {
      await page.goto('https://www.dollarama.com/flyer', { waitUntil: 'networkidle' })
      await page.waitForSelector('.flyer-content, .flyer-items', { timeout: 10000 })

      const flyerData = await page.evaluate(() => {
        const container = document.querySelector('.flyer-content, .flyer-header')
        if (!container) return null

        const titleEl = container.querySelector('h1, .flyer-title')
        const dateEl = container.querySelector('.flyer-date, .valid-dates')
        const pdfLink = container.querySelector('a[href$=".pdf"]')

        const title = titleEl?.textContent?.trim() || 'Dollarama Weekly Flyer'
        const dateText = dateEl?.textContent?.trim() || ''
        const pdfUrl = pdfLink?.getAttribute('href') || undefined

        const dateMatch = dateText.match(/(\w+\s+\d+)\s*[-–]\s*(\w+\s+\d+)/i)
        let validFrom = new Date()
        let validTo = new Date()
        validTo.setDate(validTo.getDate() + 7)

        if (dateMatch) {
          const year = new Date().getFullYear()
          validFrom = new Date(`${dateMatch[1]}, ${year}`)
          validTo = new Date(`${dateMatch[2]}, ${year}`)
        }

        return { title, validFrom, validTo, pdfUrl }
      })

      if (!flyerData) return null

      const items = await page.evaluate(() => {
        const itemEls = document.querySelectorAll('.flyer-item, .product-tile')
        const items: any[] = []

        itemEls.forEach((el, index) => {
          const nameEl = el.querySelector('.product-name, .item-title')
          const priceEl = el.querySelector('.price, .sale-price')
          const imageEl = el.querySelector('img')
          const categoryEl = el.querySelector('.category')

          const name = nameEl?.textContent?.trim()
          const salePrice = priceEl?.textContent?.trim()
          const imageUrl = imageEl?.getAttribute('src')
          const category = categoryEl?.textContent?.trim()

          if (name && salePrice) {
            items.push({
              externalId: `dollarama-item-${index}`,
              name,
              salePrice,
              imageUrl,
              category,
            })
          }
        })

        return items
      })

      const saleItems: SaleItemData[] = items.map(item => ({
        externalId: item.externalId,
        name: item.name,
        salePrice: this.parsePriceSync(item.salePrice),
        imageUrl: item.imageUrl,
        category: item.category,
        validFrom: flyerData.validFrom,
        validTo: flyerData.validTo,
      }))

      return {
        externalId: this.generateExternalId('dollarama', flyerData.title),
        title: flyerData.title,
        validFrom: flyerData.validFrom,
        validTo: flyerData.validTo,
        flyerUrl: 'https://www.dollarama.com/flyer',
        pdfUrl: flyerData.pdfUrl,
        items: saleItems,
      }
    } catch (error) {
      console.error('Dollarama scraper error:', error)
      return null
    } finally {
      await page.close()
    }
  }

  parsePriceSync(priceStr: string): number {
    const cleaned = priceStr.replace(/[$,]/g, '').trim()
    const dollars = parseFloat(cleaned)
    return Math.round(dollars * 100)
  }

  async fetchStores(): Promise<StoreData[]> {
    return [
      {
        externalId: '1001',
        name: 'Dollarama - Dufferin Mall',
        address: '900 Dufferin St',
        city: 'Toronto',
        province: 'ON',
        postalCode: 'M6H 4A9',
        latitude: 43.6568,
        longitude: -79.4338,
      },
      {
        externalId: '1002',
        name: 'Dollarama - Yorkdale',
        address: '3401 Dufferin St',
        city: 'Toronto',
        province: 'ON',
        postalCode: 'M6A 2T9',
        latitude: 43.7256,
        longitude: -79.4502,
      },
      {
        externalId: '1003',
        name: 'Dollarama - Scarborough Town Centre',
        address: '300 Borough Dr',
        city: 'Toronto',
        province: 'ON',
        postalCode: 'M1P 4P5',
        latitude: 43.7742,
        longitude: -79.2578,
      },
      {
        externalId: '1004',
        name: 'Dollarama - Eaton Centre',
        address: '220 Yonge St',
        city: 'Toronto',
        province: 'ON',
        postalCode: 'M5B 2H1',
        latitude: 43.6532,
        longitude: -79.3832,
      },
    ]
  }
}

// Factory to get scraper by chain slug
export function getScraper(chainSlug: string): Scraper | null {
  switch (chainSlug) {
    case 'walmart':
      return new WalmartScraper()
    case 'canadian-tire':
      return new CanadianTireScraper()
    case 'giant-tiger':
      return new GiantTigerScraper()
    case 'dollarama':
      return new DollaramaScraper()
    default:
      return null
  }
}