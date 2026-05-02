import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, Interaction } from 'discord.js'
import { PrismaClient } from '@prisma/client'

import { data as tournamentsData, execute as tournamentsExecute } from './commands/tournaments'
import { data as leaderboardData, execute as leaderboardExecute } from './commands/leaderboard'
import { data as profileData, execute as profileExecute } from './commands/profile'
import { data as registerData, execute as registerExecute } from './commands/register'
import { data as helpData, execute as helpExecute } from './commands/help'
import { data as topupData, execute as topupExecute } from './commands/topup'

// ─── Config ──────────────────────────────────────────────
const DISCORD_TOKEN = process.env.DISCORD_TOKEN
const CLIENT_ID = process.env.CLIENT_ID

if (!DISCORD_TOKEN) {
  console.error('[ERROR] DISCORD_TOKEN environment variable is required.')
  process.exit(1)
}
if (!CLIENT_ID) {
  console.error('[ERROR] CLIENT_ID environment variable is required.')
  process.exit(1)
}

// ─── Prisma ──────────────────────────────────────────────
const db = new PrismaClient()

// ─── Commands Map ────────────────────────────────────────
const commands: { data: any; execute: (interaction: any) => Promise<void> }[] = [
  { data: tournamentsData, execute: tournamentsExecute },
  { data: leaderboardData, execute: leaderboardExecute },
  { data: profileData, execute: profileExecute },
  { data: registerData, execute: registerExecute },
  { data: helpData, execute: helpExecute },
  { data: topupData, execute: topupExecute },
]

const commandMap = new Map<string, (interaction: any) => Promise<void>>()
commands.forEach((cmd) => {
  commandMap.set(cmd.data.name, cmd.execute)
})

// ─── Client ──────────────────────────────────────────────
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
})

// ─── Register Slash Commands ─────────────────────────────
async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN!)

  try {
    console.log(`[REGISTER] Registering ${commands.length} application (/) commands...`)

    const body = commands.map((cmd) => cmd.data.toJSON())

    await rest.put(Routes.applicationCommands(CLIENT_ID), { body })

    console.log('[REGISTER] ✅ Successfully registered all application commands.')
  } catch (error) {
    console.error('[REGISTER] ❌ Failed to register commands:', error)
    process.exit(1)
  }
}

// ─── Events ──────────────────────────────────────────────
client.once('ready', async () => {
  console.log(`[BOT] ✅ Logged in as ${client.user!.tag} (ID: ${client.user!.id})`)
  console.log(`[BOT] 🌐 Serving in ${client.guilds.cache.size} guild(s)`)

  // Set presence
  client.user!.setActivity('Aether Arena | /help', { type: 3 }) // Watching

  await registerCommands()
})

client.on('interactionCreate', async (interaction: Interaction) => {
  if (!interaction.isChatInputCommand()) return

  const commandName = interaction.commandName
  const execute = commandMap.get(commandName)

  if (!execute) {
    console.warn(`[BOT] ⚠️ Unknown command: ${commandName}`)
    await interaction.reply({ content: '❌ Unknown command.', ephemeral: true })
    return
  }

  try {
    await execute(interaction)
  } catch (error) {
    console.error(`[BOT] ❌ Error executing /${commandName}:`, error)

    // Try to respond if not already replied
    const hasReplied = interaction.replied || interaction.deferred
    if (hasReplied) {
      await interaction.followUp({
        content: '❌ An unexpected error occurred while running this command.',
        ephemeral: true,
      })
    } else {
      await interaction.reply({
        content: '❌ An unexpected error occurred while running this command.',
        ephemeral: true,
      })
    }
  }
})

// ─── Graceful Shutdown ───────────────────────────────────
function shutdown(signal: string) {
  console.log(`\n[SHUTDOWN] ${signal} received. Shutting down gracefully...`)

  client
    .destroy()
    .then(() => {
      console.log('[SHUTDOWN] Discord client disconnected.')
      return db.$disconnect()
    })
    .then(() => {
      console.log('[SHUTDOWN] Database connection closed.')
      process.exit(0)
    })
    .catch((err) => {
      console.error('[SHUTDOWN] Error during shutdown:', err)
      process.exit(1)
    })
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

// ─── Login ───────────────────────────────────────────────
console.log('[BOT] 🚀 Starting Aether Arena Discord Bot...')
client.login(DISCORD_TOKEN).catch((err) => {
  console.error('[BOT] ❌ Failed to login:', err)
  process.exit(1)
})
