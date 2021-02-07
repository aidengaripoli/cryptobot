const fs = require('fs')
const Discord = require('discord.js')
const CoinGecko = require('coingecko-api')
const Redis = require('ioredis')
require('dotenv').config()

const { BOT_TOKEN, REDIS_URL } = process.env
const REDIS_COINS_HASH = 'coins'
const { prefix } = require('./config.json')

const discordClient = new Discord.Client()
const redis = new Redis(REDIS_URL)
const coinGeckoClient = new CoinGecko()

discordClient.commands = new Discord.Collection()
const commandFiles = fs
  .readdirSync('./commands')
  .filter(file => file.endsWith('.js'))
  .filter(file => !file.includes('test'))

for (const file of commandFiles) {
  const command = require(`./commands/${file}`)
  discordClient.commands.set(command.name, command)
}

discordClient.once('ready', () => {
  initialiseCoinsList()
  console.log('ready')
})

const initialiseCoinsList = async () => {
  const { data } = await coinGeckoClient.coins.list()
  for (const coin of data) {
    await redis.hset(REDIS_COINS_HASH, coin.symbol, coin.id)
  }
}

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
