var Quotes = require("anime-quotes-api");
let { MessageEmbed } = require("discord.js");

module.exports = {
  name: "quote",
  description: "Random anime quote",
  perms: [],
  timeout: 3000,
  category: "Roleplay",
  execute: async function (message, args) {
    var quote = new Quotes();
    var get_quotes = await quote.quotes();
    let em = new MessageEmbed()
      .setTitle(get_quotes[0].title)
      .setDescription(get_quotes[0].quote);
    message.channel.send(em);
  },
};
