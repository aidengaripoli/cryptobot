const Discord = require('discord.js')
const CoinGecko = require('coingecko-api')
require('dotenv').config()

const { BOT_TOKEN } = process.env

const discordClient = new Discord.Client()
const coinGeckoClient = new CoinGecko()

const prefix = '!'

const previousValues = {}

discordClient.once('ready', () => {
  console.log('ready')
})

discordClient.on('message', async message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return

  message.channel.startTyping()

  const args = message.content.slice(prefix.length).split(/ +/)

  if (args.length < 2) {
    message.channel.send('invalid command')
  }

  const command = args.shift().toLowerCase()
  const coin = args.shift().toLowerCase()

  if (command === 'price') {
    try {
      const body = await coinGeckoClient.simple.price({ ids: coin, vs_currencies: 'aud' })
      const coinValueAud = body.data[coin].aud

      let output = `$${coinValueAud} AUD`

      if (previousValues[coin]) {
        const differenceString = calculateDifferenceString(coin, coinValueAud)
        output = output.concat(differenceString)
      }

      message.channel.send(`${output}.`)

      previousValues[coin] = coinValueAud
    } catch (err) {
      console.log('err getting coin')
      message.channel.send(`No results found for '${coin}'.`)
    }
  }

  message.channel.stopTyping()

})

const calculateDifferenceString = (coin, coinValueAud) => {
  const previousValue = previousValues[coin]

  const difference = coinValueAud - previousValue
  let sign = '+'

  if (difference < 0) {
    sign = '-'
  } else if (difference > 0) {
    sign = '+'
  }

  return ` (${sign}${difference})`
}

process.on('unhandledRejection', error => console.error('Uncaught Promise Rejection', error))

discordClient.login(BOT_TOKEN)
