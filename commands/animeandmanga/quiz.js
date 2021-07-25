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

        function getCharacter(index) {
          let character = response[index];
          character.age = character.age == null ? "Unknown age" : character.age;
          character.media = character.media.nodes[0];
          return character;
        }
        console.log(getCharacter(1));
      })
      .catch((err) => {
        console.log(err);
      });
  },
};
