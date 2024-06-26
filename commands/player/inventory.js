const { SlashCommandBuilder } = require('@discordjs/builders');

/*
 * Show player their inventory
 * Display gold / currency and items
 */

module.exports = {
    category: 'player',
    dev: true,
    cooldown: 1,
    data: new SlashCommandBuilder()
        .setName('inventory')
        .setDescription('Shows your inventory.'),
    async execute(interaction) {
        await interaction.reply('Inventory!');
    },
};