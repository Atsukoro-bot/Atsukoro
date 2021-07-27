const axios = require("axios").default;
let { MessageEmbed } = require("discord.js");
const User = require("../../models/User");

const baseUrl = require("../../data/apiLinks.json").anime.baseUrl;

module.exports = {
  name: "quiz",
  description: "Get characters that has birthday today!",
  perms: [],
  timeout: 3000,
  category: "Anime & Manga",
  execute: async function (message, args, commands) {
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
                  romaji
                }
              }
            }
          }
        }
      }`;
      let user = (await User.findOne({ id: message.author.id })).anilist;
      if (!user) return;
      let vars = {
        username: user,
      };
      let data = (
        await axios({
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
      ).data.data.MediaListCollection.lists; // save user's lists
      // end anilist api request
      data = data.filter(
        (l) =>
          (l.status == "COMPLETED" || l.status == "CURRENT") && !l.isCustomList // filter all non-custom lists which are completed or current
      );
      let list = Math.floor(Math.random() * (data.length - 1)); // get random list
      try {
        let chosen =
          data[list].entries[
            Math.floor(Math.random() * (data[list].entries.length - 1))
          ].media.title.romaji; // get random entry
        
          const res = await axios.get(
          `https://staging.animethemes.moe/api/search/?q=${escape(chosen)}`
        ); // request video
        
        if(res.status > 404) return message.channel.send("the server seems to be having some problems")
        if(!res.data.search.anime[0]) return console.log("[Q] anime not found")
        
        let slug = res.data.search.anime[0].slug
        let videos = res.data.search.themes.filter(v=>v.type == "OP")
        console.log(videos.length)
        if(res.data.search.themes.length == 0 || videos.length == 0) return message.channel.send("no video")
        
        console.log(`https://staging.animethemes.moe/wiki/anime/${slug}/${videos[0].slug}`)
        const vidReq = await axios.get(`https://staging.animethemes.moe/wiki/anime/${slug}/${videos[0].slug}`)
          
        let vidRegEx = /<video src="[a-zA-Z\/:\.\-0-9]+/gm
        let link = vidRegEx.exec(vidReq.data)[0]
        if(!link) return message.channel.send("error getting link")
        
        message.channel.send(link.replace("<video src=\"",""))
      } catch (error) {
        message.channel.send("neco se posralo");
        message.channel.send(error.message);
      }
    }
  },
};
