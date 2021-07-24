const axios = require("axios");
let { MessageEmbed } = require("discord.js");

const { cry } = require("../data/apiLinks.json").roleplay.endpoints;
const baseurl = require("../data/apiLinks.json").roleplay.baseUrl;

module.exports = {
  name: "cry",
  description: "Cry!",
  perms: [],
  timeout: 3000,
  category: "Roleplay",
  execute: async function (message, args) {
    let messageAuthor = message.author.username + " started crying.";

    axios
      .default({
        method: "GET",
        url: baseurl + cry,
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
