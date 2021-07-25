const axios = require("axios");
let { MessageEmbed } = require("discord.js");

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
          characters(isBirthday: true) {
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

        characters = response.map((ch) => {
          return (
            "`" +
            ch.name.userPreferred +
            "`  " +
            ` **Age**: ${ch.age == null ? "Unknown age" : ch.age}\n${
              ch.name.userPreferred
            } appeared in ${ch.media.nodes[0].type.toLowerCase()} ${
              ch.media.nodes[0].title.userPreferred
            }\n`
          );
        });

        let embed = new MessageEmbed()
          .setAuthor("Anime & manga characters having a birthday today")
          .setColor("#5865F2")
          .setDescription(characters)
          .setTimestamp();

        message.channel.send(embed).catch((err) => {
          return;
        });
      })
      .catch((err) => {
        console.log(err);
      });
  },
};
