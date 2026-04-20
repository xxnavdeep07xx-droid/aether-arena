import { db } from '@/lib/db'

const packs = [
  { gameName: 'BGMI', gameSlug: 'bgmi', packName: '60 UC', description: 'Basic in-game currency pack', price: 7500, originalPrice: 8000, imageUrl: '', affiliateUrl: 'https://www.codashop.com/in/bgmi', isPopular: true, isActive: true, sortOrder: 1 },
  { gameName: 'BGMI', gameSlug: 'bgmi', packName: '325 UC', description: 'Popular mid-tier pack', price: 38000, originalPrice: 40000, imageUrl: '', affiliateUrl: 'https://www.codashop.com/in/bgmi', isPopular: false, isActive: true, sortOrder: 2 },
  { gameName: 'Free Fire', gameSlug: 'freefire', packName: '100 Diamonds', description: 'Starter diamond pack', price: 8000, originalPrice: 9000, imageUrl: '', affiliateUrl: 'https://www.codashop.com/in/freefire', isPopular: true, isActive: true, sortOrder: 3 },
  { gameName: 'Free Fire', gameSlug: 'freefire', packName: '310 Diamonds', description: 'Best value diamond pack', price: 24000, originalPrice: 27000, imageUrl: '', affiliateUrl: 'https://www.codashop.com/in/freefire', isPopular: false, isActive: true, sortOrder: 4 },
  { gameName: 'COD Mobile', gameSlug: 'codm', packName: '80 CP', description: 'Call of Duty credit points', price: 7500, originalPrice: 8000, imageUrl: '', affiliateUrl: 'https://www.codashop.com/in/call-of-duty-mobile', isPopular: false, isActive: true, sortOrder: 5 },
  { gameName: 'COD Mobile', gameSlug: 'codm', packName: '400 CP', description: 'Premium credit pack', price: 35000, originalPrice: 40000, imageUrl: '', affiliateUrl: 'https://www.codashop.com/in/call-of-duty-mobile', isPopular: true, isActive: true, sortOrder: 6 },
  { gameName: 'Clash Royale', gameSlug: 'clash-royale', packName: '80 Gems', description: 'Basic gem pack for Clash Royale', price: 7500, originalPrice: 8000, imageUrl: '', affiliateUrl: 'https://www.codashop.com/in/clash-royale', isPopular: false, isActive: true, sortOrder: 7 },
  { gameName: 'PUBG New State', gameSlug: 'pubg-new-state', packName: '60 NC', description: 'New State in-game currency', price: 7500, originalPrice: 8000, imageUrl: '', affiliateUrl: 'https://www.codashop.com/in/pubg-new-state', isPopular: false, isActive: true, sortOrder: 8 },
  { gameName: 'Mobile Legends', gameSlug: 'mobile-legends', packName: '86 Diamonds', description: 'Mobile Legends diamond pack', price: 7500, originalPrice: 8000, imageUrl: '', affiliateUrl: 'https://www.codashop.com/in/mobile-legends', isPopular: true, isActive: true, sortOrder: 9 },
  { gameName: 'Mobile Legends', gameSlug: 'mobile-legends', packName: '172 Diamonds', description: 'Premium diamond pack', price: 15000, originalPrice: 16000, imageUrl: '', affiliateUrl: 'https://www.codashop.com/in/mobile-legends', isPopular: false, isActive: true, sortOrder: 10 },
]

async function seed() {
  console.log('Seeding top-up packs...')

  for (const pack of packs) {
    const existing = await db.topupPack.findFirst({
      where: { gameSlug: pack.gameSlug, packName: pack.packName },
    })
    if (!existing) {
      await db.topupPack.create({ data: pack })
      console.log(`  Created: ${pack.gameName} - ${pack.packName}`)
    } else {
      console.log(`  Skipped (exists): ${pack.gameName} - ${pack.packName}`)
    }
  }

  console.log('Done!')
}

seed().catch(console.error)
