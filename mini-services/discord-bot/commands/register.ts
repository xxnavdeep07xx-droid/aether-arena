import { SlashCommandBuilder, EmbedBuilder, CommandInteraction } from 'discord.js'
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()
const BRAND_COLOR = 0x9333ea
const BASE_URL = process.env.BASE_URL || 'https://aether-arena.vercel.app'

export const data = new SlashCommandBuilder()
  .setName('register')
  .setDescription('Register an Aether Arena account linked to your Discord')
  .addStringOption((option) =>
    option
      .setName('username')
      .setDescription('Choose your Aether Arena username')
      .setRequired(true)
      .setMinLength(3)
      .setMaxLength(24)
  )

export async function execute(interaction: CommandInteraction) {
  await interaction.deferReply({ ephemeral: true })

  try {
    const username = interaction.options.get('username')!.value! as string
    const discordId = interaction.user.id
    const discordUsername = `${interaction.user.username}#${interaction.user.discriminator}`

    // Check if this Discord user already has a profile
    const existingByDiscord = await db.profile.findUnique({
      where: { discordId },
    })

    if (existingByDiscord) {
      const alreadyExists = new EmbedBuilder()
        .setColor(BRAND_COLOR)
        .setTitle('⚠️ Already Registered')
        .setDescription(
          `Your Discord account is already linked to **${existingByDiscord.username}**.\n\nIf you want to change your username, please do so from the website.`
        )
        .setURL(`${BASE_URL}/profile/${existingByDiscord.username}`)
        .setFooter({ text: 'Aether Arena' })
        .setTimestamp()

      await interaction.editReply({ embeds: [alreadyExists] })
      return
    }

    // Check if the username is already taken
    const existingByUsername = await db.profile.findUnique({
      where: { username },
    })

    if (existingByUsername) {
      // Suggest alternatives
      const suffixes = ['_gg', '_pro', '_yt', '2', '01', '_x', '']
      const suggestions = suffixes
        .map((s) => `${username}${s}`)
        .filter((s) => s !== username)
        .slice(0, 5)

      const taken = new EmbedBuilder()
        .setColor(0xed4245) // Red
        .setTitle('❌ Username Taken')
        .setDescription(
          `The username **${username}** is already taken.\n\nHere are some suggestions:\n${suggestions.map((s) => `• \`${s}\``).join('\n')}`
        )
        .setFooter({ text: 'Aether Arena' })
        .setTimestamp()

      await interaction.editReply({ embeds: [taken] })
      return
    }

    // Create the profile
    const profile = await db.profile.create({
      data: {
        username,
        discordId,
        discordUsername,
        displayName: interaction.user.globalName || interaction.user.username,
        avatarUrl: interaction.user.displayAvatarURL({ size: 256, extension: 'png' }),
      },
    })

    const success = new EmbedBuilder()
      .setColor(0x57f287) // Green
      .setTitle('✅ Registration Successful!')
      .setDescription(
        `Welcome to Aether Arena, **${profile.username}**!\n\nYour account is now linked to your Discord. You can:\n• Browse and join tournaments with \`/tournaments\`\n• Check your stats with \`/profile\`\n• View the leaderboard with \`/leaderboard\``
      )
      .setURL(`${BASE_URL}/profile/${profile.username}`)
      .setThumbnail(interaction.user.displayAvatarURL({ size: 256 }))
      .setFooter({
        text: 'Aether Arena • Click title to view your profile',
      })
      .setTimestamp()

    await interaction.editReply({ embeds: [success] })
  } catch (error) {
    console.error('[register] Error:', error)
    await interaction.editReply({
      content: '❌ Failed to create your account. The username may be invalid. Please try again.',
    })
  }
}
