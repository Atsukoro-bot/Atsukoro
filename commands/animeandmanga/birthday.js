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
  execute: async function (message, args, commands, client) {

    var query = `
    query($page: Int, $perPage: Int) {
        Page(page:$page,perPage: $perPage) {
          characters(isBirthday: true) {
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
      perPage: 20,
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
    })      .then(function (response) {
        response = response.data.data.Page.characters;

        let embed = new MessageEmbed()
        .setColor("#5865F2")
        .setTimestamp()
        .setFooter(`Requested by ${message.author.tag}`)

        let beforeButton = new MessageButton()
        .setLabel("Before")
        .setStyle('blurple')
        .setID("before")

        let nextButton = new MessageButton()
        .setLabel("Next")
        .setStyle('blurple')
        .setID("next")

        let row = new MessageActionRow()
        .addComponents(beforeButton, nextButton)

        function getCharacter(index) {
          let character = response[index];
          console.log(character);
          character.name = character.name.userPreferred;
          character.age = character.age == null ? "Unknown age" : character.age;
          character.media = character.media.nodes[0];
          character.media.title = character.media.title.userPreferred;
          character.image = character.image.large;

          return character;
        }

        async function displayCharacter(character, message) {
          let nextCharEmbed = new MessageEmbed()
          .setAuthor(`${character.name} has a birthday today! 🎉`)
          .setImage(character.image)
          .setColor("#5865F2")
          .setFooter(`Requested by ${message.author.tag}`)

          message.edit(nextCharEmbed);
        }
        
        let page = 0;
        const char = getCharacter(page);
        embed.setAuthor(`${char.name} has a birthday today! 🎉`)
        embed.setImage(`${char.image}`)

        message.channel.send(embed, row).then(m => {
          client.on('clickButton', async (button) => {
            // Handle click and display a new character
            switch(button.id) {
              case "before":
                // Display character before this character

                let ch1 = getCharacter(page);
                displayCharacter(ch1,m);
                if(page == 0) return;
                page--;
                break;

              default:
                // Display next character

                let ch2 = getCharacter(page);
                displayCharacter(ch2,m);

                page++;
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
