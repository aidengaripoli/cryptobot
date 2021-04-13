const CoinGecko = require('coingecko-api')
const Redis = require('ioredis')
const redis = new Redis(process.env.REDIS_URL)

const REDIS_USERS_PREF_HASH = 'userpreference'

const coinGeckoClient = new CoinGecko()

module.exports = {
  name: 'check',
  aliases: ['c'],
  description: 'Check user set coins',
  args: false,
  usage: '[command name]',
  async execute(message, args) {
    message.channel.startTyping()

    // get coins for a user
    const userPrefs = await redis.hget(REDIS_USERS_PREF_HASH, message.author.id)
    const coins = userPrefs.split(',')

    try {
      const body = await coinGeckoClient.simple.price({
        ids: coins,
        vs_currencies: 'aud'
      })

      let output = ''
      for (const coinName in body.data) {
        const capitalisedCoinName =
          coinName.charAt(0).toUpperCase() + coinName.slice(1)
        const coinValue = body.data[coinName].aud
        output = output.concat(`${capitalisedCoinName}: $${coinValue}\n`)
      }

      message.channel.send(output)
    } catch (err) {
      console.error(err.message)
      message.channel.send(`Yikes... something went wrong.`)
    }

    message.channel.stopTyping()
  }
}
