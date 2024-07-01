const { SlashCommandBuilder } = require('@discordjs/builders');

/*
 * Register a new user
 * Every discord account can only be registered once
 * All user's discord ID to database. (Add user to system)
 * Let user know if they have successfully registered. 
 */

module.exports = {
    category: "player",
    dev: true,
    cooldown: 1,
    data: new SlashCommandBuilder()
        .setName('register')
        .setDescription('Register a new player'),
    async execute(interaction) {
        
        await interaction.reply('Register...');
    },
};