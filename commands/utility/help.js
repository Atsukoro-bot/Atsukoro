const axios = require("axios");
let { MessageEmbed } = require("discord.js");

module.exports = {
  name: "help",
  description: "Display available commands",
  perms: [],
  timeout: 1000,
  category: "Utility",
  execute: async function (message, args, commands) {
    let comms = {};
    commands.forEach((value) => {
      if (!comms[value.category]) {
        comms[value.category] = [value.name];
      } else {
        comms[value.category].push(value.name);
      }
    });

    let em = new MessageEmbed()
      .setTitle("📙 Available commands")
      .setColor("#5865F2")
      .setTimestamp()
      .setFooter(message.author.tag);
    Object.keys(comms).forEach((k) => {
      em.addField(k, comms[k].join(", "));
    });
    message.channel.send(em);
  },
};
