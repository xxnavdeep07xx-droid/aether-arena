import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  ButtonInteraction,
  ComponentType,
} from 'discord.js'
import { db } from '../lib/db'
const BRAND_COLOR = 0x9333ea
const PAGE_SIZE = 10

export const data = new SlashCommandBuilder()
  .setName('leaderboard')
  .setDescription('View the top players ranked by performance')
  .addStringOption((option) =>
    option.setName('game').setDescription('Filter by game name (e.g., BGMI, Free Fire)').setRequired(false)
  )

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply()

  try {
    const gameOption = interaction.options.get('game')?.value as string | undefined

    // Try to find the game by name or slug
    let gameFilter = undefined
    if (gameOption) {
      const game = await db.game.findFirst({
        where: {
          OR: [
            { name: { contains: gameOption, mode: 'insensitive' } },
            { slug: { contains: gameOption, mode: 'insensitive' } },
          ],
        },
      })
      gameFilter = game?.id
    }

    const whereClause = gameFilter ? { gameId: gameFilter } : {}

    const totalEntries = await db.leaderboard.count({
      where: { ...whereClause, period: 'all_time' },
    })

    if (totalEntries === 0) {
      const noEntries = new EmbedBuilder()
        .setColor(BRAND_COLOR)
        .setTitle('🏆 Leaderboard')
        .setDescription(
          gameOption
            ? `No leaderboard entries found for **${gameOption}**. Play some tournaments to climb the ranks!`
            : 'No leaderboard entries yet. Play some tournaments to climb the ranks!'
        )
        .setFooter({ text: 'Aether Arena' })
        .setTimestamp()

      await interaction.editReply({ embeds: [noEntries] })
      return
    }

    const maxPage = Math.ceil(totalEntries / PAGE_SIZE)
    let currentPage = 0

    const embed = await buildLeaderboardPage(currentPage, gameFilter, gameOption)

    const prevButton = new ButtonBuilder()
      .setCustomId('lb-prev')
      .setLabel('← Previous')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(currentPage === 0)

    const nextButton = new ButtonBuilder()
      .setCustomId('lb-next')
      .setLabel('Next →')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(currentPage >= maxPage - 1)

    const pageInfo = new ButtonBuilder()
      .setCustomId('lb-info')
      .setLabel(`Page ${currentPage + 1} / ${maxPage}`)
      .setStyle(ButtonStyle.Primary)
      .setDisabled(true)

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(prevButton, pageInfo, nextButton)

    const reply = await interaction.editReply({
      embeds: [embed],
      components: [row],
    })

    const collector = reply.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 120_000,
    })

    collector.on('collect', async (buttonInteraction: ButtonInteraction) => {
      await buttonInteraction.deferUpdate()

      if (buttonInteraction.customId === 'lb-prev' && currentPage > 0) {
        currentPage--
      } else if (buttonInteraction.customId === 'lb-next' && currentPage < maxPage - 1) {
        currentPage++
      }

      const newEmbed = await buildLeaderboardPage(currentPage, gameFilter, gameOption)

      const updatedPrev = ButtonBuilder.from(prevButton).setDisabled(currentPage === 0)
      const updatedNext = ButtonBuilder.from(nextButton).setDisabled(currentPage >= maxPage - 1)
      const updatedInfo = ButtonBuilder.from(pageInfo).setLabel(`Page ${currentPage + 1} / ${maxPage}`)

      const updatedRow = new ActionRowBuilder<ButtonBuilder>().addComponents(updatedPrev, updatedInfo, updatedNext)

      await buttonInteraction.editReply({
        embeds: [newEmbed],
        components: [updatedRow],
      })
    })

    collector.on('end', async () => {
      const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        ButtonBuilder.from(prevButton).setDisabled(true),
        ButtonBuilder.from(pageInfo).setDisabled(true),
        ButtonBuilder.from(nextButton).setDisabled(true)
      )
      try {
        await interaction.editReply({ components: [disabledRow] })
      } catch {
        // Message may have been deleted
      }
    })
  } catch (error) {
    console.error('[leaderboard] Error:', error)
    await interaction.editReply({
      content: '❌ Failed to fetch leaderboard. Please try again later.',
    })
  }
}

async function buildLeaderboardPage(
  page: number,
  gameId?: string,
  gameLabel?: string
): Promise<EmbedBuilder> {
  const skip = page * PAGE_SIZE

  const entries = await db.leaderboard.findMany({
    where: {
      period: 'all_time',
      ...(gameId ? { gameId } : {}),
    },
    include: {
      player: {
        select: { username: true, displayName: true, avatarUrl: true },
      },
      game: {
        select: { name: true },
      },
    },
    orderBy: { totalPoints: 'desc' },
    skip,
    take: PAGE_SIZE,
  })

  const rankMedals: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

  const description = entries
    .map((entry) => {
      const rank = skip + entry.rank
      const medal = rankMedals[rank] || `**#${rank}**`
      const name = entry.player.displayName || entry.player.username
      const kd = entry.kdRatio.toFixed(2)
      const winRate = ((entry.winRate || 0) * 100).toFixed(0)

      return `${medal} **${name}** — 🏅 ${entry.totalPoints} pts | 🏆 ${entry.totalWins}W | ⚔️ ${kd} K/D | 📊 ${winRate}% WR`
    })
    .join('\n\n')

  const title = gameLabel ? `🏆 Leaderboard — ${gameLabel}` : '🏆 All-Time Leaderboard'

  const embed = new EmbedBuilder()
    .setColor(BRAND_COLOR)
    .setTitle(title)
    .setDescription(description || 'No entries on this page.')
    .setFooter({ text: 'Aether Arena • Use /tournaments to compete' })
    .setTimestamp()

  if (entries.length > 0 && entries[0].player.avatarUrl) {
    embed.setThumbnail(entries[0].player.avatarUrl)
  }

  return embed
}
