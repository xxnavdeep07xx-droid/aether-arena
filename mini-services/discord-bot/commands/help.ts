import { SlashCommandBuilder, EmbedBuilder, CommandInteraction } from 'discord.js'

const BRAND_COLOR = 0x9333ea

export const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('Shows all available Aether Arena bot commands')

export async function execute(interaction: CommandInteraction) {
  const embed = new EmbedBuilder()
    .setColor(BRAND_COLOR)
    .setTitle('⚔️ Aether Arena — Bot Commands')
    .setDescription(
      'Aether Arena is your ultimate gaming tournament platform. Use the commands below to explore tournaments, check leaderboards, and manage your profile.'
    )
    .setThumbnail('https://aether-arena.vercel.app/logo.png')
    .addFields(
      {
        name: '📋 `/tournaments`',
        value:
          'Browse active and upcoming tournaments. Filter by game or status to find your next match.',
        inline: false,
      },
      {
        name: '🏆 `/leaderboard`',
        value:
          'View the top players ranked by points, wins, and K/D ratio. Optionally filter by game.',
        inline: false,
      },
      {
        name: '👤 `/profile`',
        value:
          'Check your or another player\'s stats — league, wins, K/D, prize earnings, and more.',
        inline: false,
      },
      {
        name: '🎮 `/register`',
        value:
          'Create your Aether Arena account and link it to your Discord identity.',
        inline: false,
      },
      {
        name: '💳 `/topup`',
        value:
          'Browse available top-up packs for your favorite games with the best deals.',
        inline: false,
      },
      {
        name: '❓ `/help`',
        value: 'Show this help message.',
        inline: false,
      },
    )
    .setFooter({
      text: 'Aether Arena • Powered by Discord',
      iconURL: 'https://aether-arena.vercel.app/logo.png',
    })
    .setTimestamp()

  await interaction.reply({ embeds: [embed] })
}
