const axios = require("axios");
let { MessageEmbed } = require("discord.js");

const baseUrl = require("../../data/apiLinks.json").anime.baseUrl;

module.exports = {
  name: "recommended",
  description: "Get recommended anime!",
  perms: [],
  timeout: 5000,
  category: "Anime & Manga",
  execute: async function (message, args, commands) {

    var query = `
    query($page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          recommendations(sort: RATING_DESC) {
            id
            rating
            userRating
            media {
              id
              title {
                userPreferred
              }
              format
              type
              status(version: 2)
              bannerImage
              isAdult
              coverImage {
                large
              }
            }
          }
        }
      }
        `;

    var variables = {
      page: 1,
      perPage: 10
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

        let helpEmbed = new MessageEmbed()
        .setAuthor("Please define filter!")
        .setDescription("**Available filters**: ")
        if(!args[0])

        let characters = response.data.data.Page.recommendations;


        async function sendEmbed(show, embed) {
            
        }
      })
      .catch((err) => {
        console.log(err.response.data);
      });
  },
};
