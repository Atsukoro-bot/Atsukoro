const axios = require("axios");
let { MessageEmbed } = require("discord.js");

const baseUrl = require("../../data/apiLinks.json").anime.baseUrl;

module.exports = {
  name: "birthdays",
  description: "Get characters that has birthday today!",
  perms: [],
  timeout: 10000,
  category: "Anime & Manga",
  execute: async function (message, args, commands, client) {
    var query = `
    query($page: Int, $perPage: Int) {
        Page(page:$page,perPage: $perPage) {
          characters(isBirthday: true, sort: FAVOURITES_DESC) {
            name {
              userPreferred
            }
            image {
              large
            }
            age
            media {
              nodes {
                type
                title {
                  userPreferred
                }
              }
            }
          }
        }
      }
        `;

    var variables = {
      page: 1,
      perPage: 100,
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
        let page = 0;
        response = response.data.data.Page.characters;

        function getCharacter(index) {
          let character = response[index];
          character.name =
            character.name.userPreferred == undefined
              ? character.name
              : character.name.userPreferred;
          character.image =
            character.image.large == undefined
              ? character.image
              : character.image.large;

          return character;
        }

        async function displayCharacter(character, message) {
          let nextCharEmbed = new MessageEmbed()
            .setAuthor(`${character.name} has a birthday today! 🎉`)
            .setDescription(
              `Appeared in ${character.media.nodes[0].type.toLowerCase()} **${
                character.media.nodes[0].title.userPreferred
              }**`
            )
            .setImage(character.image)
            .setColor("#5865F2");

          message.edit(nextCharEmbed);
        }

        let embed = new MessageEmbed()
          .setColor("#5865F2")
          .setTimestamp()
          .setFooter(`Requested by ${message.author.tag}`);

        const char = getCharacter(page);
        embed.setAuthor(`${char.name} has a birthday today! 🎉`);
        embed.setDescription(
          `Appeared in ${char.media.nodes[0].type.toLowerCase()} **${
            char.media.nodes[0].title.userPreferred
          }**`
        );
        embed.setImage(char.image);

        message.channel.send(embed).then((m) => {
          m.react("⬅");
          m.react("➡️");
          m.react("❌");

          const filter = (reaction, user) => {
            return (
              user.id === message.author.id &&
              ["⬅", "➡️", "❌"].includes(reaction.emoji.name)
            );
          };

          const collector = m.createReactionCollector(filter, { time: 120000 });

          collector.on("collect", (reaction, user) => {
            switch (reaction.emoji.name) {
              case "⬅":
                // Get character before
                if (page == 0) page++;
                page--;

                const chrBef = getCharacter(page);
                displayCharacter(chrBef, m);
                break;

              case "➡️":
                // Get character after
                if (page > response.length) return;

                page++;
                const chrAft = getCharacter(page);
                displayCharacter(chrAft, m);
                break;

              case "❌":
                collector.stop();
                m.reactions.removeAll();
                break;
            }
          });
        });
      })
      .catch((err) => {
        console.log(err);
      });
  },
};
