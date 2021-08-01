const axios = require("axios").default;
let { MessageEmbed, ReactionUserManager } = require("discord.js");
const User = require("../../models/User");
var ss = require("string-similarity");

const baseUrl = require("../../data/apiLinks.json").anime.baseUrl;

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
      let db = await User.findOne({ id: message.author.id });
      if (!db)
        return message.channel.send(
          ":x: Set your Anilist username using the `ak.quiz set <yourusername>` command"
        );
      let user = db.anilist;
      if (!user) return;
      
      let vid = await getVid(user);
      let voiceChannel = message.member.voice.channel;
      if (!voiceChannel)
        return message.channel.send(":x: You are not in a voice channel");
      if (!voiceChannel.joinable)
        return message.channel.send(
          ":x: Cannot join your voice channel, check permissions"
        );
      voiceChannel.join().then((connection) => {
        // joins voice channel
        console.log(vid.name.toLowerCase());
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
        message.channel.send("Quiz started in " + `<#${voiceChannel.id}>`)
        const filter = (e) => e.author.id == message.author.id;
        let collector = message.channel.createMessageCollector(filter, {
          time: 20000,
        });
        collector.on("collect", (me) => {
          var similarity = ss.compareTwoStrings(me.content.toLowerCase(), vid.name.toLowerCase());
          if (similarity > 0.8) {
            me.react("✅")
          }
        });
        collector.on("end", (me) => {
          message.channel.send("Correct answer: " + vid.name);
          connection.disconnect(); // leave on end
        });
      });
    }

   

    /**
     * Get vid link FROM https://themes.moe/api/
     * @returns video object
     */
    async function getVid(user) {
      let usr = (await axios.get("https://themes.moe/api/anilist/"+user)).data;
      console.log(usr.length)
      if (usr.length == 0) return {};
      usr = usr.filter(e=>{
        return e.watchStatus == 2 || e.watchStatus == 1;
      })
      let anime = usr[Math.floor(Math.random() * (usr.length - 1))];
      let sorted = anime.themes.filter(e=>{
        return e.themeType.includes("OP")
      })
      console.log(sorted)
      let random = sorted[Math.floor(Math.random() * (sorted.length - 1))];
      return {name:anime.name,link:random.mirror.mirrorURL}
    }

  }}