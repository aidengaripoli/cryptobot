const CoinGecko = require('coingecko-api')
const Redis = require('ioredis')
const redis = new Redis(process.env.REDIS_URL)

const coinGeckoClient = new CoinGecko()

module.exports = {
  name: 'price',
  aliases: ['p'],
  description: 'Coin price',
  args: true,
  usage: '<coin>',
  cooldown: 5,
  async execute(message, args) {
    message.channel.startTyping()

    const coin = args[0]

    try {
      const body = await coinGeckoClient.simple.price({
        ids: coin,
        vs_currencies: 'aud'
      })
      const coinValueAud = body.data[coin].aud

      let output = `$${coinValueAud} AUD`

      const previousValue = await redis.hget('coins', coin)
      const differenceString = this.calculateDifferenceString(
        coinValueAud,
        previousValue
      )
      output = output.concat(differenceString)

      message.channel.send(`${output}.`)

      await redis.hset('coins', coin, coinValueAud)
    } catch (err) {
      console.error(err.message)
      message.channel.send(`No results found for '${coin}'.`)
    }

    message.channel.stopTyping()
  },
  calculateDifferenceString(coinValueAud, previousValue) {
    if (!previousValue || !coinValueAud) {
      return ''
    }

    const difference = coinValueAud - previousValue
    const differencePercentage = (difference / previousValue) * 100

    return ` (${
      differencePercentage >= 0 ? '+' : ''
    }${differencePercentage.toFixed(2)}%)`
  }
}
