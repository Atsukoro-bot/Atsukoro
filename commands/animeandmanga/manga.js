const axios = require("axios");
let { MessageEmbed } = require("discord.js");

const baseUrl = require("../../data/apiLinks.json").anime.baseUrl;

module.exports = {
  name: "manga",
  description: "Get specific manga!",
  perms: [],
  timeout: 5000,
  category: "Anime & Manga",
  args: [
    {
      name: "Name",
      description: "Name of manga that you want to display!",
      type: 3,
      required: true,
    },
  ],
  execute: async function (message, args, commands) {
    if (!args[0])
      return message.channel.send("Please enter a manga name to search! :x:");

    var query = `
        query($search: String) {
            Media(search: $search, type: MANGA) {
                title {
                    userPreferred
                  } 
                  coverImage {
                    medium
                  }
                  isAdult
                  averageScore
                  genres
                  favourites
                  chapters
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
        response.chapters =
          response.chapters == null
            ? "Probably not finished"
            : response.chapters;

        // Check if anime is for adults
        if (response.isAdult === true)
          return message.channel.send(
            "Adult content allowed only in nsfw channels! :x:"
          );

        response.description =
          response.description
            .replace(/<[^>]*>?/gm, "")
            .replace("&quot;", "")
            .slice(0, 350) + "...";
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
          .setThumbnail(response.coverImage.medium)
          .setColor("#5865F2")
          .addFields(
            {
              name: "Average Score",
              value: response.averageScore + "/100",
              inline: true,
            },
            {
              name: "Chapters",
              value: `${response.chapters}`,
              inline: true,
            }
          );

        return message.channel.send(embed).catch((err) => {
          return;
        });
      })
      .catch((err) => {
        let noFoundEmbed = new MessageEmbed()
          .setColor("RED")
          .setAuthor("No manga found!")
          .setDescription("There were no results for `" + args.join(" ") + "`")
          .setFooter(message.author.tag);

        return message.channel.send(noFoundEmbed);
      });
  },
};
