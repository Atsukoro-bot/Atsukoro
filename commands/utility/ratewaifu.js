const axios = require("axios");
let { MessageEmbed } = require("discord.js");

const baseUrl = require("../../data/apiLinks.json").anime.baseUrl;

module.exports = {
  name: "ratewaifu",
  description: "Rate a waifu!",
  perms: [],
  args: [
    {
      name: "Name",
      description: "Name of the waifu to search",
      type: 3,
      required: true,
    },
  ],
  timeout: 3000,
  category: "Utility",
  execute: async function (message, args, commands) {
    if (!args[0])
      return message.channel.send("❗ Please specify a name of waifu to rate");

    let rating = Math.floor(Math.random() * 10 + 1);

    var query = `
        query($search: String) {
            Character(search: $search) {
                name {
                    full
                  }
                  image {
                    large
                  }
            }
          }
        `;

    var variables = {
      search: args.join(" "),
    };

    axios({
      url: baseUrl,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      data: {
        query: query,
        variables: variables,
      },
    })
      .then(function (response) {
        var character = response.data.data.Character;

        var embed = new MessageEmbed()
          .setTitle(`${character.name.full}`)
          .setColor("#5865F2")
          .setDescription(`I give **${character.name.full}** ${rating}/10 !`)
          .setThumbnail(character.image.large);

        return message.channel.send(embed);
      })
      .catch(function (error) {
        return message.channel.send(
          `❗ No character with name ${args[0]} found!`
        );
      });
  },
};
