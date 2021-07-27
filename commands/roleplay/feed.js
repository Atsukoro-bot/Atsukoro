const axios = require("axios");
let { MessageEmbed } = require("discord.js");

const { feed } = require("../../data/apiLinks.json").roleplay.endpoints;
const baseurl = require("../../data/apiLinks.json").roleplay.baseUrl;

module.exports = {
  name: "feed",
  description: "Feed someone!",
  perms: [],
  timeout: 3000,
  category: "Roleplay",
  execute: async function (message, args, commands) {
    /**
     * sMember
     * @type {GuildMember | undefined}
     */
    let sMember = message.mentions.users
      ? message.mentions.users.first()
      : message.guild.members.cache.get(args[0]);

    let res = (
      await axios.default({
        method: "GET",
        url: baseurl + feed,
      })
    ).data;

    let embed = new MessageEmbed()
      .setAuthor(
        `${message.author.username} ${
          sMember == undefined || sMember?.id == message.author.id
            ? " fed himself/herself"
            : "fed " + sMember?.username
        }`,
        message.author.displayAvatarURL()
      )
      .setImage(res.link)
      .setColor("#5865F2")
      .setTimestamp()
      .setFooter(`Request made by ${message.author.tag}`);
    return message.channel.send(embed);
  },
};
