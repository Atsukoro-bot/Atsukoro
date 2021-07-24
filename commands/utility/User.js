const axios = require("axios");
let { MessageEmbed } = require("discord.js");

const baseUrl = require("../../data/apiLinks.json").anime.baseUrl;

module.exports = {
  name: "user",
  description: "Get specific user!",
  perms: [],
  timeout: 5000,
  category: "Utility",
  execute: async function (message, args) {
    var query = `
        query($search: String) {
            User(search:$search) {
                avatar {
                    medium
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
                    anime {
                      episodesWatched
                      minutesWatched
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

        favAnime = response.favourites.anime.nodes.map((anime) => {
          return " `" + anime.title.userPreferred + "` ";
        });

        favManga = response.favourites.manga.nodes.map((manga) => {
          return " `" + manga.title.userPreferred + "` ";
        });

        favCharacters = response.favourites.characters.nodes.map(
          (character) => {
            return " `" + character.name.userPreferred + "` ";
          }
        );

        favGenres = response.statistics.anime.genres.map((genres) => {
          return " `" + genres.genre + "` ";
        });

        let embed = new MessageEmbed()
          .setTitle(response.name)
          .setURL(response.siteUrl)
          .setThumbnail(response.avatar.medium)
          .setColor("#5865F2")
          .setDescription(
            `${
              favAnime.length == 0
                ? ""
                : "Favourite anime: " + favAnime + "\n\n"
            }${
              favManga.length == 0
                ? ""
                : "Favourite manga: " + favManga + "\n\n"
            }${
              favCharacters.length == 0
                ? ""
                : "Favourite characters: " + favCharacters + "\n\n"
            }**Favourite genres**: ${favGenres}\n\n`
          )
          .setFooter(`Requested by ${message.author.tag}`)
          .addFields(
            {
              name: "Episodes watched",
              value: response.statistics.anime.episodesWatched,
              inline: true,
            },
            {
              name: "Minutes watched",
              value: response.statistics.anime.minutesWatched,
              inline: true,
            }
          );

        return message.channel.send(embed).catch((err) => {
          return;
        });
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
