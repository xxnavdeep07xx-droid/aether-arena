import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  CommandInteraction,
  ComponentType,
} from 'discord.js'
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()
const BRAND_COLOR = 0x9333ea
const BASE_URL = process.env.BASE_URL || 'https://aether-arena.vercel.app'

function statusBadge(status: string): string {
  switch (status.toLowerCase()) {
    case 'open':
      return '🟢 Open'
    case 'upcoming':
      return '🔵 Upcoming'
    case 'live':
    case 'in_progress':
      return '🟡 Live'
    case 'closed':
    case 'completed':
      return '🔴 Closed'
    default:
      return `⚪ ${status}`
  }
}

function formatDate(date: Date | null | undefined): string {
  if (!date) return 'TBD'
  return `<t:${Math.floor(date.getTime() / 1000)}:R>`
}

export const data = new SlashCommandBuilder()
  .setName('tournaments')
  .setDescription('Browse active and upcoming tournaments')

export async function execute(interaction: CommandInteraction) {
  await interaction.deferReply()

  try {
    // Fetch all tournaments that are open, upcoming, or live
    const tournaments = await db.tournament.findMany({
      where: {
        status: { in: ['open', 'upcoming', 'live', 'in_progress'] },
      },
      include: { game: true },
      orderBy: [{ startTime: 'asc' }, { createdAt: 'desc' }],
      take: 25,
    })

    if (tournaments.length === 0) {
      const noTournaments = new EmbedBuilder()
        .setColor(BRAND_COLOR)
        .setTitle('🎮 No Active Tournaments')
        .setDescription(
          'There are no active or upcoming tournaments right now. Check back soon or visit the website!'
        )
        .setURL(`${BASE_URL}/tournaments`)
        .setFooter({ text: 'Aether Arena' })
        .setTimestamp()

      await interaction.editReply({ embeds: [noTournaments] })
      return
    }

    // Build select menu for filtering
    const gameNames = [...new Set(tournaments.map((t) => t.game.name))]
    const statuses = [...new Set(tournaments.map((t) => t.status))]

    const filterOptions = [
      {
        label: '🏆 All Tournaments',
        value: 'all',
        description: `Showing all ${tournaments.length} tournaments`,
      },
      ...statuses.map((s) => ({
        label: `${statusBadge(s).split(' ')[1]} Tournaments`,
        value: `status:${s}`,
        description: `Filter by ${s} status`,
      })),
      ...gameNames.slice(0, 10).map((name) => ({
        label: `🎮 ${name}`,
        value: `game:${name}`,
        description: `Filter by ${name}`,
      })),
    ]

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('tournament-filter')
      .setPlaceholder('Filter tournaments...')
      .addOptions(filterOptions)

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu)

    // Build initial embeds — show first 3 tournaments
    const embeds = buildTournamentEmbeds(tournaments.slice(0, 3))

    const reply = await interaction.editReply({
      content: `📋 Found **${tournaments.length}** active tournament(s) — showing first 3. Use the filter to narrow down.`,
      embeds,
      components: [row],
    })

    // Handle select menu interaction
    const collector = reply.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 60_000,
    })

    collector.on('collect', async (selectInteraction) => {
      await selectInteraction.deferUpdate()

      const selected = selectInteraction.values[0]
      let filtered = tournaments

      if (selected.startsWith('status:')) {
        const status = selected.replace('status:', '')
        filtered = tournaments.filter((t) => t.status === status)
      } else if (selected.startsWith('game:')) {
        const gameName = selected.replace('game:', '')
        filtered = tournaments.filter((t) => t.game.name === gameName)
      }

      const newEmbeds = filtered.length
        ? buildTournamentEmbeds(filtered.slice(0, 3))
        : [
            new EmbedBuilder()
              .setColor(BRAND_COLOR)
              .setDescription('No tournaments match this filter.')
              .setFooter({ text: 'Aether Arena' }),
          ]

      await selectInteraction.editReply({
        content: `📋 Showing **${filtered.length}** tournament(s).`,
        embeds: newEmbeds,
        components: [row],
      })
    })

    collector.on('end', async () => {
      // Disable menu after timeout
      const disabledRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        selectMenu.setDisabled(true)
      )
      try {
        await interaction.editReply({ components: [disabledRow] })
      } catch {
        // Message may have been deleted
      }
    })
  } catch (error) {
    console.error('[tournaments] Error:', error)
    await interaction.editReply({
      content: '❌ Failed to fetch tournaments. Please try again later.',
    })
  }
}

function buildTournamentEmbeds(
  tournaments: {
    id: string
    title: string
    description: string
    format: string
    entryFee: number
    prizePool: number
    maxPlayers: number
    registeredPlayers: number
    status: string
    startTime: Date | null
    registrationEnd: Date | null
    game: { name: string; slug: string }
  }[]
): EmbedBuilder[] {
  return tournaments.map((t) => {
    const embed = new EmbedBuilder()
      .setColor(BRAND_COLOR)
      .setTitle(`${statusBadge(t.status)}  ${t.title}`)
      .setURL(`${BASE_URL}/tournaments`)
      .addFields(
        {
          name: '🎮 Game',
          value: t.game.name,
          inline: true,
        },
        {
          name: '📐 Format',
          value: t.format.charAt(0).toUpperCase() + t.format.slice(1),
          inline: true,
        },
        {
          name: '💰 Entry Fee',
          value: t.entryFee > 0 ? `₹${t.entryFee}` : 'Free',
          inline: true,
        },
        {
          name: '🏆 Prize Pool',
          value: t.prizePool > 0 ? `₹${t.prizePool}` : '—',
          inline: true,
        },
        {
          name: '👥 Players',
          value: `${t.registeredPlayers} / ${t.maxPlayers}`,
          inline: true,
        },
        {
          name: '🕐 Starts',
          value: formatDate(t.startTime),
          inline: true,
        },
      )

    if (t.description) {
      embed.setDescription(t.description.length > 200 ? t.description.slice(0, 200) + '…' : t.description)
    }

    embed.setFooter({ text: 'Aether Arena • Click title to view on website' }).setTimestamp()

    return embed
  })
}
