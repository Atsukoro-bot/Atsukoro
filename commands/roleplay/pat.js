const axios = require("axios");
let { MessageEmbed } = require("discord.js");

const { pat } = require("../../data/apiLinks.json").roleplay.endpoints;
const baseurl = require("../../data/apiLinks.json").roleplay.baseUrl;

module.exports = {
  name: "pat",
  description: "Pat someone! uwu owo :3",
  perms: [],
  timeout: 3000,
  category: "Roleplay",
  execute: async function (message, args) {
    /**
     * sMember
     * @type {GuildMember | undefined}
     */
     let sMember = message.mentions.users ? message.mentions.users.first() : message.guild.members.cache.get(args[0])

     let res = (await axios
       .default({
         method: "GET",
         url: baseurl + pat,
      })).data
 
     let embed = new MessageEmbed()
       .setAuthor(`${message.author.username} ${sMember == undefined || (sMember?.id == message.author.id) ? " patted himself/herself" : "patted " + sMember?.username}`, message.author.displayAvatarURL())
       .setImage(res.link)
       .setColor("#5865F2")
       .setTimestamp()
       .setFooter(`Request made by ${message.author.tag}`);
     return message.channel.send(embed)
  },
};
