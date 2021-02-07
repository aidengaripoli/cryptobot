const CoinGecko = require('coingecko-api')
const Redis = require('ioredis')
const redis = new Redis(process.env.REDIS_URL)

const REDIS_COINS_HASH = 'coins'
const REDIS_PREVIOUS_VALUES = 'prev_values'

const coinGeckoClient = new CoinGecko()

module.exports = {
  name: 'price',
  aliases: ['p'],
  description: 'Coin price',
  args: true,
  usage: '<coin>',
  async execute(message, args) {
    message.channel.startTyping()

    const userInput = args[0]
    let coinId = null

    // check if user input is a symbol, if so, use ID instead
    // if not, attempt to fetch with user input
    const symbolExists = await redis.hexists(REDIS_COINS_HASH, userInput)
    if (symbolExists) {
      coinId = await redis.hget(REDIS_COINS_HASH, userInput)
    } else {
      coinId = userInput
    }

    try {
      const body = await coinGeckoClient.simple.price({
        ids: coinId,
        vs_currencies: 'aud'
      })

      if (body.data[coinId].aud === undefined) {
        throw new Error('Invalid API Response.')
      }

      if (body.data[coinId] === undefined) {
        throw new Error('Coin does not exist.')
      }

      const coinValueAud = body.data[coinId].aud

      let output = `$${coinValueAud} AUD`

      const previousValue = await redis.hget(REDIS_PREVIOUS_VALUES, coinId)
      const differenceString = this.calculateDifferenceString(
        coinValueAud,
        previousValue
      )
      output = output.concat(differenceString)

      message.channel.send(`${output}.`)

      await redis.hset(REDIS_PREVIOUS_VALUES, coinId, coinValueAud)
    } catch (err) {
      console.error(`${err.message} - ${coinId} - ${userInput}`)
      message.channel.send(`No results found for '${coinId}'.`)
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
