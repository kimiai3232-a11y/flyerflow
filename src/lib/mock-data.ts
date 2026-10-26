import { FlyerData, SaleItemData, StoreData } from './ingestion'

// Mock data generators for development
// In production, replace with actual scraper results

const CATEGORIES = [
  'Electronics', 'Groceries', 'Home & Garden', 'Clothing',
  'Health & Beauty', 'Sports & Outdoors', 'Automotive',
  'Toys & Games', 'Office & School', 'Pet Supplies'
]

const BRANDS: Record<string, string[]> = {
  'Electronics': ['Samsung', 'LG', 'Sony', 'Apple', 'Microsoft', 'HP', 'Dell', 'Logitech'],
  'Groceries': ['Great Value', 'President\'s Choice', 'No Name', 'Compliments', 'Kraft', 'Heinz', 'Campbell\'s'],
  'Home & Garden': ['Mainstays', 'Better Homes', 'Scotts', 'Weber', 'Black+Decker', 'Stanley'],
  'Clothing': ['George', 'Joe Fresh', 'Hanes', 'Fruit of the Loom', 'Levi\'s', 'Champion'],
  'Health & Beauty': ['Equate', 'Life Brand', 'Crest', 'Colgate', 'Dove', 'Nivea', 'Gillette'],
  'Sports & Outdoors': ['Coleman', 'Nike', 'Adidas', 'Wilson', 'Spalding', 'Rawlings'],
  'Automotive': ['Mobil 1', 'Castrol', 'Prestone', 'Armor All', 'Meguiar\'s', 'Rain-X'],
  'Toys & Games': ['LEGO', 'Hasbro', 'Mattel', 'Fisher-Price', 'Melissa & Doug', 'Crayola'],
  'Office & School': ['Staples', 'Sharpie', 'Post-it', 'BIC', 'Paper Mate', 'Expo'],
  'Pet Supplies': ['Purina', 'Pedigree', 'Whiskas', 'Tidy Cats', 'Greenies', 'KONG'],
}

const ITEM_TEMPLATES: Record<string, string[]> = {
  'Electronics': [
    '55" 4K Smart TV', 'Wireless Earbuds', 'Laptop 15.6"', 'Bluetooth Speaker',
    'Smart Watch', 'Tablet 10"', 'Gaming Headset', 'External SSD 1TB',
    'Webcam 1080p', 'Mechanical Keyboard', 'Monitor 27"', 'Router WiFi 6'
  ],
  'Groceries': [
    'Milk 2% 4L', 'Eggs Large 12pk', 'Bread Whole Wheat', 'Chicken Breast 1kg',
    'Ground Beef 1lb', 'Salmon Fillet', 'Apples 3lb bag', 'Bananas 1.5kg',
    'Yogurt 650g', 'Cheese Block 400g', 'Pasta 900g', 'Olive Oil 1L',
    'Cereal Box', 'Coffee Ground 300g', 'Juice 1.5L', 'Frozen Pizza'
  ],
  'Home & Garden': [
    'Bath Towels 4pk', 'Sheet Set Queen', 'Throw Blanket', 'Pillows 2pk',
    'Storage Bins 3pk', 'Shower Curtain', 'Area Rug 5x7', 'Curtains Panel',
    'Plant Pot Set', 'Garden Hose 50ft', 'Patio Chair', 'BBQ Tool Set'
  ],
  'Clothing': [
    'Men\'s T-Shirt 3pk', 'Women\'s Leggings 2pk', 'Kids\' Jeans', 'Hoodie Pullover',
    'Socks 6pk', 'Underwear 5pk', 'Pajama Set', 'Winter Gloves',
    'Baseball Cap', 'Running Shoes', 'Winter Jacket', 'Swim Trunks'
  ],
  'Health & Beauty': [
    'Shampoo 400ml', 'Body Wash 500ml', 'Toothpaste 2pk', 'Deodorant 2pk',
    'Vitamins Multivitamin', 'Pain Reliever 100ct', 'Bandages 60ct', 'Hand Soap 3pk',
    'Lotion 400ml', 'Razor 4pk', 'Dental Floss', 'Mouthwash 1L'
  ],
  'Sports & Outdoors': [
    'Yoga Mat', 'Dumbbells 10lb', 'Resistance Bands', 'Tennis Balls 3pk',
    'Basketball', 'Soccer Ball', 'Camping Tent 4P', 'Sleeping Bag',
    'Cooler 20qt', 'Water Bottle 1L', 'Gym Bag', 'Foam Roller'
  ],
  'Automotive': [
    'Motor Oil 5W30 5L', 'Windshield Washer 4L', 'Car Wax', 'Tire Shine',
    'Air Freshener', 'Floor Mats', 'Phone Mount', 'USB Charger',
    'Jumper Cables', 'Ice Scraper', 'Seat Covers', 'Steering Cover'
  ],
  'Toys & Games': [
    'LEGO Set 500pcs', 'Board Game', 'Action Figure', 'Doll House',
    'Remote Control Car', 'Art Set', 'Puzzle 1000pc', 'Building Blocks',
    'Science Kit', 'Musical Toy', 'Outdoor Swing', 'Sandbox Toys'
  ],
  'Office & School': [
    'Notebook 3pk', 'Pens 12pk', 'Pencils 24pk', 'Highlighters 6pk',
    'Sticky Notes', 'File Folders 25pk', 'Binder 2"', 'Calculator',
    'Scissors', 'Tape Dispenser', 'Stapler', 'Whiteboard Markers'
  ],
  'Pet Supplies': [
    'Dog Food 15lb', 'Cat Food 3lb', 'Dog Treats', 'Cat Litter 10kg',
    'Dog Toy', 'Cat Toy', 'Pet Bed', 'Food Bowl',
    'Leash', 'Collar', 'Pet Shampoo', 'Flea Treatment'
  ],
}

