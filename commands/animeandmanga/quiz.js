const axios = require("axios").default;
let { MessageEmbed } = require("discord.js");
const User = require("../../models/User");
var ss = require("string-similarity");

let wl = ["145973959127597057", "724676555955241001", "815210915510878228"];
module.exports = {
  name: "quiz",
  description: "Get characters that has birthday today!",
  perms: [],
  timeout: 3000,
  category: "Anime & Manga",
  execute: async function (message, args, commands, bot) {
    let rounds;
    let currentRound = 1;
    let points = {};
    if (!wl.includes(message.author.id))
      return message.channel
        .send("This command is still in testing and does not work.")
        .then((m) => m.delete({ timeout: 5000 }));
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
      ).then(() => {
        message.channel.send("✅ Updated Anilist profile");
      });
      // end anilist username
    } else {
      if (!args[0])
        return message.channel.send(
          "❗ Please specify the number of rounds (Currently capped at 10)"
        ); // this could be more elegant
      rounds = Math.round(parseInt(args[0]));
      currentRound = 1;
      if (rounds > 10) return;

      let db = await User.findOne({ id: message.author.id });
      if (!db)
        return message.channel.send(
          ":x: Set your Anilist username using the `ak.quiz set <yourusername>` command"
        );
      let user = db.anilist;
      if (!user) return;

      let voiceChannel = message.member.voice.channel;
      if (bot.voice.connections.get(message.guild.id))
        return message.channel.send(":x: I am already in a voice channel");
      if (!voiceChannel)
        return message.channel.send(":x: You are not in a voice channel");
      if (!voiceChannel.joinable)
        return message.channel.send(
          ":x: Cannot join your voice channel, check permissions"
        );
      voiceChannel.join().then((connection) => {
        // joins voice channel
        message.channel.send(
          "Quiz started in " +
            `<#${voiceChannel.id}>, write answers to <#${message.channel.id}>`
        );
        points = {};
        runRound(
          connection,
          user,
          voiceChannel.id,
          voiceChannel.members.map((m) => m.id)
        );
      });
    }

    /**
     * Get vid link FROM https://themes.moe/api/
     * @returns video object
     */
    async function getVid(user) {
      let usr = (await axios.get("https://themes.moe/api/anilist/" + user))
        .data;
      //console.log(usr.length);
      if (usr.length == 0) return {};
      usr = usr.filter((e) => {
        return e.watchStatus == 2 || e.watchStatus == 1;
      });
      let anime = usr[Math.floor(Math.random() * (usr.length - 1))];
      let sorted = anime.themes.filter((e) => {
        return e.themeType.includes("OP");
      });
      if (sorted.length == 0) return await getVid(user);
      let random = sorted[Math.floor(Math.random() * (sorted.length - 1))];
      return { name: anime.name, link: random.mirror.mirrorURL };
    }

    /**
     * ran every round to initiate a new round
     */
    async function runRound(connection, user, id, allowedUsers) {
      if (
        currentRound > rounds ||
        !bot.voice.connections.get(message.guild.id)
      ) {
        connection.disconnect(); // leave on end
        let finalem = new MessageEmbed();
        let sort = [];
        let victory = "";
        for (const id in points) {
          sort.push([id, points[id]]);
        }
        sort.sort((a, b) => b - a);
        sort.forEach((element) => {
          victory += `<@${element[0]}> - ${element[1]} points\n`;
        });
        finalem.setTitle("Game Over!").addField("Final Scores", victory);
        message.channel.send(finalem);
      } else {
        let vid = await getVid(user);
        console.log(vid.name.toLowerCase());

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
        const filter = (e) => allowedUsers.includes(e.author.id);
        let collector = message.channel.createMessageCollector(filter, {
          time: 20000,
        });
        collector.on("collect", (me) => {
          var similarity = ss.compareTwoStrings(
            me.content.toLowerCase(),
            vid.name.toLowerCase()
          );
          console.log(points[me.author.id]);
          console.log(me.author.id);

          if (similarity > 0.8) {
            me.react("✅");
            me.delete();
            if (!points[me.author.id]) points[me.author.id] = 1;
            else points[me.author.id] += 1;
          }
        });
        collector.on("end", () => {
          message.channel.send("Correct answer: " + vid.name);
          currentRound++;
          connection.play("");
          runRound(connection, user, id, allowedUsers);
        });
      }
    }
  },
};
