const Discord = require('discord.js')
const CoinGecko = require('coingecko-api')
// const fetch = require('node-fetch')
require('dotenv').config()

const { BOT_TOKEN } = process.env

const discordClient = new Discord.Client()
const coinGeckoClient = new CoinGecko()

const prefix = '!'

discordClient.once('ready', () => {
  console.log('ready')
})

discordClient.on('message', async message => {
  console.log(message.content)
  
  if (!message.content.startsWith(prefix) || message.author.bot) return

  message.channel.startTyping()

  const args = message.content.slice(prefix.length).split(/ +/)

  if (args.length < 2) {
    message.channel.send('invalid command')
  }

  const command = args.shift().toLowerCase()
  const coin = args.shift().toLowerCase()

  console.log(command, coin)

  if (command === 'price') {
    try {
      const body = await coinGeckoClient.simple.price({ ids: coin, vs_currencies: 'aud' })
      console.log(body.data[coin].aud)
      message.channel.send(`$${body.data[coin].aud} AUD.`)
    } catch (err) {
      console.log('err getting coin')
      message.channel.send(`No results found for '${coin}'.`)
    }
  }

  message.channel.stopTyping()

})

discordClient.login(BOT_TOKEN)
