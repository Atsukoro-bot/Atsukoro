const translations = require("../data/translations.json");

module.exports = function get(lang, commandName) {
    return translations[commandName] && translations[commandName][lang] ? translations[commandName][lang] : translations[commandName]["en"];
};