const { Schema, model } = require("mongoose");

const guildSchema = new Schema({
    _id: {
        type: String,
        required: true
    },

    prefix: {
        type: String,
        default: "ak."
    },

    toggledOffCommands: {
        type: Array,
        default: []
    },

    language: {
        type: String,
        default: "en"
    }
})

const Guild = new model("Guild", guildSchema);

module.exports = Guild;