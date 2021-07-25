const axios = require("axios");
let {
    MessageEmbed
} = require("discord.js");

// Guild mongoose model
const Guild = require("../../models/Guild.js");

const baseUrl = require("../../data/apiLinks.json").anime.baseUrl;

module.exports = {
    name: "prefix",
    description: "Change server prefix!",
    perms: [],
    timeout: 5000,
    category: "Utility",
    execute: async function (message, args) {

        // Check if user is administator
        if (!message.member.hasPermission("ADMINISTRATOR")) return message.channel.send("You dont have permissions to use this command! :x:");

        // Check if user specified a prefix
        if (!args[0]) return message.channel.send("Please specify a new prefix!");

        // Check if prefix is too long
        if (args[0].length > 32) return message.channel.send("Prefix is too long! Please keep it under 32 characters!");


        // Set new prefix
        Guild.updateOne({
            _id: message.guild.id
        }, {
            $set: {
                prefix: args[0]
            }
        }).then(() => {
            message.channel.send(`Prefix changed to **${args[0]}** !`);
        }).catch((err) => {
            message.channel.send("Something went wrong! Please try again later!");
        });
    },
};