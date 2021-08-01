const axios = require("axios").default;
let { MessageEmbed } = require("discord.js");

const baseurl = require("../../data/apiLinks.json").image.baseUrl;

module.exports = {
  name: "kanna",
  description: "Kanna",
  perms: [],
  timeout: 3000,
  args: [
    {
      name: "Text",
      description: "Text to display in Kanna canvas",
      type: 3, //STRING 3, INTEGER 4 viac nájdeš v docs od djs
      required: true,
    },
  ],
  category: "Image Generation",
  execute: async function (message, args) {
    if (!args[0]) return;
    let res = (
      await axios({
        method: "GET",
        url: baseurl + `?type=kannagen`,
        params: {
          text: args.join(" "),
        },
        headers: {
          "Content-Type": "application/json",
        },
      })
    ).data;

    let embed = new MessageEmbed()
      .setImage(res.message)
      .setColor("#5865F2")
      .setTimestamp()
      .setFooter(`Request made by ${message.author.tag}`);
    message.channel.send(embed);
  },
};
