const { Schema, model } = require("mongoose");

const guildSchema = new Schema({

})

const Guild = new model("Guild", guildSchema);

module.exports = Guild;