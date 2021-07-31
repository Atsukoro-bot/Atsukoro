const axios = require("axios");
let { MessageEmbed } = require("discord.js");

const baseUrl = require("../../data/apiLinks.json").anime.baseUrl;

module.exports = {
  name: "studio",
  description: "Get information about specific stuidio!",
  perms: [],
  timeout: 5000,
  category: "Anime & Manga",
  execute: async function (message, args, commands) {
    if (!args[0])
      return message.channel.send("Please enter a studio name to search! :x:");

    let query = `
    query($search: String!) {
      Studio(search: $search, sort: FAVOURITES_DESC) {
        name
        favourites
        isAnimationStudio
        siteUrl
        media(sort: FAVOURITES_DESC) {
          nodes {
            title {
              userPreferred
            }
            coverImage {
              extraLarge
            }
            description(asHtml: true)
            episodes
            type
            chapters
            volumes
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
      data: {
        query: query,
        variables: variables,
      },
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    })
      .then((results) => {
        let result = results.data.data.Studio;

        let embed = new MessageEmbed()
          .setTitle(result.name)
          .setURL(result.siteUrl)
          .setColor("#5865F2")
          .addFields(
            { name: "Favourites", value: result.favourites, inline: true },
            {
              name: "Is animation studio",
              value: result.isAnimationStudio == true ? "Yes" : "No",
              inline: true,
            }
          )
          .setFooter("🎥 - Display work that is done by this studio");

        return message.channel.send(embed).then((m) => {
          m.react("🎥");

          function getMedia(page) {
            return result.media.nodes[page];
          }

          function sanitizeHtml(text) {
            text = text.replace(new RegExp("<[^>]*>", "g"), "");
            text = text.replace("&quot;", "");
            text = text.split("").splice(0, 1000).join("");
            return text;
          }

          function editEmbed(message, data) {
            let editedEmbed = new MessageEmbed()
              .setTimestamp()
              .setTitle(data.title.userPreferred)
              .setThumbnail(data.coverImage.extraLarge)
              .setDescription(sanitizeHtml(data.description))
              .setColor("#5865F2");

            message.edit(editedEmbed);
          }

          const mainFilter = (reaction, user) => {
            return user.id == message.author.id && reaction.emoji.name == "🎥";
          };

          const mainCollector = m.createReactionCollector(mainFilter, {
            time: 60000,
            max: 1,
          });

          mainCollector.on("collect", async (reaction, user) => {
            mainCollector.stop();
            await m.reactions.removeAll();

            let page = 0;

            data = getMedia(page);

            let mediaEmbed = new MessageEmbed()
              .setTimestamp()
              .setTitle(data.title.userPreferred)
              .setThumbnail(data.coverImage.extraLarge)
              .setDescription(sanitizeHtml(data.description))
              .setColor("#5865F2");

            return m.edit(mediaEmbed).then((m) => {
              m.react("⬅");
              m.react("➡️");

              const pageFilter = (reaction, user) => {
                return (
                  user.id == message.author.id &&
                  ["⬅", "➡️"].includes(reaction.emoji.name)
                );
              };

              const pageCollector = m.createReactionCollector(pageFilter, {
                time: 60000,
              });

              pageCollector.on("collect", (reaction, user) => {
                switch (reaction.emoji.name) {
                  case "⬅":
                    if (page == 0) page = result.media.nodes.length - 1;
                    page--;
                    data = getMedia(page);

                    editEmbed(m, data);
                    break;

                  case "➡️":
                    if (page + 1 == result.media.nodes.length) page = -1;
                    page++;
                    data = getMedia(page);

                    editEmbed(m, data);
                    break;
                }
              });
            });
          });
        });
      })
      .catch((err) => {
        console.log(err);
        console.log(err.response.data.errors);
      });
  },
};
