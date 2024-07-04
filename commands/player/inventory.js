const { SlashCommandBuilder } = require('@discordjs/builders');
const { Inventory } = require('../../objects/Objects');
const playerSchema = require('../../schemas/player-schema');
const mongooseConnection = require('../../events/mongooseConnection');

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
        // Check for database connection
        if(mongooseConnection.ready === false) {
            console.log("No connection to database. Player inventory will not be displayed.");
            return;
        }

        // Find player in database
        let playerData = await playerSchema.findById(interaction.user.id);
        if(!playerData) {
            console.log("Player not found in database.");
            await interaction.reply({ content: "Please register with /register before using this command", ephemeral: true});
            return;
        }
        let inventory = new Inventory(playerData.inventory);
        await interaction.reply({ content: inventory.display(), ephemeral: true});
    },
};