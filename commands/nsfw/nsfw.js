const axios = require("axios");
let { MessageEmbed, DiscordAPIError } = require("discord.js");

const { neko, solo, pussylick, bj, anal, yuri, fuck, cum } = require("../../data/apiLinks.json").nsfw.endpoints;
const baseUrl = require("../../data/apiLinks.json").nsfw.baseUrl;

module.exports = {
  name: "nsfw",
  description: "nsfw commands",
  perms: [],
  timeout: 3000,
  category: "nsfw",
  execute: async function (message, args) {
    if(!message.channel.nsfw) return message.channel.send("This is not a nsfw channel :x:");

    const getData = async (url) => {
      try {
        const res = await axios.get(url);
        console.log(res.data);
        return res.data.link;
      } catch(err) {
        console.log(err);
      }
    }

    const postEmbed = async (url, author) => {
      try {
        let embed = new MessageEmbed()
          .setColor("#5865F2")
          .setAuthor(author)
          .setImage(url);

        return message.channel.send(embed);
      } catch(err) {
        console.log(err);
      }
    }

    switch(args[0]) {
      case "neko":
        await postEmbed(await getData(baseUrl + neko), `Here is your ${args[0]}! :3`);
        break;

      case "yuri":
        await postEmbed(await getData(baseUrl + yuri), `Here is your ${args[0]}! :3`);
        break;

        
    };
  },
};
