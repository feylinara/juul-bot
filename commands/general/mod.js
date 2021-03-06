const { Client, Permissions, Message } = require('discord.js');

module.exports = {
	name: 'mod',
	aliases: ['-m'],
	description: 'Performs moderation actions.',
	usages: ['mod', 'mod [command]'],

	async execute(message, args) {
		// Don't execute unless member has guild management permission
		if (!message.member.hasPermission(Permissions.FLAGS.MANAGE_GUILD)) {
			message.reply('you don\'t have the right permissions for this command.');
			return;
		}

		if (!args) return;
		const commandName = args.shift();

		const command =
			message.client.commands['mod'].get(commandName)
			|| message.client.commands['mod'].find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

		if (!command) return;

		try {
			command.execute(message, args);
		}
		catch (error) {
			console.error(error);
		}
	},
};