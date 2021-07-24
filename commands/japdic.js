const axios = require("axios");
let { MessageEmbed } = require("discord.js");
const Discord = require("discord.js");

module.exports = {
  name: "jp",
  description: "Search in the japanese dictionary",
  perms: [],
  timeout: 3000,
  category: "Utility",
  execute: async function (message, args) {
    if (args.join(" ").length > 254) return;
    let p = 0;
    axios
      .get(
        `https://jisho.org/api/v1/search/words?keyword=${args.join("%20")}`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (compatible; MSIE 6.0; Windows CE; Trident/4.1)",
          },
        }
      )
      .then((res) => {
        if (!res.data.data[0])
          return message.reply("❗ Nenalezeny žádné výsledky.");
        let data = res.data.data[p];

        let vyznamy = [];
        let L = 1;
        data.senses.forEach((s) => {
          vyznamy.push(
            `${L}. ${s.english_definitions.join(", ")} ${
              s.restrictions.length > 0
                ? `*- platí pro* ${s.restrictions.join("; ")}`
                : ""
            }`
          );
          L++;
        });

        let resEm = new Discord.MessageEmbed()
          .setFooter(
            `Requested by ${message.author.username} | Information from Jisho.org`,
            message.author.displayAvatarURL({
              dynamic: true,
            })
          )
          .setTitle(`You're searching for: ${args.join(" ")}`)
          .setColor("#5865F2")
          .setDescription(`Page ${p + 1} of ${res.data.data.length}`);
        if (data.japanese[0].word !== undefined)
          resEm.addField(
            data.japanese[0].word,
            `${data.is_common ? "`Common`, " : ""}${
              data.tags[0] !== undefined && data.tags[0].includes("wanikani")
                ? `${data.tags[0].replace("wanikani", "`WaniKani Level ")}\`, `
                : ""
            }${
              data.jlpt.length > 0
                ? `\`${data.jlpt[data.jlpt.length - 1]
                    .toUpperCase()
                    .split("-")
                    .join(" ")}\``
                : ""
            }`
          );
        resEm
          .addField(
            "Japanese reading",
            data.japanese[0].reading !== undefined
              ? data.japanese[0].reading
              : "?"
          )
          .addField("Meaning", vyznamy.join("\n"));

        message.channel.send(resEm).then((m) => {
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
          collector.on("end",(c)=>{
            m.reactions.removeAll()
          })
          collector.on("collect", (reaction) => {
            if (reaction.emoji.name == "⬅️") {
              if (p == 0) {
                return;
              } else {
                p--;

                data = res.data.data[p];

                vyznamy = [];
                L = 1;
                data.senses.forEach((s) => {
                  vyznamy.push(
                    `${L}. ${s.english_definitions.join(", ")} ${
                      s.restrictions.length > 0
                        ? `*- applies to* ${s.restrictions.join("; ")}`
                        : ""
                    }`
                  );
                  L++;
                });
                let newE = new Discord.MessageEmbed()
                  .setFooter(
                    `Requested by ${message.author.username} | Information from Jisho.org`,
                    message.author.displayAvatarURL({
                      dynamic: true,
                    })
                  )
                  .setTitle(`You're searching for: ${args.join(" ")}`)
                  .setColor("#5865F2")
                  .setDescription(`Page ${p + 1} of ${res.data.data.length}`);
                if (data.japanese[0].word !== undefined)
                  newE.addField(
                    data.japanese[0].word,
                    `${data.is_common ? "`Common`, " : ""}${
                      data.tags[0] !== undefined &&
                      data.tags[0].includes("wanikani")
                        ? `${data.tags[0].replace(
                            "wanikani",
                            "`WaniKani Level "
                          )}\`, `
                        : ""
                    }${
                      data.jlpt.length > 0
                        ? `\`${data.jlpt[data.jlpt.length - 1]
                            .toUpperCase()
                            .split("-")
                            .join(" ")}\``
                        : ""
                    }\u200b`
                  );
                newE
                  .addField(
                    "Japanese reading",
                    data.japanese[0].reading !== undefined
                      ? data.japanese[0].reading
                      : "?"
                  )
                  .addField("Meaning", vyznamy.join("\n"));
                m.edit(newE);
              }
            } else if (reaction.emoji.name == "➡️") {
              if (p == res.data.data.length - 1) {
                return;
              } else {
                p++;

                data = res.data.data[p];

                vyznamy = [];
                L = 1;
                data.senses.forEach((s) => {
                  vyznamy.push(
                    `${L}. ${s.english_definitions.join(", ")} ${
                      s.restrictions.length > 0
                        ? `*- applies to* ${s.restrictions.join("; ")}`
                        : ""
                    }`
                  );
                  L++;
                });
                console.log(data.japanese[0].word);
                let newE = new Discord.MessageEmbed()
                  .setFooter(
                    `Requested by ${message.author.username} | Informace from Jisho.org`,
                    message.author.displayAvatarURL({
                      dynamic: true,
                    })
                  )
                  .setTitle(`You're searching for: ${args.join(" ")}`)
                  .setColor("#5865F2")
                  .setDescription(`Page ${p + 1} of ${res.data.data.length}`);
                if (data.japanese[0].word !== undefined)
                  newE.addField(
                    data.japanese[0].word,
                    `${data.is_common ? "`Běžné`, " : ""}${
                      data.tags[0] !== undefined &&
                      data.tags[0].includes("wanikani")
                        ? `${data.tags[0].replace(
                            "wanikani",
                            "`WaniKani Úroveň "
                          )}\`, `
                        : ""
                    }${
                      data.jlpt.length > 0
                        ? `\`${data.jlpt[data.jlpt.length - 1]
                            .toUpperCase()
                            .split("-")
                            .join(" ")}\``
                        : ""
                    }\u200b`
                  );
                newE
                  .addField(
                    "Japanese reading",
                    data.japanese[0].reading !== undefined
                      ? data.japanese[0].reading
                      : "?"
                  )
                  .addField("Meaning", vyznamy.join("\n"));
                m.edit(newE).catch(console.error);
              }
            }
          });
        });
      })
      .catch((e) => {
        message.reply("❗ Something broke");
        console.error(e);
      });
  },
};
