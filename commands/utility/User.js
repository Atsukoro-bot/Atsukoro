const axios = require("axios");
let { MessageEmbed } = require("discord.js");

const baseUrl = require("../../data/apiLinks.json").anime.baseUrl;

module.exports = {
  name: "user",
  description: "Get specific user!",
  perms: [],
  timeout: 5000,
  category: "Utility",
  execute: async function (message, args, commands) {
    var query = `
    query($search: String) {
      User(search:$search) {
        avatar {
          large
        }
        siteUrl
        favourites {
          anime {
            nodes {
              title {
                userPreferred
              }
            }
          }
          manga {
            nodes {
              title {
                userPreferred
              }
            }
          }
          characters {
            nodes {
              name {
                userPreferred
              }
            }
          }
        }
        statistics {
          manga {
            chaptersRead
            meanScore
            count
            volumesRead
          }
          anime {
            episodesWatched
            minutesWatched
            meanScore
            count
            genres {
              genre
            }
          }
        }
        name
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
        response = response.data.data.User;

        ai = 0;
        mi = 0;
        ci = 0;

        let characterString = response.favourites.characters.nodes.slice(0,3).map(item => { ci++; return "`" + ci + ")` " + item.name.userPreferred })
        let animeString = response.favourites.anime.nodes.slice(0,3).map((item) => { ai++; return "`" + ai + ")` " + item.title.userPreferred });
        let mangaString = response.favourites.manga.nodes.slice(0,3).map(item => { mi++; return "`" + mi + ")` " + item.title.userPreferred });

        mangaString = mangaString.length <= 0 ? "No manga" : mangaString;
        animeString = animeString.length <= 0 ? "No anime" : animeString;
        characterString = characterString.length <= 0 ? "No characters" : characterString;

        let overAllStatsEmbed = new MessageEmbed()
          .setColor("#5865F2")
          .setTitle(`📘 ${response.name}'s Overall Stats`, response.siteUrl)
          .setThumbnail(response.avatar.large)
          .addFields(
            { name: "Anime", value: "`Episoded watched: " + response.statistics.anime.episodesWatched + "`\n`Watched anime: " + response.statistics.anime.count + "`", inline: true },
            { name: "Manga", value: "`Chapters read: " + response.statistics.manga.chaptersRead + "`\n`Manga read: " + response.statistics.manga.count + "`" }
          )
          .addFields(
            { name: "Favourite anime", value: animeString, inline: true },
            { name: "Favourite manga", value: mangaString, inline: true },
            { name: "Favourite characters", value: characterString, inline: true }
          )

        return message.channel.send(overAllStatsEmbed);
      })
      .catch((err) => {
        console.log(err);
        let noFoundEmbed = new MessageEmbed()
          .setColor("RED")
          .setAuthor("No user found!")
          .setDescription("There were no results for `" + args.join(" ") + "`")
          .setColor("#5865F2")
          .setFooter(message.author.tag);

        return message.channel.send(noFoundEmbed);
      });
  },
};
