const Redis = require('ioredis')
const redis = new Redis(process.env.REDIS_URL)

const REDIS_COINS_HASH = 'coins'
const REDIS_USERS_PREF_HASH = 'userpreference'

module.exports = {
  name: 'set',
  aliases: ['s'],
  description: 'Set preferred coins',
  args: true,
  usage: '<coin,coin,coin,...>',
  async execute(message, args) {
    message.channel.startTyping()

    const coinsRequested = args[0].split(',')

    // verify each coin id one by one.
    const coinIds = []
    for (let coinReq of coinsRequested) {
      const symbolExists = await redis.hexists(REDIS_COINS_HASH, coinReq)
      if (symbolExists) {
        const coinId = await redis.hget(REDIS_COINS_HASH, coinReq)
        coinIds.push(coinId)
      } else {
        message.channel.send(`No results found for '${coinReq}'.`)
        return
      }
    }

    // save coin prefs for a user
    redis.hset(REDIS_USERS_PREF_HASH, message.author.id, coinIds.join(','))

    message.channel.stopTyping()
  }
}
