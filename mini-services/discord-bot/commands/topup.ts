import { SlashCommandBuilder, EmbedBuilder, CommandInteraction } from 'discord.js'
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()
const BRAND_COLOR = 0x9333ea
const BASE_URL = process.env.BASE_URL || 'https://aether-arena.vercel.app'

export const data = new SlashCommandBuilder()
  .setName('topup')
  .setDescription('Browse available top-up packs for games')
  .addStringOption((option) =>
    option.setName('game').setDescription('Filter by game name (e.g., BGMI, Free Fire)').setRequired(false)
  )

export async function execute(interaction: CommandInteraction) {
  await interaction.deferReply()

  try {
    const gameOption = interaction.options.get('game')?.value as string | undefined

    // Try to find game by name or slug
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
      gameFilter = game?.slug
    }

    const packs = await db.topupPack.findMany({
      where: {
        isActive: true,
        ...(gameFilter ? { gameSlug: gameFilter } : {}),
      },
      orderBy: [{ sortOrder: 'asc' }, { price: 'asc' }],
      take: 10,
    })

    if (packs.length === 0) {
      const noPacks = new EmbedBuilder()
        .setColor(BRAND_COLOR)
        .setTitle('💳 Top-Up Packs')
        .setDescription(
          gameOption
            ? `No top-up packs found for **${gameOption}**.`
            : 'No top-up packs available at the moment. Check back soon!'
        )
        .setURL(`${BASE_URL}`)
        .setFooter({ text: 'Aether Arena' })
        .setTimestamp()

      await interaction.editReply({ embeds: [noPacks] })
      return
    }

    // Group packs by game
    const grouped = packs.reduce(
      (acc, pack) => {
        if (!acc[pack.gameName]) acc[pack.gameName] = []
        acc[pack.gameName].push(pack)
        return acc
      },
      {} as Record<string, typeof packs>
    )

    const embeds = Object.entries(grouped).map(([gameName, gamePacks]) => {
      const embed = new EmbedBuilder()
        .setColor(BRAND_COLOR)
        .setTitle(`💳 ${gameName} — Top-Up Packs`)
        .setURL(`${BASE_URL}`)

      gamePacks.slice(0, 5).forEach((pack, i) => {
        const hasDiscount = pack.originalPrice > 0 && pack.originalPrice > pack.price
        const priceField = hasDiscount
          ? `~~₹${pack.originalPrice}~~ ₹${pack.price} 🏷️`
          : pack.price > 0
            ? `₹${pack.price}`
            : 'Free'

        const fieldValue = [
          priceField,
          pack.description ? `\n${pack.description.length > 100 ? pack.description.slice(0, 100) + '…' : pack.description}` : '',
          pack.affiliateUrl ? `\n🔗 [Get Pack](${pack.affiliateUrl})` : '',
        ]
          .filter(Boolean)
          .join('')

        embed.addFields({
          name: `📦 ${pack.packName}`,
          value: fieldValue,
          inline: false,
        })
      })

      // Use first pack's image if available
      const firstPackWithImage = gamePacks.find((p) => p.imageUrl)
      if (firstPackWithImage?.imageUrl) {
        embed.setImage(firstPackWithImage.imageUrl)
      }

      embed.setFooter({ text: 'Aether Arena • Click links to purchase' }).setTimestamp()

      return embed
    })

    // Discord allows max 10 embeds
    const replyEmbeds = embeds.slice(0, 10)

    await interaction.editReply({
      content: `💳 Showing **${packs.length}** top-up pack(s)${gameOption ? ` for **${gameOption}**` : ''}.`,
      embeds: replyEmbeds,
    })
  } catch (error) {
    console.error('[topup] Error:', error)
    await interaction.editReply({
      content: '❌ Failed to fetch top-up packs. Please try again later.',
    })
  }
}
