import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ============================================
// Seed Data
// ============================================

const GAMES = [
  {
    name: "Free Fire",
    slug: "free-fire",
    iconUrl: "/images/games/free-fire-icon.png",
    bannerUrl: "/images/games/free-fire-banner.png",
    maxTeamSize: 4,
    description:
      "Garena Free Fire is a battle royale game where 50 players fight for survival on a remote island.",
    isActive: true,
    sortOrder: 1,
  },
  {
    name: "BGMI",
    slug: "bgmi",
    iconUrl: "/images/games/bgmi-icon.png",
    bannerUrl: "/images/games/bgmi-banner.png",
    maxTeamSize: 4,
    description:
      "Battlegrounds Mobile India (BGMI) is an Indian version of PUBG Mobile, a popular battle royale game.",
    isActive: true,
    sortOrder: 2,
  },
  {
    name: "COD Mobile",
    slug: "cod-mobile",
    iconUrl: "/images/games/cod-mobile-icon.png",
    bannerUrl: "/images/games/cod-mobile-banner.png",
    maxTeamSize: 4,
    description:
      "Call of Duty: Mobile brings the iconic COD experience to mobile with multiplayer and battle royale modes.",
    isActive: true,
    sortOrder: 3,
  },
  {
    name: "Minecraft",
    slug: "minecraft",
    iconUrl: "/images/games/minecraft-icon.png",
    bannerUrl: "/images/games/minecraft-banner.png",
    maxTeamSize: 4,
    description:
      "Minecraft is a sandbox video game where players explore, build, and survive in block-based worlds.",
    isActive: true,
    sortOrder: 4,
  },
  {
    name: "Pokemon Go",
    slug: "pokemon-go",
    iconUrl: "/images/games/pokemon-go-icon.png",
    bannerUrl: "/images/games/pokemon-go-banner.png",
    maxTeamSize: 1,
    description:
      "Pokémon GO is an augmented reality mobile game where players catch virtual Pokémon in the real world.",
    isActive: true,
    sortOrder: 5,
  },
];

const PLATFORM_SETTINGS = [
  {
    key: "league_thresholds",
    value: JSON.stringify({
      bronze_min: 0,
      silver_min: 100,
      gold_min: 300,
      platinum_min: 600,
      diamond_min: 1000,
      master_min: 1500,
      grandmaster_min: 2000,
      legend_min: 2500,
    }),
  },
  {
    key: "league_points_per_win",
    value: "25",
  },
  {
    key: "league_points_per_kill",
    value: "2",
  },
  {
    key: "league_points_per_top5",
    value: "10",
  },
  {
    key: "league_points_per_participation",
    value: "5",
  },
  {
    key: "upi_id",
    value: "aetherarena@upi",
  },
  {
    key: "platform_name",
    value: "Aether Arena",
  },
];

const ADMIN_PROFILE = {
  username: "aether_admin",
  displayName: "Aether Arena",
  bio: "Official admin account for Aether Arena gaming tournament platform.",
  isAdmin: true,
  league: "legend",
  leaguePoints: 3000,
};

const SAMPLE_PLAYERS = [
  {
    username: "shadow_striker",
    displayName: "Shadow Striker",
    bio: "BGMI pro player. Top frag every game.",
    league: "diamond",
    leaguePoints: 1250,
    totalTournamentsPlayed: 15,
    totalWins: 4,
    totalKills: 180,
    totalDeaths: 95,
    totalPrizeWon: 3200,
  },
  {
    username: "night_fury_99",
    displayName: "Night Fury",
    bio: "Free Fire enthusiast. Squad leader.",
    league: "platinum",
    leaguePoints: 780,
    totalTournamentsPlayed: 10,
    totalWins: 2,
    totalKills: 120,
    totalDeaths: 78,
    totalPrizeWon: 1500,
  },
  {
    username: "blaze_gunner",
    displayName: "Blaze Gunner",
    bio: "COD Mobile warrior. Sniping is my thing.",
    league: "gold",
    leaguePoints: 420,
    totalTournamentsPlayed: 8,
    totalWins: 1,
    totalKills: 65,
    totalDeaths: 55,
    totalPrizeWon: 600,
  },
  {
    username: "pixel_craft",
    displayName: "Pixel Craft",
    bio: "Minecraft builder & PVPer. Building empires since 2019.",
    league: "silver",
    leaguePoints: 180,
    totalTournamentsPlayed: 5,
    totalWins: 1,
    totalKills: 30,
    totalDeaths: 25,
    totalPrizeWon: 200,
  },
  {
    username: "phantom_rider",
    displayName: "Phantom Rider",
    bio: "All-rounder gamer. Multi-game competitor.",
    league: "gold",
    leaguePoints: 550,
    totalTournamentsPlayed: 12,
    totalWins: 3,
    totalKills: 95,
    totalDeaths: 70,
    totalPrizeWon: 1100,
  },
  {
    username: "vortex_x",
    displayName: "Vortex X",
    bio: "New to competitive but hungry for wins.",
    league: "bronze",
    leaguePoints: 60,
    totalTournamentsPlayed: 3,
    totalWins: 0,
    totalKills: 15,
    totalDeaths: 20,
    totalPrizeWon: 0,
  },
];

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(20, 0, 0, 0);
  return d;
}

