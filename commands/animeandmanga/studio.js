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

    if(!args[0]) return message.channel.send("Please enter a studio name to search! :x:");

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
          result = result.data.data.Studio;

          console.log(result);

          result.media.nodes = result.media.nodes.splice(0, 30);
          
          let embed = new MessageEmbed()
          .setTitle(result.name)
          .setURL(result.siteUrl)
          .setColor("#5865F2")
          .setDescription(`**Anime by ${result.name}**: ` + result.media.nodes.map(node => "`" + node.title.userPreferred + "`").join(", "))
          .addFields(
              { name: "Favourites", value: result.favourites, inline: true },
              { name: "Is animation studio", value: result.isAnimationStudio == true ? "Yes" : "No", inline: true }
          )

          return message.channel.send(embed);
      })
      .catch(err => {
          console.log(err);
          console.log(err.response.data.errors);
      })
  },
};
