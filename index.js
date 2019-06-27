const Discord = require('discord.js')
const client = new Discord.Client()

require('dotenv').config()

const { BOT_TOKEN } = process.env

client.once('ready', () => {
  console.log('ready')
})

client.login(BOT_TOKEN)
