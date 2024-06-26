const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	category: 'utility',
	cooldown: 1,
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		await interaction.reply('Pong!');
	},
};