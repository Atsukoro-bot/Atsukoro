const axios = require("axios");
let { MessageEmbed } = require("discord.js");

const baseUrl = require("../../data/apiLinks.json").anime.baseUrl;

module.exports = {
  name: "character",
  description: "Get specific character!",
  perms: [],
  timeout: 5000,
  category: "Anime & Manga",
  execute: async function (message, args, commands) {
    if (!args[0])
      return message.channel.send(
        "Please enter a character name to search! :x:"
      );

    var query = `
        query($search: String) {
            Character(search: $search) {
                name {
                    full
                  }
                  age
                  favourites
                  description(asHtml: false)
                  gender
                  image {
                    large
                  }
                  media {
                    nodes {
                      title {
                        english
                      }
                      type
                    }
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
        Accept: "application/json",
      },
      data: {
        query: query,
        variables: variables,
      },
    })
      .then(function (response) {
        response = response.data.data.Character;
        response.age = response.age == null ? "Unknown" : response.age;
        response.description =
          response.description
            .replace(/<[^>]*>?/gm, "")
            .replace("&quot;", "")
            .slice(0, 550) + "...";

        let embed = new MessageEmbed()
          .setAuthor(response.name.full)
          .setColor("#5865F2")
          .setDescription(
            `${
              response.description
            }\n\nAppeared in ${response.media.nodes[0].type.toLowerCase()} **${
              response.media.nodes[0].title.english
            }**`
          )
          .setThumbnail(response.image.large)
          .addFields(
            { name: "Age", value: response.age, inline: true },
            { name: "Gender", value: response.gender, inline: true },
            {
              name: "Favourites on Anilist",
              value: response.favourites,
              inline: true,
            }
          );

        return message.channel.send(embed);
      })
      .catch((err) => {
        let noFoundEmbed = new MessageEmbed()
          .setColor("RED")
          .setAuthor("No character found!")
          .setDescription("There were no results for `" + args[0] + "`")
          .setFooter(message.author.tag);

        return message.channel.send(noFoundEmbed);
      });
  },
};
