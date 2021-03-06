require('dotenv').config();
const fs = require('fs');
const Discord = require('discord.js');
const { Database } = require('./database/db.js');
const { prefixes, testingPrefixes } = require('./config.json');
const { getCommands, isBotAuthor, sendResponseCommand } = require('./utils');
const response = require('./commands/response/response');

const client = new Discord.Client();
client.database = new Database();
client.commands = getCommands();
client.prefixes = (process.env.DISCORD_TOKEN) ? prefixes : testingPrefixes;

client.once('ready', () => {
	console.log('Ready!');
	client.user.setPresence({ game: { name: `${prefixes[0]} help` } });

});

client.on('message', async message => {
	const args = message.content.split(/ +/);

	if (!client.prefixes.includes(args[0]) || message.author.bot) return;

	const prefixUsed = args.shift().toLowerCase();
	const commandName = args.shift().toLowerCase();

	// Check for general and response commands
	let command =
		client.commands['general'].get(commandName)
		|| client.commands['general'].find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	// Check for author commands3
	if (isBotAuthor(message.author)) {
		const authorCommand = client.commands['author'].get(commandName)
			|| client.commands['author'].find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
		if (authorCommand) command = authorCommand;
	}

	if (command) {
		try {
			await command.execute(message, args);
		}
		catch (error) {
			console.error(error);
		}
	}

	const responseCommandNames = await client.database.getResponseCommandNames();
	if (responseCommandNames.rows.map(x => x.command_name).includes(commandName)) {
		response.execute(message, [commandName]);
	}

});

client.login(process.env.DISCORD_TOKEN || process.env.DISCORD_TESTING_TOKEN);