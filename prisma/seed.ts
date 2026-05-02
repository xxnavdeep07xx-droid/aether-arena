import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─────────────────────────────────────────────
  // A) Games
  // ─────────────────────────────────────────────
  const games = [
    { name: 'BGMI', slug: 'bgmi', iconUrl: '/images/games/bgmi.webp', bannerUrl: '/images/games/bgmi.webp', description: 'Battlegrounds Mobile India', maxTeamSize: 4, sortOrder: 1 },
    { name: 'Free Fire', slug: 'free-fire', iconUrl: '/images/games/freefire.webp', bannerUrl: '/images/games/freefire.webp', description: 'Garena Free Fire', maxTeamSize: 4, sortOrder: 2 },
    { name: 'COD Mobile', slug: 'cod-mobile', iconUrl: '/images/games/codm.webp', bannerUrl: '/images/games/codm.webp', description: 'Call of Duty: Mobile', maxTeamSize: 4, sortOrder: 3 },
    { name: 'Clash Royale', slug: 'clash-royale', iconUrl: '/images/games/clash-royale.webp', bannerUrl: '/images/games/clash-royale.webp', description: 'Clash Royale by Supercell', maxTeamSize: 1, sortOrder: 4 },
    { name: 'Mobile Legends: Bang Bang', slug: 'mlbb', iconUrl: '/images/games/freefire.webp', bannerUrl: '/images/games/freefire.webp', description: 'Mobile Legends: Bang Bang (MOBA)', maxTeamSize: 5, sortOrder: 5 },
    { name: 'Valorant', slug: 'valorant', iconUrl: '/images/games/codm.webp', bannerUrl: '/images/games/codm.webp', description: 'Valorant by Riot Games', maxTeamSize: 5, sortOrder: 6 },
  ];

  for (const game of games) {
    await prisma.game.upsert({
      where: { slug: game.slug },
      update: { name: game.name, iconUrl: game.iconUrl, bannerUrl: game.bannerUrl, description: game.description, maxTeamSize: game.maxTeamSize, sortOrder: game.sortOrder },
      create: game,
    });
  }
  console.log(`  ✅ Upserted ${games.length} games`);

  // ─────────────────────────────────────────────
  // B) Affiliate Links
  // ─────────────────────────────────────────────
  const affiliates = [
    {
      name: 'Gaming Headset',
      slug: 'gaming-headset',
      platform: 'amazon',
      url: 'https://www.amazon.in/s?k=gaming+headset',
      description: 'Premium gaming headsets with surround sound and noise-cancelling mic for competitive gaming.',
      category: 'peripherals',
      imageUrl: '/images/affiliates/gaming-headset.webp',
      price: 129900,
      originalPrice: 249900,
      sortOrder: 1,
    },
    {
      name: 'Gaming Controller',
      slug: 'gaming-controller',
      platform: 'amazon',
      url: 'https://www.amazon.in/s?k=gaming+controller',
      description: 'Ergonomic gaming controllers for mobile and PC gaming with customizable buttons.',
      category: 'peripherals',
      imageUrl: '/images/affiliates/gaming-controller.webp',
      price: 99900,
      originalPrice: 199900,
      sortOrder: 2,
    },
    {
      name: 'Gaming Mouse',
      slug: 'gaming-mouse',
      platform: 'amazon',
      url: 'https://www.amazon.in/s?k=gaming+mouse',
      description: 'High-precision gaming mice with adjustable DPI and programmable buttons.',
      category: 'peripherals',
      imageUrl: '/images/affiliates/gaming-mouse.webp',
      price: 79900,
      originalPrice: 149900,
      sortOrder: 3,
    },
    {
      name: 'Mobile Gaming Trigger',
      slug: 'gaming-trigger',
      platform: 'amazon',
      url: 'https://www.amazon.in/s?k=mobile+gaming+trigger',
      description: 'Mobile gaming triggers for BGMI, Free Fire & COD Mobile. Improve your aim and reaction time.',
      category: 'mobile-accessories',
      imageUrl: '/images/affiliates/gaming-trigger.webp',
      price: 29900,
      originalPrice: 59900,
      sortOrder: 4,
    },
    {
      name: 'Gaming Keyboard',
      slug: 'gaming-keyboard',
      platform: 'amazon',
      url: 'https://www.amazon.in/s?k=gaming+keyboard',
      description: 'Mechanical gaming keyboards with RGB lighting and fast response switches.',
      category: 'peripherals',
      imageUrl: '/images/affiliates/gaming-keyboard.webp',
      price: 249900,
      originalPrice: 499900,
      sortOrder: 5,
    },
    {
      name: 'Razer Gold Gift Card',
      slug: 'razer-gold',
      platform: 'razer',
      url: 'https://www.amazon.in/s?k=razer+gold+gift+card',
      description: 'Razer Gold gift cards for game top-ups and in-game purchases across 1000+ games.',
      category: 'gift-cards',
      imageUrl: '/images/affiliates/razer-gold.webp',
      price: 50000,
      originalPrice: 50000,
      sortOrder: 6,
    },
    {
      name: 'Google Play Gift Card',
      slug: 'google-play-card',
      platform: 'google',
      url: 'https://www.amazon.in/s?k=google+play+gift+card',
      description: 'Google Play gift cards for Android game purchases and in-app items.',
      category: 'gift-cards',
      imageUrl: '/images/affiliates/google-play-card.webp',
      price: 50000,
      originalPrice: 50000,
      sortOrder: 7,
    },
  ];

  for (const affiliate of affiliates) {
    await prisma.affiliateLink.upsert({
      where: { slug: affiliate.slug },
      update: { name: affiliate.name, platform: affiliate.platform, url: affiliate.url, description: affiliate.description, category: affiliate.category, imageUrl: affiliate.imageUrl, price: affiliate.price, originalPrice: affiliate.originalPrice, sortOrder: affiliate.sortOrder },
      create: affiliate,
    });
  }
  console.log(`  ✅ Upserted ${affiliates.length} affiliate links`);

  // ─────────────────────────────────────────────
  // C) Topup Packs
  // ─────────────────────────────────────────────
  // First, clear existing packs to avoid duplicates since there's no unique constraint beyond id
  await prisma.topupPack.deleteMany({});
  console.log('  🗑️  Cleared existing topup packs');

  const topupPacks = [
    // BGMI UC packs
    { gameName: 'BGMI', gameSlug: 'bgmi', packName: '60 UC', description: 'Get 60 UC for BGMI. Instant delivery via Codashop.', price: 7500, originalPrice: 7500, affiliateUrl: 'https://app.codashop.com/en-in/recharge/bgmi-battlegrounds-mobile-india', imageUrl: '/images/topup/bgmi-uc.webp', isPopular: false, sortOrder: 1 },
    { gameName: 'BGMI', gameSlug: 'bgmi', packName: '325 UC', description: 'Get 325 UC for BGMI. Instant delivery via Codashop.', price: 39900, originalPrice: 39900, affiliateUrl: 'https://app.codashop.com/en-in/recharge/bgmi-battlegrounds-mobile-india', imageUrl: '/images/topup/bgmi-uc.webp', isPopular: true, sortOrder: 2 },
    { gameName: 'BGMI', gameSlug: 'bgmi', packName: '660 UC', description: 'Get 660 UC for BGMI. Instant delivery via Codashop.', price: 74900, originalPrice: 79900, affiliateUrl: 'https://app.codashop.com/en-in/recharge/bgmi-battlegrounds-mobile-india', imageUrl: '/images/topup/bgmi-uc.webp', isPopular: true, sortOrder: 3 },
    { gameName: 'BGMI', gameSlug: 'bgmi', packName: '1800 UC', description: 'Get 1800 UC for BGMI. Instant delivery via Codashop.', price: 189900, originalPrice: 199900, affiliateUrl: 'https://app.codashop.com/en-in/recharge/bgmi-battlegrounds-mobile-india', imageUrl: '/images/topup/bgmi-uc.webp', isPopular: false, sortOrder: 4 },
    { gameName: 'BGMI', gameSlug: 'bgmi', packName: '3850 UC', description: 'Get 3850 UC for BGMI. Instant delivery via Codashop.', price: 379900, originalPrice: 399900, affiliateUrl: 'https://app.codashop.com/en-in/recharge/bgmi-battlegrounds-mobile-india', imageUrl: '/images/topup/bgmi-uc.webp', isPopular: false, sortOrder: 5 },

    // Free Fire Diamond packs
    { gameName: 'Free Fire', gameSlug: 'free-fire', packName: '100 Diamonds', description: 'Get 100 Diamonds for Free Fire. Instant delivery via Codashop.', price: 8000, originalPrice: 8000, affiliateUrl: 'https://app.codashop.com/en-in/recharge/free-fire', imageUrl: '/images/topup/freefire-diamonds.webp', isPopular: false, sortOrder: 6 },
    { gameName: 'Free Fire', gameSlug: 'free-fire', packName: '310 Diamonds', description: 'Get 310 Diamonds for Free Fire. Instant delivery via Codashop.', price: 23900, originalPrice: 25000, affiliateUrl: 'https://app.codashop.com/en-in/recharge/free-fire', imageUrl: '/images/topup/freefire-diamonds.webp', isPopular: true, sortOrder: 7 },
    { gameName: 'Free Fire', gameSlug: 'free-fire', packName: '520 Diamonds', description: 'Get 520 Diamonds for Free Fire. Instant delivery via Codashop.', price: 39900, originalPrice: 40000, affiliateUrl: 'https://app.codashop.com/en-in/recharge/free-fire', imageUrl: '/images/topup/freefire-diamonds.webp', isPopular: true, sortOrder: 8 },
    { gameName: 'Free Fire', gameSlug: 'free-fire', packName: '1060 Diamonds', description: 'Get 1060 Diamonds for Free Fire. Instant delivery via Codashop.', price: 79900, originalPrice: 80000, affiliateUrl: 'https://app.codashop.com/en-in/recharge/free-fire', imageUrl: '/images/topup/freefire-diamonds.webp', isPopular: false, sortOrder: 9 },
    { gameName: 'Free Fire', gameSlug: 'free-fire', packName: '2180 Diamonds', description: 'Get 2180 Diamonds for Free Fire. Instant delivery via Codashop.', price: 159900, originalPrice: 160000, affiliateUrl: 'https://app.codashop.com/en-in/recharge/free-fire', imageUrl: '/images/topup/freefire-diamonds.webp', isPopular: false, sortOrder: 10 },

    // COD Mobile CP packs
    { gameName: 'COD Mobile', gameSlug: 'cod-mobile', packName: '80 CP', description: 'Get 80 CP for COD Mobile. Instant delivery via Codashop.', price: 7900, originalPrice: 7900, affiliateUrl: 'https://app.codashop.com/en-in/recharge/call-of-duty-mobile', imageUrl: '/images/topup/codm-cp.webp', isPopular: false, sortOrder: 11 },
    { gameName: 'COD Mobile', gameSlug: 'cod-mobile', packName: '400 CP', description: 'Get 400 CP for COD Mobile. Instant delivery via Codashop.', price: 39900, originalPrice: 39900, affiliateUrl: 'https://app.codashop.com/en-in/recharge/call-of-duty-mobile', imageUrl: '/images/topup/codm-cp.webp', isPopular: true, sortOrder: 12 },
    { gameName: 'COD Mobile', gameSlug: 'cod-mobile', packName: '800 CP', description: 'Get 800 CP for COD Mobile. Instant delivery via Codashop.', price: 74900, originalPrice: 79900, affiliateUrl: 'https://app.codashop.com/en-in/recharge/call-of-duty-mobile', imageUrl: '/images/topup/codm-cp.webp', isPopular: true, sortOrder: 13 },
    { gameName: 'COD Mobile', gameSlug: 'cod-mobile', packName: '2000 CP', description: 'Get 2000 CP for COD Mobile. Instant delivery via Codashop.', price: 189900, originalPrice: 199900, affiliateUrl: 'https://app.codashop.com/en-in/recharge/call-of-duty-mobile', imageUrl: '/images/topup/codm-cp.webp', isPopular: false, sortOrder: 14 },

    // Clash Royale gems
    { gameName: 'Clash Royale', gameSlug: 'clash-royale', packName: '80 Gems', description: 'Get 80 Gems for Clash Royale. Instant delivery via Codashop.', price: 7900, originalPrice: 7900, affiliateUrl: 'https://app.codashop.com/en-in/recharge/clash-royale', imageUrl: '/images/topup/clash-royale-gems.webp', isPopular: false, sortOrder: 15 },
    { gameName: 'Clash Royale', gameSlug: 'clash-royale', packName: '500 Gems', description: 'Get 500 Gems for Clash Royale. Instant delivery via Codashop.', price: 39900, originalPrice: 39900, affiliateUrl: 'https://app.codashop.com/en-in/recharge/clash-royale', imageUrl: '/images/topup/clash-royale-gems.webp', isPopular: true, sortOrder: 16 },

    // MLBB Diamonds
    { gameName: 'Mobile Legends', gameSlug: 'mlbb', packName: '86 Diamonds', description: 'Get 86 Diamonds for Mobile Legends. Instant delivery via Codashop.', price: 8900, originalPrice: 8900, affiliateUrl: 'https://app.codashop.com/en-in/recharge/mobile-legends-bang-bang', imageUrl: '/images/topup/mlbb-diamonds.webp', isPopular: false, sortOrder: 17 },
    { gameName: 'Mobile Legends', gameSlug: 'mlbb', packName: '172 Diamonds', description: 'Get 172 Diamonds for Mobile Legends. Instant delivery via Codashop.', price: 17900, originalPrice: 17900, affiliateUrl: 'https://app.codashop.com/en-in/recharge/mobile-legends-bang-bang', imageUrl: '/images/topup/mlbb-diamonds.webp', isPopular: true, sortOrder: 18 },
    { gameName: 'Mobile Legends', gameSlug: 'mlbb', packName: '257 Diamonds', description: 'Get 257 Diamonds for Mobile Legends. Instant delivery via Codashop.', price: 26900, originalPrice: 26900, affiliateUrl: 'https://app.codashop.com/en-in/recharge/mobile-legends-bang-bang', imageUrl: '/images/topup/mlbb-diamonds.webp', isPopular: false, sortOrder: 19 },
    { gameName: 'Mobile Legends', gameSlug: 'mlbb', packName: '514 Diamonds', description: 'Get 514 Diamonds for Mobile Legends. Instant delivery via Codashop.', price: 52900, originalPrice: 54900, affiliateUrl: 'https://app.codashop.com/en-in/recharge/mobile-legends-bang-bang', imageUrl: '/images/topup/mlbb-diamonds.webp', isPopular: true, sortOrder: 20 },
  ];

  await prisma.topupPack.createMany({ data: topupPacks });
  console.log(`  ✅ Created ${topupPacks.length} topup packs`);

  // ─────────────────────────────────────────────
  // D) Aether Tasks
  // ─────────────────────────────────────────────
  const tasks = [
    {
      taskKey: 'visit-codashop-bgmi',
      title: 'Top Up BGMI UC',
      description: 'Visit Codashop to buy BGMI UC at best prices',
      rewardAmount: 10,
      category: 'affiliate',
      resetType: 'daily',
      affiliateUrl: 'https://app.codashop.com/en-in/recharge/bgmi-battlegrounds-mobile-india',
      displayOrder: 1,
    },
    {
      taskKey: 'visit-codashop-ff',
      title: 'Top Up Free Fire Diamonds',
      description: 'Visit Codashop to buy Free Fire Diamonds',
      rewardAmount: 10,
      category: 'affiliate',
      resetType: 'daily',
      affiliateUrl: 'https://app.codashop.com/en-in/recharge/free-fire',
      displayOrder: 2,
    },
    {
      taskKey: 'visit-codashop-codm',
      title: 'Top Up COD Mobile CP',
      description: 'Visit Codashop to buy COD Mobile CP',
      rewardAmount: 10,
      category: 'affiliate',
      resetType: 'daily',
      affiliateUrl: 'https://app.codashop.com/en-in/recharge/call-of-duty-mobile',
      displayOrder: 3,
    },
    {
      taskKey: 'visit-amazon-gaming',
      title: 'Shop Gaming Gear on Amazon',
      description: 'Browse gaming peripherals on Amazon India',
      rewardAmount: 15,
      category: 'affiliate',
      resetType: 'daily',
      affiliateUrl: 'https://www.amazon.in/s?k=gaming+headset+mouse+keyboard',
      displayOrder: 4,
    },
    {
      taskKey: 'visit-eneba-store',
      title: 'Buy Game Keys on Eneba',
      description: 'Get game keys and gift cards at discounted prices',
      rewardAmount: 10,
      category: 'affiliate',
      resetType: 'daily',
      affiliateUrl: 'https://www.eneba.com/en-in',
      displayOrder: 5,
    },
  ];

  for (const task of tasks) {
    await prisma.aetherTask.upsert({
      where: { taskKey: task.taskKey },
      update: { title: task.title, description: task.description, rewardAmount: task.rewardAmount, category: task.category, resetType: task.resetType, affiliateUrl: task.affiliateUrl, displayOrder: task.displayOrder },
      create: task,
    });
  }
  console.log(`  ✅ Upserted ${tasks.length} aether tasks`);

  // ─────────────────────────────────────────────
  // E) Platform Settings (social URLs)
  // ─────────────────────────────────────────────
  const settings = [
    { key: 'youtube_channel_url', value: 'https://www.youtube.com/@Aether-Arena' },
    { key: 'discord_invite_url', value: 'https://discord.gg/NpWrVkyBB' },
    { key: 'instagram_url', value: 'https://www.instagram.com/aetherarena?igsh=dGRreWFvOW5xMjlp' },
    { key: 'whatsapp_channel_url', value: 'https://whatsapp.com/channel/0029Vb7fpsUAYlUJ7Fhq7e26' },
  ];

  for (const setting of settings) {
    const existing = await prisma.platformSetting.findUnique({ where: { key: setting.key } });
    if (!existing) {
      await prisma.platformSetting.create({ data: setting });
      console.log(`  ✅ Created setting: ${setting.key}`);
    } else {
      console.log(`  ⏭️  Setting already exists: ${setting.key}`);
    }
  }

  console.log('\n🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