function hoursFromNow(hours: number): Date {
  const d = new Date();
  d.setHours(d.getHours() + hours);
  return d;
}

const SAMPLE_TOURNAMENTS = [
  {
    title: "New Year Special - All Games",
    description:
      "Celebrate the New Year with an epic multi-game tournament! Open to all skill levels. Join the biggest event of the season with exciting prizes!",
    gameSlug: "bgmi",
    coverImageUrl: "/images/tournaments/new-year-special.jpg",
    format: "custom",
    entryFee: 0,
    prizePool: 250,
    maxPlayers: 200,
    status: "registration_open",
    matchMode: "Battle Royale",
    map: "Erangel",
    isFeatured: true,
    registrationStart: daysFromNow(-2),
    registrationEnd: daysFromNow(1),
    startTime: daysFromNow(2),
    endTime: daysFromNow(2),
  },
  {
    title: "BGMI Pro League S1",
    description:
      "The premier BGMI competitive league. Top squads battle it out for glory and cash prizes. Season 1 features 5 rounds of intense Battle Royale action.",
    gameSlug: "bgmi",
    coverImageUrl: "/images/tournaments/bgmi-pro-league.jpg",
    format: "squad",
    entryFee: 100,
    prizePool: 1000,
    maxPlayers: 100,
    status: "in_progress",
    matchMode: "Squad Battle Royale",
    map: "Erangel",
    isFeatured: true,
    registrationStart: daysFromNow(-7),
    registrationEnd: daysFromNow(-1),
    startTime: daysFromNow(0),
    endTime: daysFromNow(7),
  },
  {
    title: "Free Fire Friday Frenzy",
    description:
      "Every Friday is a Free Fire Frenzy! Jump in for fast-paced solo action. Free entry, real prizes. What are you waiting for?",
    gameSlug: "free-fire",
    coverImageUrl: "/images/tournaments/ff-friday.jpg",
    format: "solo",
    entryFee: 0,
    prizePool: 50,
    maxPlayers: 50,
    status: "registration_open",
    matchMode: "Solo Battle Royale",
    map: "Bermuda",
    isFeatured: true,
    registrationStart: daysFromNow(-1),
    registrationEnd: daysFromNow(4),
    startTime: daysFromNow(5),
    endTime: daysFromNow(5),
  },
  {
    title: "Weekend Warrior Cup",
    description:
      "Squad up and dominate every weekend! This recurring tournament tests your team coordination and individual skills across multiple rounds.",
    gameSlug: "bgmi",
    coverImageUrl: "/images/tournaments/weekend-warrior.jpg",
    format: "squad",
    entryFee: 50,
    prizePool: 200,
    maxPlayers: 100,
    status: "registration_open",
    matchMode: "Squad TPP",
    map: "Sanhok",
    isFeatured: false,
    registrationStart: daysFromNow(-1),
    registrationEnd: daysFromNow(4),
    startTime: daysFromNow(5),
    endTime: daysFromNow(5),
  },
  {
    title: "Quick Match Monday",
    description:
      "Start your week with a bang! Quick solo matches every Monday. Free entry and instant action. Perfect for warming up your aim.",
    gameSlug: "bgmi",
    coverImageUrl: "/images/tournaments/quick-match.jpg",
    format: "solo",
    entryFee: 0,
    prizePool: 30,
    maxPlayers: 50,
    status: "registration_open",
    matchMode: "Solo FPP",
    map: "Miramar",
    isFeatured: false,
    registrationStart: daysFromNow(-1),
    registrationEnd: daysFromNow(2),
    startTime: daysFromNow(3),
    endTime: daysFromNow(3),
  },
  {
    title: "Solo Showdown - Free Fire",
    description:
      "The ultimate Free Fire solo tournament. Prove you are the best lone wolf on the battlefield. Top 3 win cash prizes!",
    gameSlug: "free-fire",
    coverImageUrl: "/images/tournaments/ff-solo-showdown.jpg",
    format: "solo",
    entryFee: 20,
    prizePool: 100,
    maxPlayers: 50,
    status: "completed",
    matchMode: "Solo Battle Royale",
    map: "Kalahari",
    isFeatured: false,
    registrationStart: daysFromNow(-14),
    registrationEnd: daysFromNow(-8),
    startTime: daysFromNow(-7),
    endTime: daysFromNow(-7),
  },
  {
    title: "Minecraft Build Battle",
    description:
      "Show off your creativity in our Minecraft Build Battle! Build the best structure based on the theme within the time limit. Judges decide the winner!",
    gameSlug: "minecraft",
    coverImageUrl: "/images/tournaments/mc-build-battle.jpg",
    format: "solo",
    entryFee: 0,
    prizePool: 20,
    maxPlayers: 30,
    status: "registration_open",
    matchMode: "Creative",
    map: "Flat World",
    isFeatured: false,
    registrationStart: daysFromNow(-1),
    registrationEnd: daysFromNow(5),
    startTime: daysFromNow(6),
    endTime: daysFromNow(6),
  },
  {
    title: "COD Mobile Clash",
    description:
      "Duo up and clash in COD Mobile! Team up with a partner and dominate the battlefield in this exciting duo tournament.",
    gameSlug: "cod-mobile",
    coverImageUrl: "/images/tournaments/cod-clash.jpg",
    format: "duo",
    entryFee: 30,
    prizePool: 150,
    maxPlayers: 60,
    status: "registration_open",
    matchMode: "Duo MP",
    map: "Various",
    isFeatured: false,
    registrationStart: daysFromNow(0),
    registrationEnd: daysFromNow(5),
    startTime: daysFromNow(6),
    endTime: daysFromNow(6),
  },
];

