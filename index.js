const fs = require('fs')
const Discord = require('discord.js')
require('dotenv').config()

const { BOT_TOKEN } = process.env
const { prefix } = require('./config.json')

const discordClient = new Discord.Client()

discordClient.commands = new Discord.Collection()
const commandFiles = fs
  .readdirSync('./commands')
  .filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
  const command = require(`./commands/${file}`)
  discordClient.commands.set(command.name, command)
}

const cooldowns = new Discord.Collection()

discordClient.once('ready', () => {
  console.log('ready')
})

discordClient.on('message', async message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return

  const args = message.content.slice(prefix.length).split(/ +/)
  const commandName = args.shift().toLowerCase()

  const command =
    discordClient.commands.get(commandName) ||
    discordClient.commands.find(
      cmd => cmd.aliases && cmd.aliases.includes(commandName)
    )

  if (!command) return

  if (command.args && !args.length) {
    let reply = 'Invalid number of arguments.'

    if (command.usage) {
      reply += `\nUsage: \`${prefix}${command.name} ${command.usage}\``
    }

    return message.channel.send(reply)
  }

  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Discord.Collection())
  }

  const now = Date.now()
  const timestamps = cooldowns.get(command.name)
  const cooldownAmount = (command.cooldown || 3) * 1000

  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000
      return message.reply(
        `Please wait ${timeLeft.toFixed(
          1
        )} more second(s) before reusing the \`${command.name}\` command.`
      )
    }
  }

  timestamps.set(message.author.id, now)
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount)

  try {
    command.execute(message, args)
  } catch (err) {
    console.error(err)
    message.reply('There was an error executing the command.')
  }
})

process.on('unhandledRejection', error =>
  console.error('Uncaught Promise Rejection', error)
)

discordClient.login(BOT_TOKEN)
