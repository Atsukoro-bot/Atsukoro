const axios = require("axios");
let {
  MessageEmbed
} = require("discord.js");

const {
  MessageButton,
  MessageActionRow
} = require("discord-buttons")

const baseUrl = require("../../data/apiLinks.json").anime.baseUrl;

module.exports = {
  name: "birthdays",
  description: "Get characters that has birthday today!",
  perms: [],
  timeout: 5000,
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
      }).then(function (response) {
        let page = 0;
        response = response.data.data.Page.characters;

        let embed = new MessageEmbed()
          .setColor("#5865F2")
          .setTimestamp()
          .setFooter(`Requested by ${message.author.tag}`)

        let beforeButton = new MessageButton()
          .setLabel("Before")
          .setStyle('blurple')
          .setID(`before_${message.author.id}`)

        let nextButton = new MessageButton()
          .setLabel("Next")
          .setStyle('blurple')
          .setID(`next_${message.author.id}`)

        let row = new MessageActionRow()
          .addComponents(beforeButton, nextButton)

        function getCharacter(index) {
          let character = response[index];
          character.name = character.name.userPreferred == undefined ? character.name : character.name.userPreferred;
          character.image = character.image.large == undefined ? character.image : character.image.large;

          return character;
        }

        async function displayCharacter(character, message) {
          let nextCharEmbed = new MessageEmbed()
            .setAuthor(`${character.name} has a birthday today! 🎉`)
            .setImage(character.image)
            .setColor("#5865F2")

          message.edit(nextCharEmbed);
        }

        const char = getCharacter(page);
        embed.setAuthor(`${char.name} has a birthday today! 🎉`)
        embed.setImage(`${char.image}`)

        message.channel.send(embed, row).then(m => {
          client.on('clickButton', async (button) => {
            // Handle click and display a new character
            switch (button.id) {
              case `before_${message.author.id}`:
                // Display character before this character
                
                await button.reply.defer()

                if(page == 0) page++;

                page--;
                let chr = await getCharacter(0);
                displayCharacter(chr, m);
                break;

              case `next_${message.author.id}`:
                // Display next character

                await button.reply.defer()

                page++;
                let chr2 = await getCharacter(page);
                displayCharacter(chr2, m);
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