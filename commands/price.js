const CoinGecko = require('coingecko-api')

const coinGeckoClient = new CoinGecko()

const previousValues = {}

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

      const differenceString = this.calculateDifferenceString(
        coin,
        coinValueAud,
        previousValues
      )
      output = output.concat(differenceString)

      message.channel.send(`${output}.`)

      previousValues[coin] = coinValueAud
    } catch (err) {
      console.error(err.message)
      message.channel.send(`No results found for '${coin}'.`)
    }

    message.channel.stopTyping()
  },
  calculateDifferenceString(coin, coinValueAud, previousValues) {
    const previousValue = previousValues[coin]

    if (!previousValue) {
      return ''
    }

    const difference = coinValueAud - previousValue
    const differencePercentage = (difference / previousValue) * 100

    return ` (${
      differencePercentage >= 0 ? '+' : ''
    }${differencePercentage.toFixed(2)}%)`
  }
}
