import { SlashCommandBuilder, EmbedBuilder, CommandInteraction, User } from 'discord.js'
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()
const BRAND_COLOR = 0x9333ea
const BASE_URL = process.env.BASE_URL || 'https://aether-arena.vercel.app'

const LEAGUE_EMOJIS: Record<string, string> = {
  bronze: '🥉',
  silver: '🥈',
  gold: '🥇',
  platinum: '💎',
  diamond: '💠',
  master: '👑',
  grandmaster: '🌟',
}

export const data = new SlashCommandBuilder()
  .setName('profile')
  .setDescription('View a player\'s Aether Arena profile')
  .addUserOption((option) =>
    option.setName('user').setDescription('Mention a Discord user (defaults to you)').setRequired(false)
  )

export async function execute(interaction: CommandInteraction) {
  await interaction.deferReply()

  try {
    const targetUser = (interaction.options.get('user')?.user as User | null) || interaction.user
    const discordId = targetUser.id

    const profile = await db.profile.findUnique({
      where: { discordId },
      select: {
        username: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        league: true,
        leaguePoints: true,
        totalTournamentsPlayed: true,
        totalWins: true,
        totalKills: true,
        totalDeaths: true,
        totalPrizeWon: true,
        createdAt: true,
      },
    })

    if (!profile) {
      const notFound = new EmbedBuilder()
        .setColor(BRAND_COLOR)
        .setTitle(`👤 ${targetUser.username} — Not Registered`)
        .setDescription(
          `This Discord account is not linked to an Aether Arena profile.\n\nUse \`/register\` to create an account, or sign in on the website with Discord OAuth to link your account.`
        )
        .setURL(`${BASE_URL}`)
        .setThumbnail(targetUser.displayAvatarURL({ size: 256 }))
        .setFooter({ text: 'Aether Arena' })
        .setTimestamp()

      await interaction.editReply({ embeds: [notFound] })
      return
    }

    const totalGames = profile.totalKills + profile.totalDeaths
    const kdRatio = totalGames > 0 ? (profile.totalKills / profile.totalDeaths).toFixed(2) : '0.00'
    const winRate =
      profile.totalTournamentsPlayed > 0
        ? ((profile.totalWins / profile.totalTournamentsPlayed) * 100).toFixed(1)
        : '0.0'

    const leagueEmoji = LEAGUE_EMOJIS[profile.league.toLowerCase()] || '⚪'
    const displayName = profile.displayName || profile.username

    const embed = new EmbedBuilder()
      .setColor(BRAND_COLOR)
      .setTitle(`${leagueEmoji} ${displayName}`)
      .setURL(`${BASE_URL}/profile/${profile.username}`)
      .setDescription(profile.bio || '*No bio set*')
      .setThumbnail(profile.avatarUrl || targetUser.displayAvatarURL({ size: 256 }))
      .addFields(
        {
          name: '🏷️ Username',
          value: profile.username,
          inline: true,
        },
        {
          name: '🏅 League',
          value: `${leagueEmoji} ${profile.league.charAt(0).toUpperCase() + profile.league.slice(1)} (${profile.leaguePoints} LP)`,
          inline: true,
        },
        {
          name: '🎮 Tournaments',
          value: `${profile.totalTournamentsPlayed} played`,
          inline: true,
        },
        {
          name: '🏆 Wins',
          value: `${profile.totalWins} (${winRate}%)`,
          inline: true,
        },
        {
          name: '⚔️ Kills / Deaths',
          value: `${profile.totalKills} / ${profile.totalDeaths}`,
          inline: true,
        },
        {
          name: '📊 K/D Ratio',
          value: kdRatio,
          inline: true,
        },
        {
          name: '💰 Prize Won',
          value: profile.totalPrizeWon > 0 ? `₹${profile.totalPrizeWon.toLocaleString()}` : '₹0',
          inline: true,
        },
        {
          name: '📅 Joined',
          value: `<t:${Math.floor(profile.createdAt.getTime() / 1000)}:R>`,
          inline: true,
        },
      )
      .setFooter({
        text: 'Aether Arena • Click title to view full profile',
      })
      .setTimestamp()

    await interaction.editReply({ embeds: [embed] })
  } catch (error) {
    console.error('[profile] Error:', error)
    await interaction.editReply({
      content: '❌ Failed to fetch profile. Please try again later.',
    })
  }
}
