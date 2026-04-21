import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Cleanup Script: Removes all seed/demo data from the database.
 *
 * Removes: TournamentRegistrations, MatchParticipants, Matches,
 *          Leaderboard, StreamSchedules, Notifications, Announcements,
 *          Tournaments, AffiliateLinks, TopupPacks, ContactSubmissions
 *
 * Preserves: Profiles, Games, Platform Settings, Account Credentials
 *
 * Usage: npx tsx scripts/cleanup-seed-data.ts
 */

async function cleanup() {
  console.log("Starting database cleanup...\n");

  const counts: Record<string, number> = {};

  const deletions: { name: string; fn: () => Promise<{ count: number }> }[] = [
    { name: "MatchParticipants", fn: () => prisma.matchParticipant.deleteMany() },
    { name: "Matches", fn: () => prisma.match.deleteMany() },
    { name: "TournamentRegistrations", fn: () => prisma.tournamentRegistration.deleteMany() },
    { name: "Leaderboard", fn: () => prisma.leaderboard.deleteMany() },
    { name: "StreamSchedules", fn: () => prisma.streamSchedule.deleteMany() },
    { name: "Notifications", fn: () => prisma.notification.deleteMany() },
    { name: "Announcements", fn: () => prisma.announcement.deleteMany() },
    { name: "Tournaments", fn: () => prisma.tournament.deleteMany() },
    { name: "AffiliateLinks", fn: () => prisma.affiliateLink.deleteMany() },
    { name: "TopupPacks", fn: () => prisma.topupPack.deleteMany() },
    { name: "ContactSubmissions", fn: () => prisma.contactSubmission.deleteMany() },
  ];

  for (const { name, fn } of deletions) {
    try {
      const result = await fn();
      counts[name] = result.count;
      console.log(`  Deleted ${result.count} ${name}`);
    } catch (error) {
      console.log(`  Skipped ${name}: ${(error as Error).message}`);
    }
  }

  console.log("\n=== Cleanup Summary ===");
  for (const [name, count] of Object.entries(counts)) {
    console.log(`  ${name}: ${count} records removed`);
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  console.log(`\nTotal records removed: ${total}`);
  console.log("Preserved: Profiles, Games, Platform Settings, Account Credentials\n");
}

cleanup()
  .catch((e) => {
    console.error("Cleanup failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