function randomPrice(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100)
}

function randomDiscount(regularPrice: number): number {
  const discount = 0.1 + Math.random() * 0.4 // 10-50% off
  return Math.round(regularPrice * (1 - discount))
}

function randomDateRange(): { from: Date; to: Date } {
  const now = new Date()
  const startOffset = Math.floor(Math.random() * 3) // 0-2 days ago
  const endOffset = 7 + Math.floor(Math.random() * 7) // 7-13 days from now

  const from = new Date(now)
  from.setDate(from.getDate() - startOffset)
  from.setHours(0, 0, 0, 0)

  const to = new Date(now)
  to.setDate(to.getDate() + endOffset)
  to.setHours(23, 59, 59, 999)

  return { from, to }
}

function generateItems(category: string, count: number, validFrom: Date, validTo: Date): SaleItemData[] {
  const templates = ITEM_TEMPLATES[category] || ITEM_TEMPLATES['Groceries']
  const brands = BRANDS[category] || BRANDS['Groceries']
  const items: SaleItemData[] = []

  for (let i = 0; i < count; i++) {
    const template = templates[Math.floor(Math.random() * templates.length)]
    const brand = brands[Math.floor(Math.random() * brands.length)]
    const regularPrice = randomPrice(199, 29999) // $1.99 - $299.99
    const salePrice = randomDiscount(regularPrice)
    const isFeatured = Math.random() < 0.15

    items.push({
      externalId: `mock-${category.toLowerCase()}-${i}-${Date.now()}`,
      name: `${brand} ${template}`,
      description: `Great deal on ${template.toLowerCase()} from ${brand}`,
      category,
      subcategory: undefined,
      brand,
      regularPrice,
      salePrice,
      unit: 'each',
      quantity: 1,
      imageUrl: undefined,
      productUrl: undefined,
      validFrom,
      validTo,
      isFeatured,
      tags: isFeatured ? ['featured', 'weekly-deal'] : ['weekly-deal'],
    })
  }

  return items
}

export function generateMockFlyer(chainSlug: string): FlyerData {
  const { from, to } = randomDateRange()
  const chainNames: Record<string, string> = {
    walmart: 'Walmart',
    'canadian-tire': 'Canadian Tire',
    'giant-tiger': 'Giant Tiger',
    dollarama: 'Dollarama',
  }

  const chainName = chainNames[chainSlug] || chainSlug
  const allItems: SaleItemData[] = []

  // Distribute items across categories
  const categoriesToUse = CATEGORIES.slice(0, 5 + Math.floor(Math.random() * 3))
  let totalItems = 0

  for (const category of categoriesToUse) {
    const count = 5 + Math.floor(Math.random() * 10) // 5-14 items per category
    totalItems += count
    allItems.push(...generateItems(category, count, from, to))
  }

  // Shuffle items
  for (let i = allItems.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[allItems[i], allItems[j]] = [allItems[j], allItems[i]]
  }

  return {
    externalId: `${chainSlug}-flyer-${Date.now()}`,
    title: `${chainName} Weekly Flyer ${from.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })} - ${to.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}`,
    validFrom: from,
    validTo: to,
    flyerUrl: `https://www.${chainSlug.replace('-', '')}.ca/flyer`,
    pdfUrl: undefined,
    items: allItems,
  }
}

