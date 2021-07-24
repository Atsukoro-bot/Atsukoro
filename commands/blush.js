const axios = require("axios");
let { MessageEmbed } = require("discord.js");

const { blush } = require("../data/apiLinks.json").roleplay.endpoints;
const baseurl = require("../data/apiLinks.json").roleplay.baseUrl;

module.exports = {
  name: "blush",
  description: "Blush!",
  perms: [],
  timeout: 3000,
  category: "Roleplay",
  execute: async function (message, args) {
    let messageAuthor = message.author.username + " blushed.";

    axios
      .default({
        method: "GET",
        url: baseurl + blush,
      })
      .then((response) => {
        imageUrl = response.data.link;

        let embed = new MessageEmbed()
          .setAuthor(messageAuthor, message.author.displayAvatarURL())
          .setImage(imageUrl)
          .setColor("#5865F2")
          .setTimestamp()
          .setFooter(`Request made by ${message.author.tag}`);
        return message.channel.send(embed).catch((err) => {
          return;
        });
      });
  },
};
