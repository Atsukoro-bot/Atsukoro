const axios = require("axios");
let { MessageEmbed } = require("discord.js");

const baseUrl = require("../../data/apiLinks.json").anime.baseUrl;

module.exports = {
  name: "anime",
  description: "Get specific anime!",
  perms: [],
  timeout: 5000,
  category: "Informational",
  execute: async function (message, args, commands, translations) {
    if (!args[0])
      return message.channel.send("Please enter a anime name to search! :x:");

    var query = `
        query($search: String) {
            Media(search: $search, type: ANIME) {
                title {
                    userPreferred
                  } 
                  coverImage {
                    large
                  }
                  isAdult
                  averageScore
                  genres
                  favourites
                  episodes
                  duration
                  description(asHtml:true)
                  season
                  characters {
                    nodes {
                      name {
                        userPreferred
                      }
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
        "Accept": "application/json",
      },
      data: {
        query: query,
        variables: variables,
      },
    })
      .then(function (response) {
        response = response.data.data.Media;

        // Check if anime is for adults
        if (response.isAdult === true)
          return message.channel.send(
            "Adult content allowed only in nsfw channels! :x:"
          );

        response.description =
          response.description
            .replace(/<[^>]*>?/gm, "")
            .replace("&quot;", "")
            .slice(0, 1020) + "...";
        genres = response.genres.map(function (genre) {
          return " `" + genre + "` ";
        });
        characters = response.characters.nodes.map(function (character) {
          return " `" + character.name.userPreferred + "` ";
        });

        let embed = new MessageEmbed()
          .setAuthor(response.title.userPreferred)
          .setDescription(
            `${response.description}\n\n**Genres**: ${genres}\n\n**Characters**: ${characters}\n`
          )
          .setThumbnail(response.coverImage.large)
          .setColor("#5865F2")
          .addFields(
            {
              name: "Average Score",
              value: response.averageScore + "/100",
              inline: true,
            },
            {
              name: "Episodes",
              value: `${response.episodes} (each ${response.duration} minutes)`,
              inline: true,
            },
            { name: "Season", value: response.season, inline: true }
          );

        return message.channel.send(embed).catch((err) => {
          return;
        });
      })
      .catch((err) => {
        let noFoundEmbed = new MessageEmbed()
          .setColor("RED")
          .setAuthor("No anime found!")
          .setDescription("There were no results for `" + args.join(" ") + "`")
          .setFooter(message.author.tag);

        return message.channel.send(noFoundEmbed);
      });
  },
};
