const axios = require("axios");
let { MessageEmbed } = require("discord.js");

const baseUrl = require("../../data/apiLinks.json").anime.baseUrl;

module.exports = {
  name: "season",
  description: "Get anime airing in the current season",
  perms: [],
  timeout: 1000,
  category: "Anime & Manga",
  execute: async function (message, args, commands) {z
    var query = `query($year:Int,$season:MediaSeason){
      Page(perPage:10){
        media(status:RELEASING,type:ANIME,season:$season,seasonYear:$year,sort:FAVOURITES_DESC){
          id,
          description,
          episodes,
          nextAiringEpisode {
            timeUntilAiring
          },
          title {
            romaji
            english
            native
            userPreferred
          },
          coverImage {
            large
            color
          }
        }
      }
    }`;
    
    let today = new Date(Date.now());
    let vars = {
      year: today.getFullYear(),
      season: "",
    };
    switch (today.getMonth()) {
      case 1 || 2:
        vars.season = "WINTER";
        vars.year = today.getFullYear - 1;
        break;
      case 3 || 4 || 5:
        vars.season = "SPRING";
        break;
      case 6 || 7 || 8:
        vars.season = "SUMMER";
        break;
      case 9 || 10 || 11:
        vars.season = "FALL";
        break;
      case 12:
        vars.season = "WINTER";
      default:
        break;
    }
    axios({
      url: baseUrl,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      data: {
        query: query,
        variables: vars,
      },
    })
      .then(function (res) {
        let animu = res.data.data.Page.media;
        let i = 0; //TODO: stranky
        let a = animu[i];
        let em = new MessageEmbed()
          .setTitle(`${a.title.native} (${a.title.romaji})/${a.title.english}`)
          .setURL(`https://anilist.co/anime/${a.id}`)
          .setImage(a.coverImage.large)
          .setColor(a.coverImage.color)
          .addField(
            "Next episode in",
            secondsToHms(a.nextAiringEpisode.timeUntilAiring)
          );
        let desc = [];
        console.log(a.description);
        if (a.description.length < 1024)
          em.addField("Description", desanitize(a.description));
        else {
          let pismenkajupi = a.description.split("");
          let text = [];
          let j = 0;
          pismenkajupi.forEach((p) => {
            if (j == 1023) {
              desc.push(desanitize(text.join("")));
              text = [];
            } else {
              text.push(p);
            }
          });
          desc.push(desanitize(text.join("")));

          desc.forEach((l) => {
            em.addField("\u200b", l);
          });
        }
        message.channel.send(em).then((m) => {
          m.react("⬅️");
          m.react("➡️");
          const filter = (reaction, user) => {
            return (
              ["⬅️", "➡️"].includes(reaction.emoji.name) &&
              user.id === message.author.id
            );
          };
          let collector = m.createReactionCollector(filter, {
            time: 120000,
          });
          collector.on("collect", (reaction) => {
            if (reaction.emoji.name == "⬅️") {
              if (i == 0) return;
              i--;
              a = animu[i];
            } else {
              if (i == 9) return;
              i++;
              a = animu[i];
            }
            let newEm = new MessageEmbed()
              .setTitle(
                `${a.title.native} (${a.title.romaji})/${a.title.english}`
              )
              .setURL(`https://anilist.co/anime/${a.id}`)
              .setImage(a.coverImage.large)
              .setColor(a.coverImage.color)
              .addField(
                "Next episode in",
                secondsToHms(a.nextAiringEpisode.timeUntilAiring)
              );
            desc = [];
            console.log(a.description);
            if (a.description.length < 1024)
              newEm.addField("Description", desanitize(a.description));
            else {
              let letters = a.description.split("");
              let text = [];
              let j = 0;
              letters.forEach((p) => {
                if (j == 1023) {
                  desc.push(desanitize(text.join("")));
                  text = [];
                } else {
                  text.push(p);
                }
              });
              desc.push(desanitize(text.join("")));

              desc.forEach((l) => {
                newEm.addField("\u200b", l);
              });
            }
            m.edit(newEm);
          });
        });
      })
      .catch((err) => {
        console.log(err);
      });

    function desanitize(text) {
      let italic = text.replace(/<i>|<i\/>|<\/i>/gm, "*");
      let removeBR = italic.replace(/<br>/gm, "");
      return removeBR;
    }

    function secondsToHms(d) {
      // https://stackoverflow.com/a/37096512
      d = Number(d);
      var day = Math.floor(d / 86400);
      var h = Math.floor((d % 86400) / 3600);
      var m = Math.floor(((d % 86400) % 3600) / 60);
      var s = Math.floor(((d % 86400) % 3600) % 60);

      var dDisplay = day > 0 ? day + (day == 1 ? " day, " : " days, ") : "";
      var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
      var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
      var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
      return dDisplay + hDisplay + mDisplay + sDisplay;
    }
  },
};
