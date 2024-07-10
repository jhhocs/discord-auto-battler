const { SlashCommandBuilder } = require('@discordjs/builders');
const { Stats } = require('../../objects/Objects');
const playerSchema = require('../../schemas/player-schema');
const mongooseConnection = require('../../events/mongooseConnection');

/*
 * Display player stats
 */

module.exports = {
    category: 'player',
    dev: true,
    cooldown: 1,
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('View your stats.'),
    async execute(interaction) {
        // Check for database connection
        if(mongooseConnection.ready === false) {
            console.log("No connection to database. Player inventory will not be displayed.");
            return;
        }

        // Find player in database
        let playerData = await playerSchema.findOne({userId: interaction.user.id, guildId: interaction.guild.id});
        if(!playerData) {
            console.log(`/stats: Player ${interaction.user.name} not found in database.`);
            await interaction.reply({ content: "Please register with /register before using this command", ephemeral: true});
            return;
        }
        let stats = new Stats(playerData.stats);
        await interaction.reply({ embeds: [stats.display()], ephemeral: true});
    },
};