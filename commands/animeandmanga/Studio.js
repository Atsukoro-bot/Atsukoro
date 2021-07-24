const axios = require("axios");
let { MessageEmbed } = require("discord.js");

const baseUrl = require("../../data/apiLinks.json").anime.baseUrl;

module.exports = {
  name: "studio",
  description: "Get information about specific stuidio!",
  perms: [],
  timeout: 5000,
  category: "Anime & Manga",
  execute: async function (message, args) {
      let query = `
      query($search:String) {
        Studio(search:$search) {
          name
          favourites
          isAnimationStudio
          siteUrl
          media {
            nodes {
              title {
                userPreferred
              }
            }
          }
        }
      }
      `

      var variables = {
          search: args.join(" ")
      }

      axios({
          url: baseUrl,
          method: "POST",
          data: {
              query: query,
              variables: variables
          },
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          }
      }).then(result => {
          result = result.data.Studio;
          
          let embed = new MessageEmbed()

          return message.channel.send(embed);
      })
      .catch(err => {
          console.log(err.response.data.errors);
      })
  },
};
