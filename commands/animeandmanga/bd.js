const axios = require("axios");
let {
  MessageEmbed,
  MessageAttachment
} = require("discord.js");

const Canvas = require("canvas");

const baseUrl = require("../../data/apiLinks.json").anime.baseUrl;

module.exports = {
  name: "bd",
  description: "Get characters that has birthday today!",
  perms: [],
  timeout: 5000,
  category: "Anime & Manga",
  execute: async function (message, args, commands) {
    var query = `
    query($page: Int, $perPage: Int) {
        Page(page:$page,perPage: $perPage) {
            characters(isBirthday: true,sort: FAVOURITES) {
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
      .then(async function (response) {
        response = response.data.data.Page.characters;

        const canvas = Canvas.createCanvas(700, 350);
        const context = canvas.getContext('2d');

        const background = await Canvas.loadImage('./data/wp.png');
        context.drawImage(background, 0, 0, canvas.width, canvas.height);

        const attachment = new MessageAttachment(canvas.toBuffer(), 'birthdays.png');

        message.channel.send(attachment);
      });
  },
};