const SAMPLE_STREAM_SCHEDULES = [
  {
    title: "BGMI Pro League S1 - Live!",
    description:
      "Watch the top BGMI squads compete live in Season 1 of the Pro League! Commentary and analysis throughout.",
    tournamentTitle: "BGMI Pro League S1",
    scheduledStart: daysFromNow(0),
    scheduledEnd: daysFromNow(0),
    platform: "youtube",
    streamUrl: "https://youtube.com/watch?v=aether-bgmi-pro-s1",
    thumbnailUrl: "/images/streams/bgmi-pro-thumb.jpg",
    status: "live",
    isFeatured: true,
  },
  {
    title: "Free Fire Friday - Preview Stream",
    description:
      "Join us for a preview stream of this week's Free Fire Friday Frenzy! We'll discuss rules, prize structure, and play some warm-up matches.",
    tournamentTitle: "Free Fire Friday Frenzy",
    scheduledStart: daysFromNow(4),
    scheduledEnd: daysFromNow(4),
    platform: "youtube",
    streamUrl: "https://youtube.com/watch?v=aether-ff-preview",
    thumbnailUrl: "/images/streams/ff-friday-thumb.jpg",
    status: "scheduled",
    isFeatured: true,
  },
  {
    title: "Weekend Warrior Cup - Kickoff",
    description:
      "Kickoff stream for the Weekend Warrior Cup! Team introductions, strategy breakdowns, and live countdown to the first match.",
    tournamentTitle: "Weekend Warrior Cup",
    scheduledStart: daysFromNow(4),
    scheduledEnd: daysFromNow(4),
    platform: "loco",
    streamUrl: "https://loco.gg/streamers/aether-arena",
    thumbnailUrl: "/images/streams/ww-kickoff-thumb.jpg",
    status: "scheduled",
    isFeatured: false,
  },
];

