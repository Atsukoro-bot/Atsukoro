// Guild mongoose model
const Guild = require("../../models/Guild.js");


module.exports = {
  name: "togglecommand",
  description: "Turn command on/off",
  perms: [],
  args: [
    {
      name: "Name",
      description: "A name of the command to toggle",
      type: 3, //STRING 3, INTEGER 4 viac nájdeš v docs od djs
      required: true,
    },
  ],
  timeout: 5000,
  category: "Utility",
  execute: async function (message, args, commands) {
    function save(toggledOffCommands) {
      message.guild.toggledOffCommands = toggledOffCommands;
      Guild.findOneAndUpdate(
        {
          _id: message.guild.id,
        },
        {
          $set: {
            toggledOffCommands: toggledOffCommands,
          },
        },
        (err) => {
          if (err)
            return message.channel.send(
              "Something went wrong, contact administrator :x:"
            );

          message.channel.send(`Sucefully turned off command ${args[0]}`);
        }
      );
    }

    async function toggleCommand(command) {
      Guild.findOne(
        {
          _id: message.guild.id,
        },
        (err, guild) => {
          if (err)
            return message.channel.send(
              "Something went wrong, contact administrator :x:"
            );

          if (guild.toggledOffCommands.includes(command)) {
            // Remove command from toggled off commands
            guild.toggledOffCommands.splice(
              guild.toggledOffCommands.indexOf(command),
              1
            );
            save(guild.toggledOffCommands);
          } else {
            // Add command to toggled off commands
            guild.toggledOffCommands.push(command);
            save(guild.toggledOffCommands);
          }
        }
      );
    }

    // Check if user is administator
    if (!message.member.hasPermission("ADMINISTRATOR"))
      return message.channel.send(
        "You dont have permissions to use this command! :x:"
      );

    // Check if user specified a command name
    if (!args[0])
      return message.channel.send("Please specify a command name! :x:");

    // Check if command name is valid
    if (commands.has(args[0])) return toggleCommand(args[0]);

    return message.channel.send("This command does not exist! :x:");
  },
};
