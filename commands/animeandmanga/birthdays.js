const axios = require("axios");
let { MessageEmbed } = require("discord.js");

const { MessageButton, MessageActionRow } = require("discord-buttons")

const baseUrl = require("../../data/apiLinks.json").anime.baseUrl;

module.exports = {
  name: "birthdays",
  description: "Get characters that has birthday today!",
  perms: [],
  timeout: 5000,
  category: "Anime & Manga",
  execute: async function (message, args, commands) {
    var query = `
    query($page: Int, $perPage: Int) {
        Page(page:$page,perPage: $perPage) {
          characters(isBirthday: true, sort: FAVOURITES) {
            name {
              userPreferred
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
      perPage: 5,
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
        response = response.data.data.Page.characters;

        let embed = new MessageEmbed()
        .setColor("#5865F2")
        .setTimestamp()
        .setFooter(`Requested by ${message.author.tag}`)

        function getCharacter(index) {
          let character = response[index];
          character.name = character.name.userPreferred;
          character.age = character.age == null ? "Unknown age" : character.age;
          character.media = character.media.nodes[0];
          character.media.title = character.media.title.userPreferred;

          return character;
        }
        
        let page = 0;
        const char = getCharacter(page);
        embed.setAuthor(char.name)

        message.channel.send(embed);

      })
      .catch((err) => {
        console.log(1);
      });
  },
};
