const { Client, Collection } = require("discord.js");
const chalk = require("chalk");
const mongoose = require("mongoose");
const fs = require("fs");

// Create a new client.
const client = new Client();

// kdo je dobry premier

// Import mongoose models
const Guild = require("./models/Guild.js");

// Command collection
client.commands = new Collection();
client.timeouts = new Collection();

require("dotenv").config();

// Connect Mongoose database
mongoose
  .connect(process.env.MONGOURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log(`${chalk.green("[DATABASE]")} Mongoose database connected! `);
  })
  .catch((err) => {
    throw err;
  });

// Command handler
const commandFolders = fs.readdirSync("./commands");
for (let index = 0; index < commandFolders.length; index++) {
  let commandFiles = fs.readdirSync("./commands/" + commandFolders[index]);
  for (let j = 0; j < commandFiles.length; j++) {
    try {
      let command = require("./commands/" +
        commandFolders[index] +
        "/" +
        commandFiles[j]);
      client.commands.set(command.name, command);

      console.log(
        `${chalk.green("[CMD]")} Loaded ${chalk.blueBright(command.name)}`
      );
    } catch (e) {
      console.log(`${chalk.red("[CMD]")} Error: ${e}`);
    }
  }
}

// Do when the client is ready.
client.on("ready", async () => {
  console.log(`${chalk.green("[BOT]")} Bot client ready!`);

  client.user.setActivity("Help | ak.help");

  client.guilds.cache.forEach(async (guild) => {
    let { prefix, toggledOffCommands, lang } = await Guild.findOne({
      _id: guild.id,
    });
    guild.prefix = prefix;
    guild.toggledOffCommands = toggledOffCommands;
    guild.lang = lang;
  });
});

client.on("guildCreate", (guild) => {
  let newGuild = new Guild({
    _id: guild.id,
  });

  newGuild.save();
});

client.on("guildDelete", (guild) => {
  Guild.findOneAndDelete({ _id: guild.id });
});

// Do when someone post a message.
client.on("message", async (message) => {
  // Get guild information
  let { prefix, toggledOffCommands, lang } = message.guild;

  // Check if message author is bot or channel is dms
  if (message.author.bot || message.channel.type == "dm") return;

  if (!message.content.startsWith(prefix)) return;

  // Get command name
  let command = message.content.substring(prefix.length);
  command = command
    .split(" ")[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  // Get arugments
  let args = message.content.substring(prefix.length + command.length + 1);
  args = args.split(" ");

  // Check if command exists
  if (!client.commands.has(command)) return;

  // Get command
  let commandObject = client.commands.get(command);

  if (commandObject.category == "nsfw" && message.channel.nsfw != true)
    return message.channel.send(":no_entry: You need to be in a NSFW channel");

  // Check if user has permissions to use the command
  commandObject.perms.forEach((perm) => {
    if (!message.member.hasPermission(perm)) {
      message.channel.send("You do not have permission to use this command!");
      return;
    }
  });

  // Handle timeout
  let timeoutCache = client.timeouts.get(message.author.id);
  if (timeoutCache - Date.now() > 0) {
    return message.channel.send(
      `Wait **${new Date(
        timeoutCache - Date.now()
      ).getSeconds()}** seconds to use that command again!`
    );
  } else {
    client.timeouts.delete(message.author.id);
  }

  // Check if command is not toggled off in this guild
  if (toggledOffCommands.includes(command))
    return message.channel.send("This command is restricted in this guild!");

  // Execute command
  commandObject.execute(message, args, client.commands, client);

  // Set timeout
  client.timeouts.set(message.author.id, Date.now() + commandObject.timeout);
});

process.on("uncaughtException", console.log);

// Load the token from the .env file and log in to Discord.
client.login(process.env.TOKEN);
