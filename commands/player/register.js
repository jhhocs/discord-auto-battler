const { SlashCommandBuilder } = require('@discordjs/builders');
const { Inventory, Stats } = require('../../objects/Objects');
const mongooseConnection = require('../../events/mongooseConnection');

/*
 * Register a new user
 * Every discord account can only be registered once per server
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
        if(mongooseConnection.ready === false) {
            console.log("No connection to database. Player will not be added to database.");
            return;
        }

        let playerData = await playerSchema.findOne();
        // If player does not exist in database, add it
        if(!playerData) {
            playerData = new playerSchema({
                _id: interaction.user.id,
                inventory: new Inventory(),
                stats: new Stats(),
            });
            await playerData.save().catch(err => {
                console.log("An error occurred while adding player to the database.")
                console.error(err);
                return;
            });
            console.log(`Added player to database: ${interaction.user.username} (id: ${interaction.user.id}) (guild: ${interaction.guild.name})`);
        }
        else {
            console.log(`Player already exists in database: ${interaction.user.username} (id: ${interaction.user.id})`);
        }
        await interaction.reply('Register...');
    },
};