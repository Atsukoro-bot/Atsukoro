const axios = require("axios").default;
let { MessageEmbed } = require("discord.js");
const User = require("../../models/User");

const baseUrl = require("../../data/apiLinks.json").anime.baseUrl;
const quizLinks = require("../../data/quiz.json")

let data = [];
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
                  romaji,
                  english
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
      data = (
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

      if(data.length == 0) return message.channel.send(":x: You appear to have no completed or watching anime on your profile")

      let vid = await getFromList()
      while (vid == false) {
        vid = await getFromList()
      }
      if(vid == undefined){
        return message.channel.send(":) Game over")
      }
      
      console.log(vid.name.toLowerCase())
      message.channel.send(vid.link).then(m=>{
        const filter = e=>e.author.id == message.author.id
        let collector = message.channel.createMessageCollector(filter,{time:15000})
        collector.on('collect',me=>{
          console.log(me.content == vid.name.toLowerCase())
          if(me.content == vid.name || me.content == vid.name.toLowerCase()){
            message.channel.send("correct")
          }
        })
        collector.on('end',me=>{
          message.channel.send("Correct answer: "+ vid.name)
        })

      })
    }

    function getItemFromAnilist(){
      let chosen
      let list = Math.floor(Math.random() * (data.length - 1)); // get random list
      try {
        chosen =
          data[list].entries[
            Math.floor(Math.random() * (data[list].entries.length - 1))
          ].media.title.english; // get random entry
      let itemIndex = data.indexOf(data[list].entries[
        Math.floor(Math.random() * (data[list].entries.length - 1))
      ])
      data.splice(itemIndex)
    }
    catch (e){
      console.error(e.message)
    }
    return chosen
    }

    /**
     * Get vid link FROM ANIMETHEMES by name from list
     * returns undefined if list is empty
     * returns false if nothing found
     * returns object if link
     */
    async function getVid(){
      if(data.length == 0) return undefined
      try{
        let chosen = getItemFromAnilist()
          const res = await axios.get(
          `https://staging.animethemes.moe/api/search/?q=${escape(chosen)}`
        ); // request video
        
        if(res.status > 404) return 500
        if(!res.data.search.anime[0]) return false
        
        let slug = res.data.search.anime[0].slug
        let videos = res.data.search.themes.filter(v=>v.type == "OP")
        console.log(videos.length)
        if(res.data.search.themes.length == 0 || videos.length == 0) return false
        
        const vidReq = await axios.get(`https://staging.animethemes.moe/wiki/anime/${slug}/${videos[0].slug}`)
          console.log(`https://staging.animethemes.moe/wiki/anime/${slug}/${videos[0].slug}`)
        let vidRegEx = /<video src="[a-zA-Z\/:\.\-0-9]+/gm
        let link = vidRegEx.exec(vidReq.data)[0]
        if(!link) return false
        
        return {link:link.replace("<video src=\"",""),name:chosen}
      } catch (error) {
        message.channel.send("neco se posralo");
        message.channel.send(error.message);
      }
    }

    /**
     * Gets link from the JSON list
     */
    async function getFromList(){
      return new Promise(async(resolve,reject)=>{
        if(data.length == 0) return undefined;
        let chosen = getItemFromAnilist()
        let link = quizLinks[chosen].filter(v=>v.type==1) // SETS IF OPENING OR ENDING
        console.log(link)
        if(!link) {
          let newl = await getVid();
          resolve(newl)
        }
        else resolve({link:link[0],name:chosen})
      })
    }
  },
};
