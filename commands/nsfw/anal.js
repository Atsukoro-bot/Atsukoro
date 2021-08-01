const axios = require("axios");
let { MessageEmbed } = require("discord.js");

const { anal } = require("../../data/apiLinks.json").nsfw.endpoints;
const baseUrl = require("../../data/apiLinks.json").nsfw.baseUrl;

module.exports = {
  name: "anal",
  description: "anal nsfw",
  perms: [],
  timeout: 3000,
  category: "nsfw",
  execute: async function (message) {
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

    await postEmbed(await getData(baseUrl + anal), `Here is your anal! :3`);
  },
};