export function generateMockStores(chainSlug: string): StoreData[] {
  const torontoStores: Record<string, StoreData[]> = {
    walmart: [
      { externalId: '1017', name: 'Walmart Toronto - Dufferin Mall', address: '900 Dufferin St', city: 'Toronto', province: 'ON', postalCode: 'M6H 4A9', latitude: 43.6568, longitude: -79.4338, phone: '416-531-1122' },
      { externalId: '1038', name: 'Walmart Toronto - Stockyards', address: '1900 St Clair Ave W', city: 'Toronto', province: 'ON', postalCode: 'M6N 0A1', latitude: 43.6756, longitude: -79.4826, phone: '416-656-9988' },
      { externalId: '3105', name: 'Walmart Toronto - Scarborough', address: '200 Scarborough Town Centre', city: 'Toronto', province: 'ON', postalCode: 'M1P 4P4', latitude: 43.7742, longitude: -79.2578, phone: '416-290-1133' },
      { externalId: '3156', name: 'Walmart Toronto - North York', address: '4700 Keele St', city: 'Toronto', province: 'ON', postalCode: 'M3J 1P3', latitude: 43.7564, longitude: -79.4762, phone: '416-633-5566' },
    ],
    'canadian-tire': [
      { externalId: '642', name: 'Canadian Tire - Dufferin Mall', address: '900 Dufferin St', city: 'Toronto', province: 'ON', postalCode: 'M6H 4A9', latitude: 43.6568, longitude: -79.4338, phone: '416-531-2233' },
      { externalId: '626', name: 'Canadian Tire - Stockyards', address: '1900 St Clair Ave W', city: 'Toronto', province: 'ON', postalCode: 'M6N 0A1', latitude: 43.6756, longitude: -79.4826, phone: '416-656-7788' },
      { externalId: '431', name: 'Canadian Tire - Scarborough Town Centre', address: '300 Borough Dr', city: 'Toronto', province: 'ON', postalCode: 'M1P 4P5', latitude: 43.7742, longitude: -79.2578, phone: '416-290-3344' },
    ],
    'giant-tiger': [
      { externalId: '2112', name: 'Giant Tiger - Dufferin Mall', address: '900 Dufferin St', city: 'Toronto', province: 'ON', postalCode: 'M6H 4A9', latitude: 43.6568, longitude: -79.4338 },
      { externalId: '2156', name: 'Giant Tiger - Jane & Finch', address: '1911 Finch Ave W', city: 'Toronto', province: 'ON', postalCode: 'M3N 2J1', latitude: 43.7736, longitude: -79.5064 },
      { externalId: '2201', name: 'Giant Tiger - Scarborough', address: '3785 Kingston Rd', city: 'Toronto', province: 'ON', postalCode: 'M1J 3H5', latitude: 43.7534, longitude: -79.1592 },
    ],
    dollarama: [
      { externalId: '1001', name: 'Dollarama - Dufferin Mall', address: '900 Dufferin St', city: 'Toronto', province: 'ON', postalCode: 'M6H 4A9', latitude: 43.6568, longitude: -79.4338 },
      { externalId: '1002', name: 'Dollarama - Yorkdale', address: '3401 Dufferin St', city: 'Toronto', province: 'ON', postalCode: 'M6A 2T9', latitude: 43.7256, longitude: -79.4502 },
      { externalId: '1003', name: 'Dollarama - Scarborough Town Centre', address: '300 Borough Dr', city: 'Toronto', province: 'ON', postalCode: 'M1P 4P5', latitude: 43.7742, longitude: -79.2578 },
      { externalId: '1004', name: 'Dollarama - Eaton Centre', address: '220 Yonge St', city: 'Toronto', province: 'ON', postalCode: 'M5B 2H1', latitude: 43.6532, longitude: -79.3832 },
    ],
  }

  return torontoStores[chainSlug] || []
}

export async function seedMockData() {
  const { seedChains, seedCategories, saveFlyer, saveStores, expireOldFlyers } = await import('./ingestion')

  await seedChains()
  await seedCategories()
  await expireOldFlyers()

  const chainSlugs = ['walmart', 'canadian-tire', 'giant-tiger', 'dollarama']

  for (const chainSlug of chainSlugs) {
    const flyer = generateMockFlyer(chainSlug)
    await saveFlyer(chainSlug, flyer)

    const stores = generateMockStores(chainSlug)
    await saveStores(chainSlug, stores)

    console.log(`Mock data created for ${chainSlug}: ${flyer.items.length} items`)
  }
}