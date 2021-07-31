const axios = require("axios");
let { MessageEmbed } = require("discord.js");

const baseUrl = require("../../data/apiLinks.json").anime.baseUrl;

module.exports = {
  name: "studio",
  description: "Get information about specific stuidio!",
  perms: [],
  timeout: 5000,
  category: "Anime & Manga",
  execute: async function (message, args, commands) {
    if (!args[0])
      return message.channel.send("Please enter a studio name to search! :x:");

    let query = `
    query($search: String!) {
      Studio(search: $search, sort: FAVOURITES_DESC) {
        name
        favourites
        isAnimationStudio
        siteUrl
        media(sort: FAVOURITES_DESC) {
          nodes {
            title {
              userPreferred
            }
            coverImage {
              extraLarge
            }
            description(asHtml: true)
            episodes
            type
            chapters
            volumes
          }
        }
      }
    }
      `;

    var variables = {
      search: args.join(" ")
    };

    axios({
      url: baseUrl,
      method: "POST",
      data: {
        query: query,
        variables: variables,
      },
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    })
      .then((results) => {
        let result = results.data.data.Studio;

        let embed = new MessageEmbed()
          .setTitle(result.name)
          .setURL(result.siteUrl)
          .setColor("#5865F2")
          .addFields(
            { name: "Favourites", value: result.favourites, inline: true },
            {
              name: "Is animation studio",
              value: result.isAnimationStudio == true ? "Yes" : "No",
              inline: true,
            }
          )
          .setFooter("🎥 - Display work that is done by this studio")

        return message.channel.send(embed)
        .then(m => {
          m.react("🎥");
  
          function getMedia(page) {
            return result.media.nodes[page];
          }
  
          const mainFilter = (reaction, user) => {
            return user.id == message.author.id && reaction.emoji.name == "🎥";
          }
  
          const mainCollector = m.createReactionCollector(mainFilter, { time: 60000, max: 1 });
  
          mainCollector.on("collect", (reaction, user) => {
  
            let page = 0;
  
            mainCollector.stop();
  
            data = getMedia(page);
            console.log(data);
          });
        });
      })
      .catch((err) => {
        console.log(err);
        console.log(err.response.data.errors);
      });
  },
};
