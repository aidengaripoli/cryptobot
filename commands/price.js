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

      if (previousValues[coin]) {
        const differenceString = calculateDifferenceString(coin, coinValueAud)
        output = output.concat(differenceString)
      }

      message.channel.send(`${output}.`)

      previousValues[coin] = coinValueAud
    } catch (err) {
      message.channel.send(`No results found for '${coin}'.`)
    }

    message.channel.stopTyping()
  }
}

const calculateDifferenceString = (coin, coinValueAud) => {
  const previousValue = previousValues[coin]

  const difference = coinValueAud - previousValue

  return ` (${difference > 0 ? '+' : ''}${difference})`
}
