import { Client } from 'pg';

const DIRECT_URL = 'postgresql://postgres.qrmsyjoaodtydjbwjlas:%40Navdeep.Arena%2CGaming%2B777@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres';

async function seed() {
  const client = new Client({ connectionString: DIRECT_URL });
  await client.connect();
  console.log('✅ Connected to Supabase');

  // =============================================
  // CLEAN EXISTING DATA (keep Profile + Game + PlatformSetting)
  // =============================================
  console.log('🧹 Cleaning existing seed data...');
  await client.query('DELETE FROM "MatchParticipant"');
  await client.query('DELETE FROM "Match"');
  await client.query('DELETE FROM "TournamentRegistration"');
  await client.query('DELETE FROM "StreamSchedule"');
  await client.query('DELETE FROM "Leaderboard"');
  await client.query('DELETE FROM "Tournament"');
  await client.query('DELETE FROM "Notification"');
  await client.query('DELETE FROM "Announcement"');
  await client.query('DELETE FROM "AffiliateLink"');
  // Keep Profiles, Games, PlatformSetting, AccountCredential, Account, Session

  // =============================================
  // 10 PLAYER PROFILES (2 existing + 8 new)
  // =============================================
  console.log('👥 Creating player profiles...');

  const players = [
    // Keep existing
    { id: 'cmo644kmd0000ky04s7vhnrsx', username: 'navdeepx7', displayName: 'Navdeep', league: 'diamond', leaguePoints: 1250, totalTournamentsPlayed: 45, totalWins: 18, totalKills: 892, totalDeaths: 410, totalPrizeWon: 2800000, bio: 'Founder of Aether Arena. Free Fire & BGMI enthusiast.' },
    { id: 'cmo64blsk0004ky04bszyrudm', username: 'arenatestpro', displayName: 'Arena Reviewer', league: 'gold', leaguePoints: 380, totalTournamentsPlayed: 22, totalWins: 8, totalKills: 420, totalDeaths: 280, totalPrizeWon: 850000, bio: 'Tournament reviewer and content creator.' },
    // New players
    { id: 'player_shadow_fx', username: 'ShadowFx', displayName: 'Rahul K.', league: 'diamond', leaguePoints: 1180, totalTournamentsPlayed: 52, totalWins: 22, totalKills: 1045, totalDeaths: 489, totalPrizeWon: 3200000, bio: 'Ranked #2 on AA. BGMI predator push.' },
    { id: 'player_night_viper', username: 'NightViper', displayName: 'Amit S.', league: 'platinum', leaguePoints: 720, totalTournamentsPlayed: 38, totalWins: 14, totalKills: 678, totalDeaths: 412, totalPrizeWon: 1450000, bio: 'Clash Royale grandmaster. Pushing for legend.' },
    { id: 'player_blaze_gunner', username: 'BlazeGunner', displayName: 'Vikram P.', league: 'gold', leaguePoints: 450, totalTournamentsPlayed: 30, totalWins: 11, totalKills: 534, totalDeaths: 345, totalPrizeWon: 980000, bio: 'COD Mobile tryhard. 5-finger claw god.' },
    { id: 'player_icy_phoenix', username: 'IcyPhoenix', displayName: 'Priya M.', league: 'silver', leaguePoints: 180, totalTournamentsPlayed: 18, totalWins: 6, totalKills: 287, totalDeaths: 198, totalPrizeWon: 420000, bio: 'Free Fire solo queen. Rising through the ranks.' },
    { id: 'player_storm_breaker', username: 'StormBreaker', displayName: 'Arjun D.', league: 'gold', leaguePoints: 520, totalTournamentsPlayed: 35, totalWins: 15, totalKills: 612, totalDeaths: 356, totalPrizeWon: 1100000, bio: 'All-rounder gamer. BGMI and Free Fire tournaments.' },
    { id: 'player_cyber_wolf', username: 'CyberWolf', displayName: 'Sneha R.', league: 'bronze', leaguePoints: 65, totalTournamentsPlayed: 10, totalWins: 3, totalKills: 145, totalDeaths: 112, totalPrizeWon: 150000, bio: 'New to competitive but hungry for wins.' },
    { id: 'player_dark_titan', username: 'DarkTitan', displayName: 'Karan J.', league: 'platinum', leaguePoints: 680, totalTournamentsPlayed: 28, totalWins: 10, totalKills: 545, totalDeaths: 378, totalPrizeWon: 780000, bio: 'Squad leader. Strategic gameplay.' },
    { id: 'player_rocket_ace', username: 'RocketAce', displayName: 'Deepak T.', league: 'diamond', leaguePoints: 1050, totalTournamentsPlayed: 42, totalWins: 19, totalKills: 887, totalDeaths: 445, totalPrizeWon: 2500000, bio: 'Free Fire headshot machine. Tournament veteran.' },
  ];

  for (const p of players) {
    // Check if exists (for existing profiles, update; for new ones, insert)
    const existing = await client.query('SELECT "id" FROM "Profile" WHERE "id" = $1', [p.id]);
    if (existing.rows.length > 0) {
      await client.query(`UPDATE "Profile" SET 
        "displayName" = $2, "league" = $3, "leaguePoints" = $4,
        "totalTournamentsPlayed" = $5, "totalWins" = $6, "totalKills" = $7,
        "totalDeaths" = $8, "totalPrizeWon" = $9, "bio" = $10
      WHERE "id" = $1`, [p.id, p.displayName, p.league, p.leaguePoints, p.totalTournamentsPlayed, p.totalWins, p.totalKills, p.totalDeaths, p.totalPrizeWon, p.bio]);
      console.log(`  ↻ Updated: ${p.username}`);
    } else {
      await client.query(`INSERT INTO "Profile" ("id", "username", "displayName", "league", "leaguePoints", "totalTournamentsPlayed", "totalWins", "totalKills", "totalDeaths", "totalPrizeWon", "bio", "isAdmin", "isBanned", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, false, false, NOW(), NOW())`, 
      [p.id, p.username, p.displayName, p.league, p.leaguePoints, p.totalTournamentsPlayed, p.totalWins, p.totalKills, p.totalDeaths, p.totalPrizeWon, p.bio]);
      console.log(`  ✓ Created: ${p.username}`);
    }
  }

  // =============================================
  // 6 TOURNAMENTS
  // =============================================
  console.log('\n🏆 Creating tournaments...');

  // Game IDs
  const FF = 'game_freefire';
  const BGMI = 'game_bgmi';
  const CODM = 'game_codm';
  const CR = 'game_clashroyale';

  // Date helpers (IST = UTC + 5:30)
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const toIST = (d: Date) => new Date(d.getTime() + istOffset);

  const inDays = (days: number, hours = 0, mins = 0) => {
    const d = new Date(Date.now() + days * 86400000 + hours * 3600000 + mins * 60000);
    return d.toISOString();
  };
  const agoDays = (days: number, hours = 0, mins = 0) => {
    const d = new Date(Date.now() - days * 86400000 + hours * 3600000 + mins * 60000);
    return d.toISOString();
  };

  const tournaments = [
    // 1. Free Fire Solo - FREE, Registration Open, Featured
    {
      id: 't_ff_showdown_1',
      title: 'Aether Arena Free Fire Showdown',
      description: '🔥 The ultimate Free Fire solo battle royale is here!\n\nShowcase your skills in intense solo matches. Top players win big! Open to all skill levels — whether you\'re a casual player or a competitive pro, this is your chance to shine.\n\n🏆 Prize Distribution:\n• 1st Place: ₹1,000\n• 2nd Place: ₹600\n• 3rd Place: ₹400',
      gameId: FF,
      coverImageUrl: '/images/tournaments/freefire-showdown.webp',
      format: 'solo',
      entryFee: 0,
      prizePool: 200000, // ₹2000 in paise
      maxPlayers: 50,
      registeredPlayers: 34,
      status: 'registration_open',
      matchMode: 'Battle Royale',
      map: 'Bermuda',
      customRules: '• No hacking/emulators allowed\n• Must join Discord for room ID\n• 15-minute grace period after match start\n• Results based on kills + placement\n• Stream sniping = instant DQ',
      registrationStart: agoDays(3),
      registrationEnd: inDays(2, 18),
      startTime: inDays(3, 20),
      endTime: inDays(3, 22, 30),
      isFeatured: true,
      streamScheduled: true,
      streamPlatform: 'YouTube',
      streamUrl: 'https://youtube.com/@aetherarena',
      streamStartTime: inDays(3, 20),
      createdById: 'cmo644kmd0000ky04s7vhnrsx',
    },
    // 2. Free Fire Duo - ₹50 entry, Registration Open
    {
      id: 't_ff_night_1',
      title: 'Free Fire Night Hunter Duo',
      description: '🌙 Team up with your best partner for the ultimate night battle!\n\nGrab your duo partner and compete against the best. Higher stakes, bigger rewards. Only the strongest duo survives!\n\n🏆 Prize Distribution:\n• 1st Place Duo: ₹2,500\n• 2nd Place Duo: ₹1,500\n• 3rd Place Duo: ₹1,000',
      gameId: FF,
      coverImageUrl: '/images/tournaments/freefire-night.webp',
      format: 'duo',
      entryFee: 5000, // ₹50
      prizePool: 500000, // ₹5000
      maxPlayers: 48, // 24 duos
      registeredPlayers: 22,
      status: 'registration_open',
      matchMode: 'Duo Battle Royale',
      map: 'Kalahari',
      customRules: '• ₹50 entry fee per player (₹100 per duo)\n• Duo partners must register together\n• No teaming with other duos\n• 3 matches, cumulative scoring\n• Top 3 duos win prizes',
      registrationStart: agoDays(1),
      registrationEnd: inDays(4, 16),
      startTime: inDays(5, 21),
      endTime: inDays(5, 23),
      isFeatured: false,
      streamScheduled: true,
      streamPlatform: 'YouTube',
      streamUrl: 'https://youtube.com/@aetherarena',
      streamStartTime: inDays(5, 21),
      createdById: 'cmo644kmd0000ky04s7vhnrsx',
    },
    // 3. BGMI Solo - ₹30 entry, Registration Open
    {
      id: 't_bgmi_solo_1',
      title: 'BGMI Elite Solo Championship',
      description: '🎯 The most competitive BGMI solo event on Aether Arena!\n\nTest your solo skills against the best BGMI players. This is NOT for the faint-hearted. Every kill counts, every placement matters.\n\n🏆 Prize Distribution:\n• 1st Place: ₹4,000\n• 2nd Place: ₹2,500\n• 3rd Place: ₹1,500\n• 4th-5th Place: ₹1,000 each',
      gameId: BGMI,
      coverImageUrl: '/images/tournaments/bgmi-solo-elite.webp',
      format: 'solo',
      entryFee: 3000, // ₹30
      prizePool: 1000000, // ₹10,000
      maxPlayers: 100,
      registeredPlayers: 67,
      status: 'registration_open',
      matchMode: 'Solo TPP',
      map: 'Erangel',
      customRules: '• ₹30 entry fee per player\n• 4 matches (Erangel × 2, Miramar × 2)\n• Scoring: Kill = 1 point, Top 10 = 3 points, Booyah = 5 points\n• No hacks/cheats — fair play only\n• Streamers welcome — tag @aetherarena',
      registrationStart: agoDays(5),
      registrationEnd: inDays(3, 14),
      startTime: inDays(4, 19),
      endTime: inDays(4, 22),
      isFeatured: true,
      streamScheduled: true,
      streamPlatform: 'YouTube',
      streamUrl: 'https://youtube.com/@aetherarena',
      streamStartTime: inDays(4, 19),
      createdById: 'cmo644kmd0000ky04s7vhnrsx',
    },
    // 4. BGMI Squad - ₹100 entry per player, Upcoming
    {
      id: 't_bgmi_squad_1',
      title: 'BGMI Squad Clash — Season 1',
      description: '⚡ Assemble your squad of 4 for the biggest BGMI squad tournament!\n\nThis is Aether Arena\'s premier squad event. Gather your best teammates, plan your strategy, and fight for the massive prize pool.\n\n🏆 Prize Distribution:\n• 1st Place Squad: ₹12,000 (₹3,000 each)\n• 2nd Place Squad: ₹7,000 (₹1,750 each)\n• 3rd Place Squad: ₹4,000 (₹1,000 each)\n• MVP Award: ₹2,000',
      gameId: BGMI,
      coverImageUrl: '/images/tournaments/bgmi-squad-clash.webp',
      format: 'squad',
      entryFee: 10000, // ₹100 per player
      prizePool: 2500000, // ₹25,000
      maxPlayers: 100, // 25 squads
      registeredPlayers: 12,
      status: 'upcoming',
      matchMode: 'Squad FPP',
      map: 'Erangel',
      customRules: '• ₹100 entry fee per player (₹400 per squad)\n• Squad of exactly 4 players\n• All members must register individually and share squad name\n• 5 matches across 3 maps\n• Points system: Placement + Kills\n• Must be in Aether Arena Discord',
      registrationStart: inDays(1),
      registrationEnd: inDays(9, 12),
      startTime: inDays(10, 18),
      endTime: inDays(10, 22),
      isFeatured: true,
      streamScheduled: true,
      streamPlatform: 'YouTube',
      streamUrl: 'https://youtube.com/@aetherarena',
      streamStartTime: inDays(10, 18),
      createdById: 'cmo644kmd0000ky04s7vhnrsx',
    },
    // 5. COD Mobile Solo - FREE, Upcoming
    {
      id: 't_codm_strike_1',
      title: 'COD Mobile Strike Zone Solo',
      description: '💥 Call of Duty Mobile players, your time has come!\n\nJump into intense CODM multiplayer action. Whether you\'re a rusher or a sniper, there\'s a spot for you in the Strike Zone.\n\n🏆 Prize Distribution:\n• 1st Place: ₹1,500\n• 2nd Place: ₹1,000\n• 3rd Place: ₹500',
      gameId: CODM,
      coverImageUrl: '/images/tournaments/codm-strike.webp',
      format: 'solo',
      entryFee: 0,
      prizePool: 300000, // ₹3,000
      maxPlayers: 64,
      registeredPlayers: 0,
      status: 'upcoming',
      matchMode: 'Search & Destroy',
      map: 'Killhouse',
      customRules: '• Completely FREE entry!\n• Search & Destroy mode, 6v6 brackets\n• Single elimination tournament\n• Best of 3 rounds per match\n• No scorestreak exploits\n• Friendly fire = auto-loss',
      registrationStart: inDays(2),
      registrationEnd: inDays(12, 10),
      startTime: inDays(14, 17),
      endTime: inDays(14, 21),
      isFeatured: false,
      streamScheduled: false,
      streamPlatform: '',
      streamUrl: '',
      streamStartTime: null,
      createdById: 'cmo644kmd0000ky04s7vhnrsx',
    },
    // 6. Clash Royale 1v1 - FREE, Completed
    {
      id: 't_cr_arena_1',
      title: 'Clash Royale Arena Championship',
      description: '👑 The inaugural Clash Royale tournament on Aether Arena!\n\nProve your deck-building skills and clutch execution in head-to-head battles. From Arena 7+ players welcome.\n\n🏆 Final Results:\n• 🥇 1st: ShadowFx\n• 🥈 2nd: RocketAce\n• 🥉 3rd: StormBreaker\n\nGG to all participants! Season 2 coming soon.',
      gameId: CR,
      coverImageUrl: '/images/tournaments/clash-royale-arena.webp',
      format: 'solo',
      entryFee: 0,
      prizePool: 150000, // ₹1,500
      maxPlayers: 32,
      registeredPlayers: 28,
      status: 'completed',
      matchMode: '1v1 Ladder',
      map: 'Arena 12',
      customRules: '• Tournament Standard rules\n• Level cap: King Tower 13\n• Double elimination bracket\n• Each round: Best of 3\n• Finals: Best of 5\n• No banned cards',
      registrationStart: agoDays(14),
      registrationEnd: agoDays(7),
      startTime: agoDays(6, 19),
      endTime: agoDays(6, 22),
      isFeatured: false,
      streamScheduled: false,
      streamPlatform: '',
      streamUrl: '',
      streamStartTime: null,
      createdById: 'cmo644kmd0000ky04s7vhnrsx',
    },
  ];

  for (const t of tournaments) {
    await client.query(`INSERT INTO "Tournament" (
      "id", "title", "description", "gameId", "coverImageUrl", "format",
      "entryFee", "prizePool", "maxPlayers", "registeredPlayers", "status",
      "matchMode", "map", "customRules", "streamScheduled", "streamPlatform",
      "streamUrl", "streamStartTime", "registrationStart", "registrationEnd",
      "startTime", "endTime", "isFeatured", "createdById", "createdAt", "updatedAt"
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,NOW(),NOW())`, [
      t.id, t.title, t.description, t.gameId, t.coverImageUrl, t.format,
      t.entryFee, t.prizePool, t.maxPlayers, t.registeredPlayers, t.status,
      t.matchMode, t.map, t.customRules, t.streamScheduled, t.streamPlatform,
      t.streamUrl, t.streamStartTime, t.registrationStart, t.registrationEnd,
      t.startTime, t.endTime, t.isFeatured, t.createdById,
    ]);
    console.log(`  ✓ ${t.title} [${t.status}]`);
  }

  // =============================================
  // TOURNAMENT REGISTRATIONS (for completed + some open ones)
  // =============================================
  console.log('\n📝 Creating tournament registrations...');

  const registrations = [
    // Completed CR tournament registrations (all verified)
    { tournamentId: 't_cr_arena_1', playerId: 'player_shadow_fx', paymentStatus: 'verified', paidAmount: 0 },
    { tournamentId: 't_cr_arena_1', playerId: 'player_rocket_ace', paymentStatus: 'verified', paidAmount: 0 },
    { tournamentId: 't_cr_arena_1', playerId: 'player_storm_breaker', paymentStatus: 'verified', paidAmount: 0 },
    { tournamentId: 't_cr_arena_1', playerId: 'cmo644kmd0000ky04s7vhnrsx', paymentStatus: 'verified', paidAmount: 0 },
    { tournamentId: 't_cr_arena_1', playerId: 'player_night_viper', paymentStatus: 'verified', paidAmount: 0 },
    { tournamentId: 't_cr_arena_1', playerId: 'player_blaze_gunner', paymentStatus: 'verified', paidAmount: 0 },
    { tournamentId: 't_cr_arena_1', playerId: 'player_dark_titan', paymentStatus: 'verified', paidAmount: 0 },
    { tournamentId: 't_cr_arena_1', playerId: 'player_icy_phoenix', paymentStatus: 'verified', paidAmount: 0 },
    // BGMI Solo registrations (mix of verified and pending)
    { tournamentId: 't_bgmi_solo_1', playerId: 'player_shadow_fx', paymentStatus: 'verified', paidAmount: 3000 },
    { tournamentId: 't_bgmi_solo_1', playerId: 'cmo644kmd0000ky04s7vhnrsx', paymentStatus: 'verified', paidAmount: 3000 },
    { tournamentId: 't_bgmi_solo_1', playerId: 'player_rocket_ace', paymentStatus: 'verified', paidAmount: 3000 },
    { tournamentId: 't_bgmi_solo_1', playerId: 'player_storm_breaker', paymentStatus: 'verified', paidAmount: 3000 },
    { tournamentId: 't_bgmi_solo_1', playerId: 'player_dark_titan', paymentStatus: 'verified', paidAmount: 3000 },
    { tournamentId: 't_bgmi_solo_1', playerId: 'player_blaze_gunner', paymentStatus: 'verified', paidAmount: 3000 },
    { tournamentId: 't_bgmi_solo_1', playerId: 'player_night_viper', paymentStatus: 'verified', paidAmount: 3000 },
    // Free Fire Showdown registrations (free, verified)
    { tournamentId: 't_ff_showdown_1', playerId: 'cmo644kmd0000ky04s7vhnrsx', paymentStatus: 'verified', paidAmount: 0 },
    { tournamentId: 't_ff_showdown_1', playerId: 'player_rocket_ace', paymentStatus: 'verified', paidAmount: 0 },
    { tournamentId: 't_ff_showdown_1', playerId: 'player_shadow_fx', paymentStatus: 'verified', paidAmount: 0 },
    { tournamentId: 't_ff_showdown_1', playerId: 'player_icy_phoenix', paymentStatus: 'verified', paidAmount: 0 },
    { tournamentId: 't_ff_showdown_1', playerId: 'player_storm_breaker', paymentStatus: 'verified', paidAmount: 0 },
    // Free Fire Duo registrations
    { tournamentId: 't_ff_night_1', playerId: 'player_blaze_gunner', paymentStatus: 'verified', paidAmount: 5000 },
    { tournamentId: 't_ff_night_1', playerId: 'player_dark_titan', paymentStatus: 'verified', paidAmount: 5000 },
    { tournamentId: 't_ff_night_1', playerId: 'player_cyber_wolf', paymentStatus: 'pending', paidAmount: 0 },
    // BGMI Squad registrations
    { tournamentId: 't_bgmi_squad_1', playerId: 'cmo644kmd0000ky04s7vhnrsx', paymentStatus: 'verified', paidAmount: 10000 },
    { tournamentId: 't_bgmi_squad_1', playerId: 'player_shadow_fx', paymentStatus: 'verified', paidAmount: 10000 },
    { tournamentId: 't_bgmi_squad_1', playerId: 'player_rocket_ace', paymentStatus: 'verified', paidAmount: 10000 },
  ];

  for (let i = 0; i < registrations.length; i++) {
    const r = registrations[i];
    const regId = `reg_${r.tournamentId}_${r.playerId}`;
    await client.query(`INSERT INTO "TournamentRegistration" ("id", "tournamentId", "playerId", "paymentStatus", "paidAmount")
    VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING`, [regId, r.tournamentId, r.playerId, r.paymentStatus, r.paidAmount]);
  }
  console.log(`  ✓ ${registrations.length} registrations created`);

  // =============================================
  // MATCHES for completed tournament (CR Arena)
  // =============================================
  console.log('\n⚔️ Creating match data for completed tournament...');

  // Create 1 final match for the completed CR tournament
  const matchId = 'match_cr_final_1';
  await client.query(`INSERT INTO "Match" ("id", "tournamentId", "round", "matchNumber", "status", "scheduledStart", "actualStart", "endTime")
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, [
    matchId, 't_cr_arena_1', 'Finals', 1, 'completed',
    agoDays(6, 20), agoDays(6, 20, 5), agoDays(6, 21)
  ]);

  // Match participants for the CR final
  const crParticipants = [
    { matchId, playerId: 'player_shadow_fx', kills: 8, deaths: 3, score: 15, placement: 1, prizeWon: 60000 },  // ₹600
    { matchId, playerId: 'player_rocket_ace', kills: 6, deaths: 5, score: 12, placement: 2, prizeWon: 40000 },
    { matchId, playerId: 'player_storm_breaker', kills: 5, deaths: 4, score: 10, placement: 3, prizeWon: 25000 },
    { matchId, playerId: 'cmo644kmd0000ky04s7vhnrsx', kills: 4, deaths: 6, score: 8, placement: 4, prizeWon: 0 },
    { matchId, playerId: 'player_night_viper', kills: 3, deaths: 5, score: 6, placement: 5, prizeWon: 0 },
    { matchId, playerId: 'player_blaze_gunner', kills: 3, deaths: 6, score: 5, placement: 6, prizeWon: 0 },
    { matchId, playerId: 'player_dark_titan', kills: 2, deaths: 7, score: 4, placement: 7, prizeWon: 0 },
    { matchId, playerId: 'player_icy_phoenix', kills: 1, deaths: 8, score: 2, placement: 8, prizeWon: 0 },
  ];

  for (const p of crParticipants) {
    await client.query(`INSERT INTO "MatchParticipant" ("matchId", "playerId", "kills", "deaths", "score", "placement", "prizeWon")
    VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING`,
      [p.matchId, p.playerId, p.kills, p.deaths, p.score, p.placement, p.prizeWon]);
  }
  console.log(`  ✓ Final match + ${crParticipants.length} participants created`);

  // =============================================
  // LEADERBOARD (10 entries across games)
  // =============================================
  console.log('\n📊 Creating leaderboard entries...');

  const leaderboardEntries = [
    // Free Fire Leaderboard
    { playerId: 'player_rocket_ace', gameId: FF, totalPoints: 850, totalWins: 12, totalMatches: 38, totalKills: 456, totalDeaths: 198, kdRatio: 2.30, avgPlacement: 4.2, winRate: 31.6, rank: 1, period: 'all_time' },
    { playerId: 'player_shadow_fx', gameId: FF, totalPoints: 720, totalWins: 10, totalMatches: 34, totalKills: 389, totalDeaths: 187, kdRatio: 2.08, avgPlacement: 4.8, winRate: 29.4, rank: 2, period: 'all_time' },
    { playerId: 'cmo644kmd0000ky04s7vhnrsx', gameId: FF, totalPoints: 680, totalWins: 9, totalMatches: 30, totalKills: 367, totalDeaths: 178, kdRatio: 2.06, avgPlacement: 5.1, winRate: 30.0, rank: 3, period: 'all_time' },
    { playerId: 'player_icy_phoenix', gameId: FF, totalPoints: 340, totalWins: 5, totalMatches: 18, totalKills: 198, totalDeaths: 134, kdRatio: 1.48, avgPlacement: 6.3, winRate: 27.8, rank: 4, period: 'all_time' },
    { playerId: 'player_storm_breaker', gameId: FF, totalPoints: 310, totalWins: 4, totalMatches: 22, totalKills: 187, totalDeaths: 156, kdRatio: 1.20, avgPlacement: 6.8, winRate: 18.2, rank: 5, period: 'all_time' },
    // BGMI Leaderboard
    { playerId: 'player_shadow_fx', gameId: BGMI, totalPoints: 920, totalWins: 14, totalMatches: 42, totalKills: 534, totalDeaths: 289, kdRatio: 1.85, avgPlacement: 3.9, winRate: 33.3, rank: 1, period: 'all_time' },
    { playerId: 'player_dark_titan', gameId: BGMI, totalPoints: 640, totalWins: 8, totalMatches: 28, totalKills: 312, totalDeaths: 198, kdRatio: 1.58, avgPlacement: 5.2, winRate: 28.6, rank: 2, period: 'all_time' },
    { playerId: 'cmo644kmd0000ky04s7vhnrsx', gameId: BGMI, totalPoints: 580, totalWins: 7, totalMatches: 26, totalKills: 278, totalDeaths: 189, kdRatio: 1.47, avgPlacement: 5.6, winRate: 26.9, rank: 3, period: 'all_time' },
    { playerId: 'player_storm_breaker', gameId: BGMI, totalPoints: 420, totalWins: 5, totalMatches: 20, totalKills: 198, totalDeaths: 145, kdRatio: 1.37, avgPlacement: 6.1, winRate: 25.0, rank: 4, period: 'all_time' },
    { playerId: 'player_blaze_gunner', gameId: BGMI, totalPoints: 280, totalWins: 3, totalMatches: 15, totalKills: 134, totalDeaths: 112, kdRatio: 1.20, avgPlacement: 7.0, winRate: 20.0, rank: 5, period: 'all_time' },
    // COD Mobile Leaderboard
    { playerId: 'player_blaze_gunner', gameId: CODM, totalPoints: 760, totalWins: 11, totalMatches: 30, totalKills: 423, totalDeaths: 178, kdRatio: 2.38, avgPlacement: 3.5, winRate: 36.7, rank: 1, period: 'all_time' },
    { playerId: 'player_cyber_wolf', gameId: CODM, totalPoints: 380, totalWins: 4, totalMatches: 14, totalKills: 167, totalDeaths: 112, kdRatio: 1.49, avgPlacement: 5.8, winRate: 28.6, rank: 2, period: 'all_time' },
    { playerId: 'cmo644kmd0000ky04s7vhnrsx', gameId: CODM, totalPoints: 320, totalWins: 3, totalMatches: 12, totalKills: 145, totalDeaths: 98, kdRatio: 1.48, avgPlacement: 6.2, winRate: 25.0, rank: 3, period: 'all_time' },
    // Clash Royale Leaderboard
    { playerId: 'player_night_viper', gameId: CR, totalPoints: 890, totalWins: 16, totalMatches: 36, totalKills: 0, totalDeaths: 0, kdRatio: 0, avgPlacement: 2.1, winRate: 44.4, rank: 1, period: 'all_time' },
    { playerId: 'player_shadow_fx', gameId: CR, totalPoints: 780, totalWins: 13, totalMatches: 32, totalKills: 0, totalDeaths: 0, kdRatio: 0, avgPlacement: 2.8, winRate: 40.6, rank: 2, period: 'all_time' },
    { playerId: 'player_rocket_ace', gameId: CR, totalPoints: 650, totalWins: 10, totalMatches: 28, totalKills: 0, totalDeaths: 0, kdRatio: 0, avgPlacement: 3.4, winRate: 35.7, rank: 3, period: 'all_time' },
  ];

  for (const e of leaderboardEntries) {
    const lbId = `lb_${e.playerId}_${e.gameId}_${e.period}`;
    await client.query(`INSERT INTO "Leaderboard" ("id", "playerId", "gameId", "totalPoints", "totalWins", "totalMatches", "totalKills", "totalDeaths", "kdRatio", "avgPlacement", "winRate", "period", "rank", "updatedAt")
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,NOW()) ON CONFLICT DO NOTHING`,
      [lbId, e.playerId, e.gameId, e.totalPoints, e.totalWins, e.totalMatches, e.totalKills, e.totalDeaths, e.kdRatio, e.avgPlacement, e.winRate, e.period, e.rank]);
  }
  console.log(`  ✓ ${leaderboardEntries.length} leaderboard entries created`);

  // =============================================
  // 3 STREAM SCHEDULES
  // =============================================
  console.log('\n📺 Creating stream schedules...');

  const streams = [
    // 1. LIVE NOW stream
    {
      id: 'stream_live_1',
      title: '🔴 LIVE: Free Fire Showdown — Match Day!',
      description: 'We\'re LIVE for the Aether Arena Free Fire Showdown! Watch 50 players battle it out for the ₹2,000 prize pool. Commentary, giveaways, and hype moments!',
      tournamentId: 't_ff_showdown_1',
      scheduledStart: new Date(Date.now() - 30 * 60000).toISOString(), // 30 min ago
      scheduledEnd: new Date(Date.now() + 90 * 60000).toISOString(),   // 90 min from now
      platform: 'YouTube',
      streamUrl: 'https://youtube.com/@aetherarena/live',
      thumbnailUrl: '/images/tournaments/freefire-showdown.webp',
      status: 'live',
      peakViewers: 156,
      avgViewers: 89,
      isFeatured: true,
      createdById: 'cmo644kmd0000ky04s7vhnrsx',
    },
    // 2. Upcoming stream - BGMI Solo Championship
    {
      id: 'stream_upcoming_1',
      title: 'BGMI Elite Solo Championship — Pre-Show',
      description: 'Join us for the pre-show analysis! We\'ll break down the player list, discuss meta picks, and predict who takes the ₹10,000 prize. Live Q&A with the community!',
      tournamentId: 't_bgmi_solo_1',
      scheduledStart: inDays(4, 18, 30),
      scheduledEnd: inDays(4, 19),
      platform: 'YouTube',
      streamUrl: 'https://youtube.com/@aetherarena',
      thumbnailUrl: '/images/tournaments/bgmi-solo-elite.webp',
      status: 'scheduled',
      peakViewers: 0,
      avgViewers: 0,
      isFeatured: true,
      createdById: 'cmo644kmd0000ky04s7vhnrsx',
    },
    // 3. Upcoming stream - Community Night
    {
      id: 'stream_upcoming_2',
      title: 'Aether Arena Community Game Night',
      description: '🎮 Fun community game night! Playing custom matches with subscribers and tournament winners. Come hang out, play with us, and win exclusive AA merch giveaways!',
      tournamentId: null,
      scheduledStart: inDays(6, 20),
      scheduledEnd: inDays(6, 23),
      platform: 'Twitch',
      streamUrl: 'https://twitch.tv/aetherarena',
      thumbnailUrl: '',
      status: 'scheduled',
      peakViewers: 0,
      avgViewers: 0,
      isFeatured: false,
      createdById: 'cmo644kmd0000ky04s7vhnrsx',
    },
  ];

  for (const s of streams) {
    await client.query(`INSERT INTO "StreamSchedule" (
      "id", "title", "description", "tournamentId", "scheduledStart", "scheduledEnd",
      "platform", "streamUrl", "thumbnailUrl", "status", "peakViewers", "avgViewers",
      "isFeatured", "createdById"
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`, [
      s.id, s.title, s.description, s.tournamentId, s.scheduledStart, s.scheduledEnd,
      s.platform, s.streamUrl, s.thumbnailUrl, s.status, s.peakViewers, s.avgViewers,
      s.isFeatured, s.createdById,
    ]);
    console.log(`  ✓ ${s.title} [${s.status}]`);
  }

  // =============================================
  // 5 AFFILIATE PRODUCTS (real Amazon links)
  // =============================================
  console.log('\n🛒 Creating affiliate products...');

  const affiliates = [
    {
      id: 'aff_razer_earbuds',
      name: 'Razer Hammerhead True Wireless Earbuds',
      platform: 'Amazon',
      url: 'https://www.amazon.in/Razer-Hammerhead-Wireless-Earbuds-Bluetooth/dp/B09CZ6GJZH',
      slug: 'razer-hammerhead-earbuds',
      description: 'Ultra-low latency 60ms Bluetooth gaming earbuds with gaming mode. 16.2mm drivers, IPX4 water resistant, 24hr battery life. Perfect for mobile gaming tournaments.',
      category: 'Audio',
      imageUrl: '',
      price: 4999,
      originalPrice: 7999,
      isActive: true,
      sortOrder: 1,
    },
    {
      id: 'aff_backbone_controller',
      name: 'Backbone One Mobile Gaming Controller',
      platform: 'Amazon',
      url: 'https://www.amazon.in/Backbone-Mobile-Controller-iPhone-PlayStation/dp/B08WPK9WYV',
      slug: 'backbone-one-controller',
      description: 'Premium mobile gaming controller for iOS. Clickable analog sticks, Hall effect triggers, passes MFi certification. Transform your phone into a console.',
      category: 'Controllers',
      imageUrl: '',
      price: 6499,
      originalPrice: 9999,
      isActive: true,
      sortOrder: 2,
    },
    {
      id: 'aff_gaming_fingers',
      name: 'Mobile Gaming Trigger Controller (L1R1)',
      platform: 'Amazon',
      url: 'https://www.amazon.in/B Rotating-Mobile-Gaming-Trigger-Controller/dp/B09ZY7K3FQ',
      slug: 'gaming-trigger-controller',
      description: '6-finger gaming triggers with adjustable sensitivity. Rotating design fits any phone. Mechanical buttons for precise shooting in BGMI, Free Fire, CODM.',
      category: 'Accessories',
      imageUrl: '',
      price: 399,
      originalPrice: 999,
      isActive: true,
      sortOrder: 3,
    },
    {
      id: 'aff_phone_cooler',
      name: 'Black Shark Magnetic Phone Cooler',
      platform: 'Amazon',
      url: 'https://www.amazon.in/Black-Shark-Magnetic-Cooling-Applicable/dp/B0C9L5RQGN',
      slug: 'black-shark-phone-cooler',
      description: 'Magnetic phone cooling fan with RGB lighting. 15°C cooling drop in seconds. Ultra-quiet 30dB motor. Essential for marathon gaming sessions without thermal throttling.',
      category: 'Accessories',
      imageUrl: '',
      price: 1499,
      originalPrice: 2999,
      isActive: true,
      sortOrder: 4,
    },
    {
      id: 'aff_gaming_mouse',
      name: 'Logitech G502 Hero Gaming Mouse',
      platform: 'Amazon',
      url: 'https://www.amazon.in/Logitech-G502-Programmable-Buttons-Sensibility/dp/B07GBZJ4QM',
      slug: 'logitech-g502-hero',
      description: 'HERO 25K sensor with 25600 DPI. 11 programmable buttons, adjustable weights, RGB Lightsync. The legendary mouse trusted by esports pros worldwide.',
      category: 'Peripherals',
      imageUrl: '',
      price: 2995,
      originalPrice: 5495,
      isActive: true,
      sortOrder: 5,
    },
  ];

  for (const a of affiliates) {
    await client.query(`INSERT INTO "AffiliateLink" (
      "id", "name", "platform", "url", "slug", "description", "category",
      "imageUrl", "price", "originalPrice", "isActive", "sortOrder"
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`, [
      a.id, a.name, a.platform, a.url, a.slug, a.description, a.category,
      a.imageUrl, a.price, a.originalPrice, a.isActive, a.sortOrder,
    ]);
    console.log(`  ✓ ${a.name} — ₹${a.price/100} (was ₹${a.originalPrice/100})`);
  }

  // =============================================
  // ANNOUNCEMENTS (2 launch announcements)
  // =============================================
  console.log('\n📢 Creating announcements...');

  await client.query(`INSERT INTO "Announcement" ("id", "title", "content", "type", "isActive", "createdById", "createdAt", "expiresAt")
  VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7)`,
  ['announce_launch_1', '🚀 Aether Arena is OFFICIALLY LIVE!',
  'The wait is over! Aether Arena is now live and ready for competitive gaming tournaments. Register for our first events, climb the leaderboards, and compete for real cash prizes. Welcome to the arena!',
  'info', true, 'cmo644kmd0000ky04s7vhnrsx', inDays(30)]);

  await client.query(`INSERT INTO "Announcement" ("id", "title", "content", "type", "isActive", "createdById", "createdAt", "expiresAt")
  VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7)`,
  ['announce_affiliate_1', '🛒 New Gaming Gear Store!',
  'Check out our new affiliate store featuring premium gaming gear at discounted prices. From controllers to cooling fans — level up your setup with our handpicked recommendations!',
  'info', true, 'cmo644kmd0000ky04s7vhnrsx', inDays(15)]);

  console.log('  ✓ 2 announcements created');

  // =============================================
  // SUMMARY
  // =============================================
  console.log('\n' + '='.repeat(50));
  console.log('🎉 SEED DATA COMPLETE!');
  console.log('='.repeat(50));
  console.log('👤 Profiles:    10 players (2 existing + 8 new)');
  console.log('🏆 Tournaments:  6 (2 FF, 2 BGMI, 1 CODM, 1 CR)');
  console.log('📝 Registrations: 25');
  console.log('⚔️ Matches:      1 (completed CR final)');
  console.log('📊 Leaderboard:  16 entries across 4 games');
  console.log('📺 Streams:      3 (1 LIVE, 2 upcoming)');
  console.log('🛒 Affiliates:   5 products (real Amazon links)');
  console.log('📢 Announcements: 2');

  await client.end();
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
