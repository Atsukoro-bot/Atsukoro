const axios = require("axios");
let { MessageEmbed } = require("discord.js");

const baseUrl = require("../../data/apiLinks.json").anime.baseUrl;

module.exports = {
  name: "anime",
  description: "Get specific anime!",
  args: [
    {
      name: "Anime name",
      description: "Name of the anime to display",
      type: 3,
      required: true,
    },
  ],
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
              description(asHtml: true)
              season
              characters {
                nodes {
                  name {
                    userPreferred
                  }
                  age
                  image {
                    large
                  }
                  gender
                  description(asHtml: true)
                  favourites
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
            {
              name: "Season",
              value: response.season,
              inline: true,
            }
          )
          .setFooter("🧍 - Display all characters");

        return message.channel
          .send(embed)
          .then((m) => {
            function getData(type, page) {
              switch (type) {
                case "characters":
                  return response.characters.nodes[page];
                  break;

                case "staff":
                  return response.staff.nodes[page];
                  break;
              }
            }

            function sanitizeHtml(text) {
              text = text.replace(new RegExp("<[^>]*>", "g"), "");
              text = text.replace("&quot;", "");
              text = text.split("").splice(0, 1000).join("");
              return text;
            }

            function editEmbed(type, messageToEdit, data) {
              switch (type) {
                case "characters":
                  newEmbed = new MessageEmbed()
                    .setAuthor(data.name.userPreferred)
                    .setThumbnail(data.image.large)
                    .setColor("#5865F2")
                    .setDescription(sanitizeHtml(data.description))
                    .addFields(
                      {
                        name: "Gender",
                        value: data.gender == null ? "Unknown" : data.gender,
                        inline: true,
                      },
                      {
                        name: "Age",
                        value: data.age == null ? "Unknown" : data.age,
                        inline: true,
                      },
                      {
                        name: "Favourites",
                        value:
                          data.favourites == null ? "Unknown" : data.favourites,
                        inline: true,
                      }
                    )
                    .setFooter(
                      `page ${page + 1} / ${response.characters.nodes.length}`
                    );

                  messageToEdit.edit(newEmbed);
                  break;

                case "staff":
                  break;
              }
            }

            m.react("🧍");

            const filter = (reaction, user) => {
              return (
                user.id === message.author.id &&
                ["🧍"].includes(reaction.emoji.name)
              );
            };

            const collector = m.createReactionCollector(filter, {
              time: 120000,
              max: 1,
            });

            let page = 0;

            collector.on("collect", async (reaction, user) => {
              await collector.stop();
              switch (reaction.emoji.name) {
                case "🧍":
                  // Display characters from anime

                  data = getData("characters", page);

                  if (!data) return message.edit("No characters found!");

                  let characterEmbed = new MessageEmbed()
                    .setAuthor(data.name.userPreferred)
                    .setThumbnail(data.image.large)
                    .setColor("#5865F2")
                    .setDescription(sanitizeHtml(data.description))
                    .addFields(
                      {
                        name: "Gender",
                        value: data.gender == null ? "Unknown" : data.gender,
                        inline: true,
                      },
                      {
                        name: "Age",
                        value: data.age == null ? "Unknown" : data.age,
                        inline: true,
                      },
                      {
                        name: "Favourites",
                        value:
                          data.favourites == null ? "Unknown" : data.favourites,
                        inline: true,
                      }
                    )
                    .setFooter(
                      `page ${page + 1} / ${response.characters.nodes.length}`
                    );

                  return m.edit(characterEmbed).then(async (m) => {
                    await m.reactions.removeAll();

                    await m.react("⬅️");
                    await m.react("➡️");

                    pageFilter = (reaction, user) => {
                      return (
                        user.id === message.author.id &&
                        ["⬅️", "➡️"].includes(reaction.emoji.name)
                      );
                    };

                    const pageCollector = m.createReactionCollector(
                      pageFilter,
                      {
                        time: 120000,
                      }
                    );

                    pageCollector.on("collect", async (reaction, user) => {
                      switch (reaction.emoji.name) {
                        case "⬅️":
                          if (page == 0)
                            page = response.characters.nodes.length;
                          page--;
                          data = getData("characters", page);
                          editEmbed("characters", m, data);
                          break;

                        case "➡️":
                          if (response.characters.nodes.length == page + 1)
                            page = -1;
                          page++;
                          data = getData("characters", page);
                          editEmbed("characters", m, data);
                          break;
                      }
                    });
                  });
                  break;
              }
            });
          })
          .catch((err) => {
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
