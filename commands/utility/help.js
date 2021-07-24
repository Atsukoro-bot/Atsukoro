const axios = require("axios");
let { MessageEmbed } = require("discord.js");

module.exports = {
  name: "help",
  description: "Display available commands",
  perms: [],
  timeout: 1000,
  category: "Utility",
  execute: async function (message, args, commands) {
    let comms = {}
    commands.forEach((value,key)=>{
      if(!comms[value.category]){
        comms[value.category] = [value.name]
      }
      else{
        comms[value.category].push(value.name)
      }
    })

    let em = new MessageEmbed().setTitle("Available commands")
    Object.keys(comms).forEach(k=>{
      em.addField(k,comms[k].join(", "))
    })
    message.channel.send(em)
  },
};