const SAMPLE_AFFILIATE_LINKS = [
  {
    name: "Razer DeathAdder Gaming Mouse",
    platform: "amazon",
    url: "https://amazon.in/dp/B07CMQBWG6?tag=aetherarena-21",
    slug: "razer-deathadder-mouse",
    description:
      "The iconic Razer DeathAdder ergonomic gaming mouse with 16,000 DPI optical sensor and customizable Chroma RGB lighting.",
    category: "peripherals",
    imageUrl: "/images/affiliates/razer-deathadder.jpg",
    price: 1299,
    originalPrice: 2499,
    isActive: true,
    sortOrder: 1,
  },
  {
    name: "BoAt Rockerz 450 Wireless Headphone",
    platform: "amazon",
    url: "https://amazon.in/dp/B071Z46QSG?tag=aetherarena-21",
    slug: "boat-rockerz-450-headphone",
    description:
      "BoAt Rockerz 450 wireless over-ear headphone with 40mm drivers, 15-hour battery, and padded ear cushions.",
    category: "peripherals",
    imageUrl: "/images/affiliates/boat-rockerz-450.jpg",
    price: 1099,
    originalPrice: 2990,
    isActive: true,
    sortOrder: 2,
  },
  {
    name: "Free Fire 1080 Diamonds",
    platform: "codashop",
    url: "https://www.codashop.com/in/free-fire?ref=aetherarena",
    slug: "free-fire-1080-diamonds",
    description:
      "Top up 1080 Diamonds for Garena Free Fire. Instant delivery via player ID. Includes exclusive bonus items.",
    category: "in-game-currency",
    imageUrl: "/images/affiliates/ff-diamonds.jpg",
    price: 799,
    originalPrice: 1080,
    isActive: true,
    sortOrder: 3,
  },
  {
    name: "BGMI UC 660 Top-Up",
    platform: "codashop",
    url: "https://www.codashop.com/in/bgmi?ref=aetherarena",
    slug: "bgmi-uc-660-topup",
    description:
      "Top up 660 UC (Unknown Cash) for Battlegrounds Mobile India. Fast and secure delivery to your BGMI account.",
    category: "in-game-currency",
    imageUrl: "/images/affiliates/bgmi-uc.jpg",
    price: 799,
    originalPrice: 950,
    isActive: true,
    sortOrder: 4,
  },
  {
    name: "RedGear MP44 Mechanical Keyboard",
    platform: "flipkart",
    url: "https://flipkart.com/rk/redgear-mp44?affid=aetherarena",
    slug: "redgear-mp44-keyboard",
    description:
      "RedGear MP44 mechanical gaming keyboard with Outemu Blue switches, RGB backlight, and floating key design.",
    category: "peripherals",
    imageUrl: "/images/affiliates/redgear-mp44.jpg",
    price: 999,
    originalPrice: 1999,
    isActive: true,
    sortOrder: 5,
  },
];

const SAMPLE_NOTIFICATIONS = [
  {
    title: "Registration Confirmed!",
    message:
      "Your registration for 'BGMI Pro League S1' has been confirmed. Please check your email for match details and room credentials. Good luck!",
    type: "registration",
    link: "/tournaments/bgmi-pro-league-s1",
    isRead: false,
  },
  {
    title: "Tournament Starting Soon!",
    message:
      "'Free Fire Friday Frenzy' starts in 2 hours! Make sure your game is updated and you're ready. Room ID will be shared 30 minutes before start.",
    type: "reminder",
    link: "/tournaments/ff-friday-frenzy",
    isRead: false,
  },
  {
    title: "Prize Credited! 🎉",
    message:
      "Congratulations! You won ₹100 prize from 'Solo Showdown - Free Fire'. The amount has been credited to your wallet.",
    type: "prize",
    link: "/profile/wallet",
    isRead: true,
  },
  {
    title: "New System Update",
    message:
      "Aether Arena has been updated with new features including improved matchmaking, enhanced leaderboard, and bug fixes. Check out what's new!",
    type: "system",
    link: "/announcements",
    isRead: true,
  },
];

// ============================================
// Seed Function
// ============================================

