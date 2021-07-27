const axios = require("axios").default;
let { MessageEmbed } = require("discord.js");
const User = require("../../models/User")

const baseUrl = require("../../data/apiLinks.json").anime.baseUrl;


module.exports = {
  name: "quiz",
  description: "Get characters that has birthday today!",
  perms: [],
  timeout: 5000,
  category: "Anime & Manga",
  execute: async function (message, args, commands) {
    if(args[0] == "set"){
      if(!args[1]) return message.channel.send("Please type a Anilist username with the command")
      User.findOneAndUpdate({id:message.author.id},{anilist:args[1],id:message.author.id},{upsert: true}).then(u=>{
        message.channel.send("✅ Updated Anilist profile")
      })
    }
    else{
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
      }`
      let user = (await User.findOne({id:message.author.id})).anilist
      if(!user) return;
      let vars = {
        username:user
      }
      let data = (await axios({
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
      })).data.data.MediaListCollection.lists
      data = data.filter(l=>(l.status=="COMPLETED"||l.status=="CURRENT")&&!l.isCustomList)
      let list = Math.floor(Math.random() * (data.length+1))
      console.log(data[list].entries[Math.floor(Math.random() * (data[list].entries.length-1))])
      let chosen = data[list].entries[Math.floor(Math.random() * (data[list].entries.length-1))].media.title.romaji
      const res = await axios.get(`https://www.reddit.com/r/animethemes/search.json?q=${chosen.replace(" ","%20")}&limit=1&restrict_sr=true`)
      console.log(res.data.data)
      if(!res.data.data.children[0]) return message.channel.send("ne")
      message.channel.send((res.data.data.children[0].data.url_overridden_by_dest !== undefined && res.data.data.children[0].data.url_overridden_by_dest !== "")?res.data.data.children[0].data.url_overridden_by_dest:"error")
    }
  },
};
