const axios = require("axios");
let { MessageEmbed } = require("discord.js");

const { yuri } = require("../../data/apiLinks.json").nsfw.endpoints;
const baseUrl = require("../../data/apiLinks.json").nsfw.baseUrl;

module.exports = {
  name: "yuri",
  description: "nsfw yuri",
  perms: [],
  timeout: 3000,
  category: "nsfw",
  execute: async function (message, args, commands) {
    const getData = async (url) => {
      try {
        const res = (await axios.get(url)).data;
        return res.link;
      } catch (err) {
        console.log(err);
      }
    };

    const postEmbed = async (url, author) => {
      try {
        let embed = new MessageEmbed()
          .setColor("#5865F2")
          .setAuthor(author)
          .setImage(url);

        return message.channel.send(embed);
      } catch (err) {
        console.log(err);
      }
    };

    await postEmbed(await getData(baseUrl + yuri), `Here is your yuri! :3`);
  },
};
