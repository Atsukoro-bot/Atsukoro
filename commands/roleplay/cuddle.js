const axios = require("axios");
let { MessageEmbed } = require("discord.js");

const { cuddle } = require("../../data/apiLinks.json").roleplay.endpoints;
const baseurl = require("../../data/apiLinks.json").roleplay.baseUrl;

module.exports = {
  name: "cuddle",
  description: "Cuddle someone!",
  perms: [],
  timeout: 3000,
  category: "Roleplay",
  execute: async function (message, args) {
    let messageAuthor;

    if (message.mentions.users.first()) {
      messageAuthor =
        message.author.username +
        " cuddled " +
        message.mentions.users.first().username +
        ".";
    } else {
      messageAuthor = message.author.username + " cuddled himself/herself.";
    }

    axios
      .default({
        method: "GET",
        url: baseurl + cuddle,
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
