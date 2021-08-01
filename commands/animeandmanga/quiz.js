const axios = require("axios").default;
let { MessageEmbed } = require("discord.js");
const User = require("../../models/User");

const baseUrl = require("../../data/apiLinks.json").anime.baseUrl;
const quizLinks = require("../../data/quiz.json");

let data = [];
let wl = ["145973959127597057","724676555955241001","815210915510878228"]
module.exports = {
  name: "quiz",
  description: "Get characters that has birthday today!",
  perms: [],
  timeout: 3000,
  category: "Anime & Manga",
  execute: async function (message, args, commands) {
    if(!wl.includes(message.author.id)) return message.channel.send("This command is still in testing and does not work.").then(m=>m.delete({timeout:5000}))
    if (args[0] == "set") {
      // command for setting anilist username
      if (!args[1])
        return message.channel.send(
          "Please type a Anilist username with the command"
        );
      User.findOneAndUpdate(
        { id: message.author.id },
        { anilist: args[1], id: message.author.id },
        { upsert: true }
      ).then((u) => {
        message.channel.send("✅ Updated Anilist profile");
      });
      // end anilist username
    } else {
      // start anilist API request
      let query = `query($username:String){
        MediaListCollection(userName:$username, type:ANIME){
          lists {
            isSplitCompletedList,
            isCustomList
            status,
            entries {
              media {
                title {
                  romaji,
                  english
                }
              }
            }
          }
        }
      }`;
      let db = await User.findOne({ id: message.author.id });
      if (!db)
        return message.channel.send(
          ":x: Set your Anilist username using the `ak.anilist set <yourusername>` command"
        );
      let user = db.anilist;
      if (!user) return;
      let vars = {
        username: user,
      };
      data = (
        await axios({
          url: baseUrl,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          data: {
            query: query,
            variables: vars,
          },
        })
      ).data.data.MediaListCollection.lists; // save user's lists
      // end anilist api request

      data = data.filter(
        (l) =>
          (l.status == "COMPLETED" || l.status == "CURRENT") && !l.isCustomList // filter all non-custom lists which are completed or current
      );

      if (data.length == 0)
        return message.channel.send(
          ":x: You appear to have no completed or watching anime on your profile"
        );

      let vid = await getFromList(); // gets link
      while (vid == false) {
        // if no link found, try another anime
        vid = await getFromList();
      }
      if (vid == undefined) {
        // if is undefined means that there are no more animu
        return message.channel.send(":) Game over");
      }

      let voiceChannel = message.member.voice.channel;
      if (!voiceChannel)
        return message.channel.send(":x: You are not in a voice channel");
      if (!voiceChannel.joinable)
        return message.channel.send(
          ":x: Cannot join your voice channel, check permissions"
        );
      voiceChannel.join().then((connection) => {
        // joins voice channel
        console.log(vid.name.english.toLowerCase());
        var points = 0;
        if (vid.link.split(".").pop() == "webm") {
          axios({
            method: "get",
            url: vid.link,
            responseType: "stream",
          }).then(function (response) {
            connection.play(response.data, { type: "webm/opus" }); //plays webm in voice
          });
        } else {
          connection.play(vid.link); // plays in voice
        }

        const filter = (e) => e.author.id == message.author.id;
        let collector = message.channel.createMessageCollector(filter, {
          time: 15000,
        });
        collector.on("collect", (me) => {
          if (me.content.toLowerCase() == vid.name.english.toLowerCase() || me.content.toLowerCase() == vid.name.romaji.toLowerCase()) {
            message.channel.send("correct");
          }
        });
        collector.on("end", (me) => {
          message.channel.send("Correct answer: " + vid.name.english);
          connection.disconnect(); // leave on end
        });
      });
    }

    async function getItemFromAnilist() {
      let chosen;
      let list = Math.floor(Math.random() * (data.length - 1)); // get random list
      try {
        chosen =
          data[list].entries[
            Math.floor(Math.random() * (data[list].entries.length - 1))
          ].media.title.english; // get random entry
        let itemIndex = data.indexOf(
          data[list].entries[
            Math.floor(Math.random() * (data[list].entries.length - 1))
          ]
        );
        data.splice(itemIndex);
      } catch (e) {
        console.error(e.message);
      }
      let query = `query($name:String){
        Media(search:$name){
          title{
            english,
            romaji
          }
        }
      }`;
      let vars = { name: chosen };
      let titles = ( // gets romaji and english title
        await axios({
          url: baseUrl,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          data: {
            query: query,
            variables: vars,
          },
        })
      ).data.data.Media.title;
      return titles;
    }

    /**
     * Get vid link FROM ANIMETHEMES by name from list
     * returns undefined if list is empty
     * returns false if nothing found
     * returns object if link
     */
    async function getVid(chosen) {
      if (data.length == 0) return undefined;
      let link;
      try {
        //let chosen = getItemFromAnilist();
        const res = await axios.get(
          `https://staging.animethemes.moe/api/search/?q=${escape(chosen.english)}`
        ); // request video

        if (res.status > 404) return 500;
        if (!res.data.search.anime[0]) return false;

        let slug = res.data.search.anime[0].slug;
        let videos = res.data.search.themes.filter((v) => v.type == "OP");
        if (res.data.search.themes.length == 0 || videos.length == 0)
          return false;
        console.log(
          `[QUIZ] https://staging.animethemes.moe/wiki/anime/${slug}/${videos[0].slug}`
        );
        const vidReq = await axios.get(
          `https://staging.animethemes.moe/wiki/anime/${slug}/${videos[0].slug}`
        );

        let vidRegEx = /<video src="[a-zA-Z\/:\.\-0-9]+/gm;
        link = vidRegEx.exec(vidReq.data)[0];
        if (!link) return false;

        return { link: link.replace('<video src="', ""), name: chosen };
      } catch (error) {
        message.channel.send(
          "The `ANIMETHEMES` API seems to be having some problems, please try again later or report to the developers."
        );
        message.channel.send(error.message);
      }
    }

    /**
     * Gets link from the JSON list
     */
    async function getFromList() {
      return new Promise(async (resolve, reject) => {
        if (data.length == 0) return undefined;
        let chosen = await getItemFromAnilist();
        console.log("[QUIZ] " + JSON.stringify(chosen));

        if (quizLinks[chosen.english]) {
          // if found with english
          let link = quizLinks[chosen.english].filter((v) => v.type == 1); // SETS IF OPENING OR ENDING
          if (link.length == 0) {
            // if no openings, try ANITHEMES
            let newl = await getVid(chosen);
            resolve(newl);
          } else resolve({ link: link[0].link, name: chosen });
        } else if (quizLinks[chosen.romaji]) {
          // if found with romaji
          let link = quizLinks[chosen.romaji].filter((v) => v.type == 1); // SETS IF OPENING OR ENDING
          if (link.length == 0) {
            let newl = await getVid(chosen);
            resolve(newl);
          } else resolve({ link: link[0].link, name: chosen });
        } else {
          // else try anithemes
          let newl = await getVid(chosen);
          resolve(newl);
        }
      });
    }
  },
};
