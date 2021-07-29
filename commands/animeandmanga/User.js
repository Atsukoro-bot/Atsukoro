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

    if(!args[0]) return message.channel.send("Please send the name of the user you want to find! :x:");
    message.delete();

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
              episodes
              coverImage {
                extraLarge
              }
              averageScore
              description(asHtml: true)
              favourites
            }
          }
          manga {
            nodes {
              title {
                userPreferred
              }
              chapters
              volumes
              favourites
              coverImage {
                extraLarge
              }
              averageScore
              description(asHtml: true)
            }
          }
          characters {
            nodes {
              name {
                userPreferred
              }
              image {
                large
              }
              description(asHtml: true)
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

        function getData(type, page) {
          switch(type) {
            case "anime":
                return response.favourites.anime.nodes[page];
              break;
            
            case "manga":
                return response.favourites.manga.nodes[page];
              break;
            
            case "character":
                return response.favourites.characters.nodes[page];
              break;
          }
        }

        function sanitizeHtml(text) {
          return text.replace(new RegExp('<[^>]*>', 'g'), '')
        }

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
          .setFooter(`🧍 - Display ${response.name}'s favourite characters\n📚 - Display ${response.name}'s favourite manga\n🎥 - Display ${response.name}'s favourite anime shows`)

        return message.channel.send(overAllStatsEmbed).then(m => {
          m.react("🧍");
          m.react("📚");
          m.react("🎥");

          const filter = (reaction, user) => {
            return user.id === message.author.id && ["🧍", "📚", "🎥"].includes(reaction.emoji.name)
          }

          const collector = m.createReactionCollector(filter, { time: 120000 });

          collector.on("collect", async (reaction, user) => {
            collector.stop();

            let page = 0;

            switch (reaction.emoji.name) {
              case "🧍":
                data = getData("character", page);

                if(!data) {
                  m.edit("This user does not have any favourite characters! :x:");
                  return m.reactions.removeAll();
                }
                
                
                await m.delete();

                let aEmbed = new MessageEmbed()
                .setTitle(`${response.name}'s favourite character`)
                .setThumbnail(data.image.large)
                .setDescription("**" + data.name.userPreferred + "**\n" + sanitizeHtml(data.description))
                .setTimestamp()
                .setColor("#5865F2")
                .setFooter(`page ${page + 1}/${response.favourites.anime.nodes.length}`)

                return message.channel.send(aEmbed).then(mes => {
                  mes.react("⬅️");
                  mes.react("➡️");

                  const filter = (reac, use ) => {
                    return use.id == message.author.id && ["⬅️", "➡️"].includes(reac.emoji.name);
                  }
                });
                break;

              case "📚":
                data = getData("manga", page);

                await m.delete();

                console.log(data);
                break;

              case "🎥":
                data = getData("anime", page);

                await m.delete();

                console.log(data);
                break;
            }
          });
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
