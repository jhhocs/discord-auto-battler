const { SlashCommandBuilder } = require('discord.js');
const mongoose = require('mongoose');

module.exports = {
	category: 'utility',
	cooldown: 1,
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {

		console.log(mongoose.connection.readyState);
		await interaction.reply('Pong!');
	},
};