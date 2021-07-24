const Discord = require("discord.js");
const fs = require("fs");

// Create a new client.
const client = new Discord.Client();

// Command collection
client.commands = new Discord.Collection();
client.timeouts = new Discord.Collection();

require("dotenv").config();

// Command handler
const commandFolders = fs.readdirSync("./commands");
for (let index = 0; index < commandFolders.length; index++) {
  let commandFiles = fs.readdirSync("./commands/"+commandFolders[index])
  for (let j = 0; j < commandFiles.length; j++) {
    let command = require("./commands/" + commandFolders[index] +"/" + commandFiles[j]);
    client.commands.set(command.name, command);
  }
}

// Do when the client is ready.
client.on("ready", () => {
  console.log("[BOT] Bot client ready!");

  client.user.setActivity("Help | ak.help");
});

// Do when someone post a message.
client.on("message", (message) => {
  let prefix = "ak.";

  // Check if message author is bot or channel is dms
  if (message.author.bot || message.channel.type == "dm") return;

  if (!message.content.startsWith(prefix)) return;

  // Get command name
  let command = message.content.substring(prefix.length);
  command = command.split(" ")[0];
  command = command.toLowerCase();
  command = command.replace(/[^a-z0-9]/g, "");

  // Get arugments
  let args = message.content.substring(prefix.length + command.length + 1);
  args = args.split(" ");

  // Check if command exists
  if (!client.commands.has(command)) return;

  // Get command
  let commandObject = client.commands.get(command);

  // Check if user has permissions to use the command
  commandObject.perms.forEach((perm) => {
    if (!message.member.hasPermission(perm)) {
      message.channel.sendMessage(
        "You do not have permission to use this command!"
      );
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

  // Execute command
  commandObject.execute(message, args, client.commands);

  // Set timeout
  client.timeouts.set(message.author.id, Date.now() + commandObject.timeout);
});

// Load the token from the .env file and log in to Discord.
client.login(process.env.TOKEN);
