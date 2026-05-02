import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const secret = body.secret || request.headers.get('x-seed-secret');
    if (secret !== 'aether-arena-seed-2026') {
      return NextResponse.json({ error: 'Invalid seed secret' }, { status: 403 });
    }

    const results: string[] = [];

    // ─── A) Games ───
    const games = [
      { name: 'BGMI', slug: 'bgmi', iconUrl: '/images/games/bgmi.webp', bannerUrl: '/images/games/bgmi.webp', description: 'Battlegrounds Mobile India', maxTeamSize: 4, sortOrder: 1 },
      { name: 'Free Fire', slug: 'free-fire', iconUrl: '/images/games/freefire.webp', bannerUrl: '/images/games/freefire.webp', description: 'Garena Free Fire', maxTeamSize: 4, sortOrder: 2 },
      { name: 'COD Mobile', slug: 'cod-mobile', iconUrl: '/images/games/codm.webp', bannerUrl: '/images/games/codm.webp', description: 'Call of Duty: Mobile', maxTeamSize: 4, sortOrder: 3 },
      { name: 'Clash Royale', slug: 'clash-royale', iconUrl: '/images/games/clash-royale.webp', bannerUrl: '/images/games/clash-royale.webp', description: 'Clash Royale by Supercell', maxTeamSize: 1, sortOrder: 4 },
      { name: 'Mobile Legends: Bang Bang', slug: 'mlbb', iconUrl: '/images/games/freefire.webp', bannerUrl: '/images/games/freefire.webp', description: 'Mobile Legends: Bang Bang (MOBA)', maxTeamSize: 5, sortOrder: 5 },
      { name: 'Valorant', slug: 'valorant', iconUrl: '/images/games/codm.webp', bannerUrl: '/images/games/codm.webp', description: 'Valorant by Riot Games', maxTeamSize: 5, sortOrder: 6 },
    ];

    for (const game of games) {
      await db.game.upsert({
        where: { slug: game.slug },
        update: { name: game.name, iconUrl: game.iconUrl, bannerUrl: game.bannerUrl, description: game.description, maxTeamSize: game.maxTeamSize, sortOrder: game.sortOrder },
        create: game,
      });
    }
    results.push(`${games.length} games`);

    // ─── B) Affiliate Links ───
    const affiliates = [
      { name: 'Gaming Headset', slug: 'gaming-headset', platform: 'amazon', url: 'https://www.amazon.in/s?k=gaming+headset', description: 'Premium gaming headsets with surround sound and noise-cancelling mic for competitive gaming.', category: 'peripherals', imageUrl: '/images/affiliates/gaming-headset.webp', price: 129900, originalPrice: 249900, sortOrder: 1 },
      { name: 'Gaming Controller', slug: 'gaming-controller', platform: 'amazon', url: 'https://www.amazon.in/s?k=gaming+controller', description: 'Ergonomic gaming controllers for mobile and PC gaming with customizable buttons.', category: 'peripherals', imageUrl: '/images/affiliates/gaming-controller.webp', price: 99900, originalPrice: 199900, sortOrder: 2 },
      { name: 'Gaming Mouse', slug: 'gaming-mouse', platform: 'amazon', url: 'https://www.amazon.in/s?k=gaming+mouse', description: 'High-precision gaming mice with adjustable DPI and RGB lighting.', category: 'peripherals', imageUrl: '/images/affiliates/gaming-mouse.webp', price: 79900, originalPrice: 149900, sortOrder: 3 },
      { name: 'Mobile Gaming Trigger', slug: 'gaming-trigger', platform: 'amazon', url: 'https://www.amazon.in/s?k=mobile+gaming+trigger', description: 'Compact triggers for BGMI and Free Fire. Play like a pro on mobile!', category: 'mobile-accessories', imageUrl: '/images/affiliates/gaming-trigger.webp', price: 29900, originalPrice: 59900, sortOrder: 4 },
      { name: 'Gaming Keyboard', slug: 'gaming-keyboard', platform: 'amazon', url: 'https://www.amazon.in/s?k=gaming+keyboard+mechanical', description: 'Mechanical gaming keyboards with RGB and hot-swappable switches.', category: 'peripherals', imageUrl: '/images/affiliates/gaming-keyboard.webp', price: 249900, originalPrice: 499900, sortOrder: 5 },
      { name: 'Razer Gold Gift Card', slug: 'razer-gold', platform: 'razer', url: 'https://www.amazon.in/s?k=razer+gold+gift+card', description: 'Universal gaming currency for 1000+ games. Redeem on Razer Gold portal.', category: 'gift-cards', imageUrl: '/images/affiliates/razer-gold.webp', price: 50000, originalPrice: 50000, sortOrder: 6 },
      { name: 'Google Play Gift Card', slug: 'google-play-card', platform: 'google', url: 'https://www.amazon.in/s?k=google+play+gift+card', description: 'Google Play balance for in-app purchases across all Android games.', category: 'gift-cards', imageUrl: '/images/affiliates/google-play-card.webp', price: 50000, originalPrice: 50000, sortOrder: 7 },
    ];

    for (const a of affiliates) {
      await db.affiliateLink.upsert({
        where: { slug: a.slug },
        update: { name: a.name, platform: a.platform, url: a.url, description: a.description, category: a.category, imageUrl: a.imageUrl, price: a.price, originalPrice: a.originalPrice, sortOrder: a.sortOrder, isActive: true },
        create: { ...a, isActive: true },
      });
    }
    results.push(`${affiliates.length} affiliates`);

    // ─── C) Topup Packs ───
    await db.topupPack.deleteMany({});

    const codashopBgmi = 'https://app.codashop.com/en-in/recharge/bgmi-battlegrounds-mobile-india';
    const codashopFF = 'https://app.codashop.com/en-in/recharge/free-fire';
    const codashopCODM = 'https://app.codashop.com/en-in/recharge/call-of-duty-mobile';
    const codashopCR = 'https://app.codashop.com/en-in/recharge/clash-royale';
    const codashopMLBB = 'https://app.codashop.com/en-in/recharge/mobile-legends-bang-bang';

    const packs = [
      // BGMI UC
      { gameName: 'BGMI', gameSlug: 'bgmi', packName: '60 UC', description: 'Get 60 UC for BGMI. Instant delivery via Codashop.', price: 7500, originalPrice: 7500, affiliateUrl: codashopBgmi, imageUrl: '/images/topup/bgmi-uc.webp', isPopular: false, sortOrder: 1 },
      { gameName: 'BGMI', gameSlug: 'bgmi', packName: '325 UC', description: 'Get 325 UC for BGMI. Most popular pack!', price: 39900, originalPrice: 39900, affiliateUrl: codashopBgmi, imageUrl: '/images/topup/bgmi-uc.webp', isPopular: true, sortOrder: 2 },
      { gameName: 'BGMI', gameSlug: 'bgmi', packName: '660 UC', description: 'Get 660 UC for BGMI. Great value!', price: 74900, originalPrice: 79900, affiliateUrl: codashopBgmi, imageUrl: '/images/topup/bgmi-uc.webp', isPopular: true, sortOrder: 3 },
      { gameName: 'BGMI', gameSlug: 'bgmi', packName: '1800 UC', description: 'Get 1800 UC for BGMI. Premium pack.', price: 189900, originalPrice: 199900, affiliateUrl: codashopBgmi, imageUrl: '/images/topup/bgmi-uc.webp', isPopular: false, sortOrder: 4 },
      { gameName: 'BGMI', gameSlug: 'bgmi', packName: '3850 UC', description: 'Get 3850 UC for BGMI. Best value per UC!', price: 379900, originalPrice: 399900, affiliateUrl: codashopBgmi, imageUrl: '/images/topup/bgmi-uc.webp', isPopular: false, sortOrder: 5 },
      // Free Fire Diamonds
      { gameName: 'Free Fire', gameSlug: 'free-fire', packName: '100 Diamonds', description: 'Get 100 Diamonds for Free Fire. Instant delivery!', price: 8000, originalPrice: 8000, affiliateUrl: codashopFF, imageUrl: '/images/topup/freefire-diamonds.webp', isPopular: false, sortOrder: 6 },
      { gameName: 'Free Fire', gameSlug: 'free-fire', packName: '310 Diamonds', description: 'Get 310 Diamonds for Free Fire. Most popular!', price: 23900, originalPrice: 25000, affiliateUrl: codashopFF, imageUrl: '/images/topup/freefire-diamonds.webp', isPopular: true, sortOrder: 7 },
      { gameName: 'Free Fire', gameSlug: 'free-fire', packName: '520 Diamonds', description: 'Get 520 Diamonds for Free Fire. Great value!', price: 39900, originalPrice: 40000, affiliateUrl: codashopFF, imageUrl: '/images/topup/freefire-diamonds.webp', isPopular: true, sortOrder: 8 },
      { gameName: 'Free Fire', gameSlug: 'free-fire', packName: '1060 Diamonds', description: 'Get 1060 Diamonds for Free Fire. Premium pack.', price: 79900, originalPrice: 80000, affiliateUrl: codashopFF, imageUrl: '/images/topup/freefire-diamonds.webp', isPopular: false, sortOrder: 9 },
      { gameName: 'Free Fire', gameSlug: 'free-fire', packName: '2180 Diamonds', description: 'Get 2180 Diamonds for Free Fire. Best value!', price: 159900, originalPrice: 160000, affiliateUrl: codashopFF, imageUrl: '/images/topup/freefire-diamonds.webp', isPopular: false, sortOrder: 10 },
      // COD Mobile CP
      { gameName: 'COD Mobile', gameSlug: 'cod-mobile', packName: '80 CP', description: 'Get 80 CP for COD Mobile. Instant delivery!', price: 7900, originalPrice: 7900, affiliateUrl: codashopCODM, imageUrl: '/images/topup/codm-cp.webp', isPopular: false, sortOrder: 11 },
      { gameName: 'COD Mobile', gameSlug: 'cod-mobile', packName: '400 CP', description: 'Get 400 CP for COD Mobile. Most popular!', price: 39900, originalPrice: 39900, affiliateUrl: codashopCODM, imageUrl: '/images/topup/codm-cp.webp', isPopular: true, sortOrder: 12 },
      { gameName: 'COD Mobile', gameSlug: 'cod-mobile', packName: '800 CP', description: 'Get 800 CP for COD Mobile. Great value!', price: 74900, originalPrice: 79900, affiliateUrl: codashopCODM, imageUrl: '/images/topup/codm-cp.webp', isPopular: true, sortOrder: 13 },
      { gameName: 'COD Mobile', gameSlug: 'cod-mobile', packName: '2000 CP', description: 'Get 2000 CP for COD Mobile. Premium pack.', price: 189900, originalPrice: 199900, affiliateUrl: codashopCODM, imageUrl: '/images/topup/codm-cp.webp', isPopular: false, sortOrder: 14 },
      // Clash Royale Gems
      { gameName: 'Clash Royale', gameSlug: 'clash-royale', packName: '80 Gems', description: 'Get 80 Gems for Clash Royale. Instant delivery!', price: 7900, originalPrice: 7900, affiliateUrl: codashopCR, imageUrl: '/images/topup/clash-royale-gems.webp', isPopular: false, sortOrder: 15 },
      { gameName: 'Clash Royale', gameSlug: 'clash-royale', packName: '500 Gems', description: 'Get 500 Gems for Clash Royale. Best value!', price: 39900, originalPrice: 39900, affiliateUrl: codashopCR, imageUrl: '/images/topup/clash-royale-gems.webp', isPopular: true, sortOrder: 16 },
      // MLBB Diamonds
      { gameName: 'Mobile Legends', gameSlug: 'mlbb', packName: '86 Diamonds', description: 'Get 86 Diamonds for Mobile Legends. Instant delivery!', price: 8900, originalPrice: 8900, affiliateUrl: codashopMLBB, imageUrl: '/images/topup/mlbb-diamonds.webp', isPopular: false, sortOrder: 17 },
      { gameName: 'Mobile Legends', gameSlug: 'mlbb', packName: '172 Diamonds', description: 'Get 172 Diamonds for Mobile Legends. Popular!', price: 17900, originalPrice: 17900, affiliateUrl: codashopMLBB, imageUrl: '/images/topup/mlbb-diamonds.webp', isPopular: true, sortOrder: 18 },
      { gameName: 'Mobile Legends', gameSlug: 'mlbb', packName: '257 Diamonds', description: 'Get 257 Diamonds for Mobile Legends.', price: 26900, originalPrice: 26900, affiliateUrl: codashopMLBB, imageUrl: '/images/topup/mlbb-diamonds.webp', isPopular: false, sortOrder: 19 },
      { gameName: 'Mobile Legends', gameSlug: 'mlbb', packName: '514 Diamonds', description: 'Get 514 Diamonds for Mobile Legends. Best value!', price: 52900, originalPrice: 54900, affiliateUrl: codashopMLBB, imageUrl: '/images/topup/mlbb-diamonds.webp', isPopular: true, sortOrder: 20 },
    ];

    await db.topupPack.createMany({ data: packs, skipDuplicates: true });
    results.push(`${packs.length} topup packs`);

    // ─── D) Aether Tasks ───
    const tasks = [
      { taskKey: 'visit-codashop-bgmi', title: 'Top Up BGMI UC', description: 'Visit Codashop to buy BGMI UC at best prices', rewardAmount: 10, category: 'affiliate', resetType: 'daily', affiliateUrl: codashopBgmi, displayOrder: 1 },
      { taskKey: 'visit-codashop-ff', title: 'Top Up Free Fire Diamonds', description: 'Visit Codashop to buy Free Fire Diamonds', rewardAmount: 10, category: 'affiliate', resetType: 'daily', affiliateUrl: codashopFF, displayOrder: 2 },
      { taskKey: 'visit-codashop-codm', title: 'Top Up COD Mobile CP', description: 'Visit Codashop to buy COD Mobile CP', rewardAmount: 10, category: 'affiliate', resetType: 'daily', affiliateUrl: codashopCODM, displayOrder: 3 },
      { taskKey: 'visit-amazon-gaming', title: 'Shop Gaming Gear on Amazon', description: 'Browse gaming peripherals on Amazon India', rewardAmount: 15, category: 'affiliate', resetType: 'daily', affiliateUrl: 'https://www.amazon.in/s?k=gaming+headset+mouse+keyboard', displayOrder: 4 },
      { taskKey: 'visit-eneba-store', title: 'Buy Game Keys on Eneba', description: 'Get game keys and gift cards at discounted prices', rewardAmount: 10, category: 'affiliate', resetType: 'daily', affiliateUrl: 'https://www.eneba.com/en-in', displayOrder: 5 },
    ];

    for (const task of tasks) {
      await db.aetherTask.upsert({
        where: { taskKey: task.taskKey },
        update: { title: task.title, description: task.description, rewardAmount: task.rewardAmount, category: task.category, resetType: task.resetType, affiliateUrl: task.affiliateUrl, displayOrder: task.displayOrder, isActive: true },
        create: { ...task, isActive: true },
      });
    }
    results.push(`${tasks.length} aether tasks`);

    // ─── E) Platform Settings ───
    const settings = [
      { key: 'youtube_channel_url', value: 'https://www.youtube.com/@Aether-Arena' },
      { key: 'discord_invite_url', value: 'https://discord.gg/NpWrVkyBB' },
      { key: 'instagram_url', value: 'https://www.instagram.com/aetherarena?igsh=dGRreWFvOW5xMjlp' },
      { key: 'whatsapp_channel_url', value: 'https://whatsapp.com/channel/0029Vb7fpsUAYlUJ7Fhq7e26' },
    ];

    for (const s of settings) {
      const existing = await db.platformSetting.findUnique({ where: { key: s.key } });
      if (!existing) {
        await db.platformSetting.create({ data: s });
      }
    }
    results.push(`${settings.length} platform settings`);

    return NextResponse.json({ success: true, seeded: results });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: error.message || 'Seed failed' }, { status: 500 });
  }
}
