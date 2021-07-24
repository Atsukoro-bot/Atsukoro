const axios = require("axios");
let { MessageEmbed } = require("discord.js");

module.exports = {
  name: "r34",
  description: "Search for images on Gelbooru",
  perms: [],
  timeout: 3000,
  category: "nsfw",
  execute: async function (message, args) {
    if (!args[0])
      return message.channel.send("🔍 You need to enter the search term!");
    let blacklisted_tags = ["shota","shotacon","loli","lolicon","underage"]
    let ask = args.toString();
    let search = args.join("%20")
    if(blacklisted_tags.some(t=>search.includes(t))) return message.channel.send(":x: Nothing found");

    axios(
      `https://gelbooru.com/index.php?page=dapi&s=post&q=index&json=1&tags=${search}&api_key=anonymous&user_id=9455`
    ).then((result) => {
      let res = result.data.filter((lmao) => lmao.rating == "e" && !blacklisted_tags.some(t=>lmao.tags.includes(t)));
      if (!res[0]) return message.channel.send(":x: Nothing found");
      let max = res.length;
      let min = 0;
      let random = Math.floor(Math.random() * (max - min + 1) + min);

      let e = new MessageEmbed()
        .setTitle("You asked for '" + args.join(" ") + "'")
        .setImage(res[random].file_url)
        .addField("Tags", `\`${res[random].tags}\``)
        .addField("Source", `[Click here](${result.data[random].source})`)
        .setColor("RANDOM");
      message.channel.send(e);
    });
  },
};
