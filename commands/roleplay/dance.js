const axios = require("axios");
let { MessageEmbed } = require("discord.js");

const { dance } = require("../../data/apiLinks.json").roleplay.endpoints;
const baseurl = require("../../data/apiLinks.json").roleplay.baseUrl;

module.exports = {
  name: "dance",
  description: "Dance!",
  perms: [],
  timeout: 3000,
  category: "Roleplay",
  execute: async function (message, args, commands) {
    let messageAuthor = message.author.username + " danced.";

    let res = (await axios
      .default({
        method: "GET",
        url: baseurl + dance,
      })).data

    let embed = new MessageEmbed()
      .setAuthor(messageAuthor, message.author.displayAvatarURL())
      .setImage(res.link)
      .setColor("#5865F2")
      .setTimestamp()
      .setFooter(`Request made by ${message.author.tag}`);
    return message.channel.send(embed)
  },
};