async function main() {
  console.log("🚀 Starting Aether Arena database seed...\n");

  // 1. Clear existing data
  console.log("🗑️  Clearing existing data...");
  await prisma.matchParticipant.deleteMany();
  await prisma.match.deleteMany();
  await prisma.tournamentRegistration.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.streamSchedule.deleteMany();
  await prisma.leaderboard.deleteMany();
  await prisma.affiliateLink.deleteMany();
  await prisma.tournament.deleteMany();
  await prisma.platformSetting.deleteMany();
  await prisma.account.deleteMany();
  await prisma.accountCredential.deleteMany();
  await prisma.session.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.game.deleteMany();
  console.log("✅ Existing data cleared.\n");

  // 2. Seed Games
  console.log("🎮 Seeding games...");
  const games: Record<string, { id: string }> = {};
  for (const game of GAMES) {
    const created = await prisma.game.create({ data: game });
    games[game.slug] = { id: created.id };
    console.log(`   ✓ ${game.name} (${created.id})`);
  }
  console.log("");

  // 3. Seed Platform Settings
  console.log("⚙️  Seeding platform settings...");
  for (const setting of PLATFORM_SETTINGS) {
    await prisma.platformSetting.create({ data: setting });
    console.log(`   ✓ ${setting.key}`);
  }
  console.log("");

  // 4. Seed Admin Profile
  console.log("👤 Seeding admin profile...");
  const admin = await prisma.profile.create({
    data: ADMIN_PROFILE,
  });
  console.log(`   ✓ ${admin.username} (${admin.id})\n`);

  // 5. Seed Sample Players
  console.log("👥 Seeding sample players...");
  const players: { id: string; username: string }[] = [];
  for (const playerData of SAMPLE_PLAYERS) {
    const player = await prisma.profile.create({ data: playerData });
    players.push({ id: player.id, username: player.username });
    console.log(`   ✓ ${player.username} (${player.league}, ${player.leaguePoints} LP)`);
  }
  console.log("");

  // 6. Seed Tournaments
  console.log("🏆 Seeding tournaments...");
  const tournaments: Record<string, { id: string }> = {};
  for (const tData of SAMPLE_TOURNAMENTS) {
    const gameId = games[tData.gameSlug]?.id;
    if (!gameId) {
      console.error(`   ✗ Game not found for slug: ${tData.gameSlug}`);
      continue;
    }

    const startTime = tData.startTime ? new Date(tData.startTime) : null;
    const endTime = tData.endTime ? new Date(tData.endTime) : null;
    const registrationEnd = tData.registrationEnd
      ? new Date(tData.registrationEnd)
      : null;

    // Compute registeredPlayers based on status
    let registeredPlayers = 0;
    if (tData.status === "in_progress" || tData.status === "completed") {
      registeredPlayers = Math.floor(tData.maxPlayers * 0.85);
    } else if (tData.status === "registration_open") {
      registeredPlayers = Math.floor(Math.random() * tData.maxPlayers * 0.4);
    }

    const tournament = await prisma.tournament.create({
      data: {
        title: tData.title,
        description: tData.description,
        gameId,
        coverImageUrl: tData.coverImageUrl,
        format: tData.format,
        entryFee: tData.entryFee,
        prizePool: tData.prizePool,
        maxPlayers: tData.maxPlayers,
        registeredPlayers,
        status: tData.status,
        matchMode: tData.matchMode,
        map: tData.map,
        isFeatured: tData.isFeatured,
        registrationStart: new Date(tData.registrationStart),
        registrationEnd,
        startTime,
        endTime,
        createdById: admin.id,
        // Stream info for featured tournaments
        ...(tData.isFeatured && {
          streamScheduled: true,
          streamPlatform: "youtube",
        }),
      },
    });
    tournaments[tData.title] = { id: tournament.id };
    const feeLabel = tData.entryFee === 0 ? "FREE" : `₹${tData.entryFee}`;
    console.log(
      `   ✓ "${tData.title}" [${tData.status}] (${feeLabel} entry, ₹${tData.prizePool} prize, ${registeredPlayers}/${tData.maxPlayers} registered)`
    );
  }
  console.log("");

  // 7. Seed Tournament Registrations for players
  console.log("📝 Seeding tournament registrations...");
  let regCount = 0;
  const openTournamentIds = Object.values(tournaments).map((t) => t.id);

  // Assign players to various tournaments
  const registrationAssignments = [
    // Tournament index -> player indices
    [0, 1, 2, 3, 4, 5], // New Year Special
    [1, 0, 2, 4], // BGMI Pro League
    [2, 1, 5], // FF Friday Frenzy
    [3, 0, 4], // Weekend Warrior
    [4, 0, 1, 5], // Quick Match Monday
    [5, 1, 2], // Solo Showdown (completed)
    [6, 3], // Minecraft Build Battle
    [7, 2, 4], // COD Mobile Clash
  ];

  for (const [tIdx, pIndices] of registrationAssignments.entries()) {
    const tournamentId = openTournamentIds[tIdx];
    if (!tournamentId) continue;

    const tournament = SAMPLE_TOURNAMENTS[tIdx];

    const seen = new Set<number>();
    for (const pIdx of pIndices) {
      if (seen.has(pIdx)) continue;
      seen.add(pIdx);
      const player = players[pIdx];
      if (!player) continue;

      const isPaid = tournament.entryFee > 0;
      await prisma.tournamentRegistration.create({
        data: {
          tournamentId,
          playerId: player.id,
          paymentStatus: isPaid ? "verified" : "verified",
          paymentMethod: isPaid ? "upi" : null,
          paidAmount: tournament.entryFee,
        },
      });
      regCount++;
    }
  }
  console.log(`   ✓ ${regCount} registrations created\n`);

  // 8. Seed Match data for the completed tournament
  console.log("⚔️  Seeding matches for completed tournament...");
  const completedTournamentId = tournaments["Solo Showdown - Free Fire"]?.id;
  if (completedTournamentId) {
    const completedMatch = await prisma.match.create({
      data: {
        tournamentId: completedTournamentId,
        round: "Finals",
        matchNumber: 1,
        status: "completed",
        scheduledStart: daysFromNow(-7),
        actualStart: daysFromNow(-7),
        endTime: daysFromNow(-7),
        roomId: "FF-SOLO-001",
        roomPassword: "arena2025",
      },
    });
    console.log(`   ✓ Match created for completed tournament`);

    // Match participants for the completed match
    const placements = [1, 3, 5, 8, 12, 25];
    const killsData = [12, 8, 6, 4, 2, 0];
    const deathsData = [1, 3, 4, 5, 7, 10];

    for (let i = 0; i < players.length; i++) {
      await prisma.matchParticipant.create({
        data: {
          matchId: completedMatch.id,
          playerId: players[i].id,
          kills: killsData[i],
          deaths: deathsData[i],
          assists: Math.floor(Math.random() * 5),
          score: placements[i] <= 3 ? 100 - placements[i] * 20 : 0,
          placement: placements[i],
          prizeWon:
            placements[i] === 1
              ? 50
              : placements[i] === 2
                ? 30
                : placements[i] === 3
                  ? 20
                  : 0,
        },
      });
    }
    console.log(`   ✓ ${players.length} participants added to completed match\n`);
  }

  // 9. Seed Leaderboard entries
  console.log("📊 Seeding leaderboard entries...");
  let lbCount = 0;
  const leaderboardData: {
    playerId: string;
    gameId: string;
    totalPoints: number;
    totalWins: number;
    totalMatches: number;
    totalKills: number;
    totalDeaths: number;
    kdRatio: number;
    avgPlacement: number;
    winRate: number;
    period: string;
  }[] = [
    // BGMI leaderboard
    {
      playerId: players[0].id,
      gameId: games["bgmi"].id,
      totalPoints: 850,
      totalWins: 4,
      totalMatches: 15,
      totalKills: 180,
      totalDeaths: 95,
      kdRatio: 1.89,
      avgPlacement: 5.2,
      winRate: 26.7,
      period: "all_time",
    },
    {
      playerId: players[4].id,
      gameId: games["bgmi"].id,
      totalPoints: 620,
      totalWins: 3,
      totalMatches: 12,
      totalKills: 95,
      totalDeaths: 70,
      kdRatio: 1.36,
      avgPlacement: 6.8,
      winRate: 25.0,
      period: "all_time",
    },
    {
      playerId: players[5].id,
      gameId: games["bgmi"].id,
      totalPoints: 280,
      totalWins: 0,
      totalMatches: 8,
      totalKills: 45,
      totalDeaths: 55,
      kdRatio: 0.82,
      avgPlacement: 12.5,
      winRate: 0,
      period: "all_time",
    },
    // Free Fire leaderboard
    {
      playerId: players[1].id,
      gameId: games["free-fire"].id,
      totalPoints: 720,
      totalWins: 3,
      totalMatches: 12,
      totalKills: 130,
      totalDeaths: 80,
      kdRatio: 1.63,
      avgPlacement: 5.5,
      winRate: 25.0,
      period: "all_time",
    },
    {
      playerId: players[0].id,
      gameId: games["free-fire"].id,
      totalPoints: 450,
      totalWins: 2,
      totalMatches: 8,
      totalKills: 78,
      totalDeaths: 52,
      kdRatio: 1.5,
      avgPlacement: 7.1,
      winRate: 25.0,
      period: "all_time",
    },
    {
      playerId: players[5].id,
      gameId: games["free-fire"].id,
      totalPoints: 310,
      totalWins: 1,
      totalMatches: 6,
      totalKills: 40,
      totalDeaths: 35,
      kdRatio: 1.14,
      avgPlacement: 8.3,
      winRate: 16.7,
      period: "all_time",
    },
    // COD Mobile leaderboard
    {
      playerId: players[2].id,
      gameId: games["cod-mobile"].id,
      totalPoints: 580,
      totalWins: 2,
      totalMatches: 10,
      totalKills: 110,
      totalDeaths: 68,
      kdRatio: 1.62,
      avgPlacement: 5.0,
      winRate: 20.0,
      period: "all_time",
    },
    {
      playerId: players[4].id,
      gameId: games["cod-mobile"].id,
      totalPoints: 420,
      totalWins: 1,
      totalMatches: 7,
      totalKills: 72,
      totalDeaths: 50,
      kdRatio: 1.44,
      avgPlacement: 7.8,
      winRate: 14.3,
      period: "all_time",
    },
    // Minecraft leaderboard
    {
      playerId: players[3].id,
      gameId: games["minecraft"].id,
      totalPoints: 350,
      totalWins: 2,
      totalMatches: 6,
      totalKills: 30,
      totalDeaths: 25,
      kdRatio: 1.2,
      avgPlacement: 3.5,
      winRate: 33.3,
      period: "all_time",
    },
  ];

  // Assign ranks
  const gamesWithEntries = new Map<string, typeof leaderboardData>();
  for (const entry of leaderboardData) {
    const key = `${entry.gameId}-${entry.period}`;
    if (!gamesWithEntries.has(key)) gamesWithEntries.set(key, []);
    gamesWithEntries.get(key)!.push(entry);
  }

  for (const [, entries] of gamesWithEntries) {
    entries.sort((a, b) => b.totalPoints - a.totalPoints);
    for (let i = 0; i < entries.length; i++) {
      entries[i].kdRatio = parseFloat(entries[i].kdRatio.toFixed(2));
      entries[i].avgPlacement = parseFloat(entries[i].avgPlacement.toFixed(1));
      entries[i].winRate = parseFloat(entries[i].winRate.toFixed(1));
    }
  }

  for (const entry of leaderboardData) {
    await prisma.leaderboard.create({
      data: {
        ...entry,
        kdRatio: entry.kdRatio,
        avgPlacement: entry.avgPlacement,
        winRate: entry.winRate,
      },
    });
    lbCount++;
  }
  console.log(`   ✓ ${lbCount} leaderboard entries created\n`);

  // 10. Seed Notifications (for admin and players)
  console.log("🔔 Seeding notifications...");
  let notifCount = 0;

  // Notifications for admin
  for (const notif of SAMPLE_NOTIFICATIONS) {
    await prisma.notification.create({
      data: {
        ...notif,
        userId: admin.id,
        createdAt: hoursFromNow(-Math.floor(Math.random() * 48)),
      },
    });
    notifCount++;
  }

  // A few notifications for players
  const playerNotifs = [
    {
      userId: players[0].id,
      title: "Welcome to Aether Arena!",
      message:
        "Welcome! Start competing in tournaments and climb the leaderboard. Good luck!",
      type: "system",
      link: "/tournaments",
    },
    {
      userId: players[1].id,
      title: "You're in the Top 5!",
      message:
        "Great job! You're ranked #2 in the Free Fire all-time leaderboard. Keep it up!",
      type: "achievement",
      link: "/leaderboard",
    },
    {
      userId: players[2].id,
      title: "New Tournament Available",
      message:
        "'COD Mobile Clash' registration is now open. Register now to secure your spot!",
      type: "tournament",
      link: "/tournaments/cod-mobile-clash",
    },
  ];

  for (const notif of playerNotifs) {
    await prisma.notification.create({
      data: {
        ...notif,
        createdAt: hoursFromNow(-Math.floor(Math.random() * 24)),
      },
    });
    notifCount++;
  }
  console.log(`   ✓ ${notifCount} notifications created\n`);

  // 11. Seed Announcements
  console.log("📢 Seeding announcements...");
  const announcements = [
    {
      title: "Aether Arena is Live! 🎮",
      content:
        "Welcome to Aether Arena, the ultimate gaming tournament platform for Indian gamers! Compete in BGMI, Free Fire, COD Mobile, Minecraft, and more. Register now and start winning prizes!",
      type: "announcement",
      isActive: true,
      createdById: admin.id,
      expiresAt: daysFromNow(30),
    },
    {
      title: "New Year Special Tournament 🎆",
      content:
        "Join our biggest tournament yet! The New Year Special is open to all games with a ₹250 prize pool. FREE entry — register before spots fill up!",
      type: "event",
      isActive: true,
      createdById: admin.id,
      expiresAt: daysFromNow(3),
    },
    {
      title: "Weekly Leaderboard Reset",
      content:
        "Weekly leaderboards reset every Monday at 12:00 AM IST. Make sure to compete in weekend tournaments to secure your top rank before the reset!",
      type: "info",
      isActive: true,
      createdById: admin.id,
      expiresAt: daysFromNow(14),
    },
  ];

  for (const ann of announcements) {
    await prisma.announcement.create({ data: ann });
    console.log(`   ✓ "${ann.title}"`);
  }
  console.log("");

  // 12. Seed Stream Schedules
  console.log("📺 Seeding stream schedules...");
  for (const stream of SAMPLE_STREAM_SCHEDULES) {
    const tournamentId = tournaments[stream.tournamentTitle]?.id || null;
    const scheduledEnd = stream.scheduledEnd
      ? (() => {
          const end = new Date(stream.scheduledEnd);
          end.setHours(end.getHours() + 3);
          return end;
        })()
      : null;

    await prisma.streamSchedule.create({
      data: {
        title: stream.title,
        description: stream.description,
        tournamentId,
        scheduledStart: new Date(stream.scheduledStart),
        scheduledEnd,
        platform: stream.platform,
        streamUrl: stream.streamUrl,
        thumbnailUrl: stream.thumbnailUrl,
        status: stream.status,
        isFeatured: stream.isFeatured,
        createdById: admin.id,
      },
    });
    console.log(`   ✓ "${stream.title}" [${stream.status}]`);
  }
  console.log("");

  // 13. Seed Affiliate Links
  console.log("🔗 Seeding affiliate links...");
  for (const link of SAMPLE_AFFILIATE_LINKS) {
    await prisma.affiliateLink.create({ data: link });
    const discount = Math.round(
      ((link.originalPrice - link.price) / link.originalPrice) * 100
    );
    console.log(
      `   ✓ ${link.name} — ₹${link.price} (was ₹${link.originalPrice}, ${discount}% off)`
    );
  }
  console.log("");

  // Summary
  console.log("═══════════════════════════════════════");
  console.log("✅ Aether Arena seed completed!");
  console.log("═══════════════════════════════════════");
  console.log(`   Games:              ${GAMES.length}`);
  console.log(`   Platform Settings:  ${PLATFORM_SETTINGS.length}`);
  console.log(`   Profiles:           ${1 + players.length} (1 admin + ${players.length} players)`);
  console.log(`   Tournaments:        ${SAMPLE_TOURNAMENTS.length}`);
  console.log(`   Registrations:      ${regCount}`);
  console.log(`   Leaderboard:        ${lbCount} entries`);
  console.log(`   Notifications:      ${notifCount}`);
  console.log(`   Announcements:      ${announcements.length}`);
  console.log(`   Stream Schedules:   ${SAMPLE_STREAM_SCHEDULES.length}`);
  console.log(`   Affiliate Links:    ${SAMPLE_AFFILIATE_LINKS.length}`);
  console.log("═══════════════════════════════════════\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed with error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
