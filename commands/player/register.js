const { SlashCommandBuilder } = require('@discordjs/builders');
const playerSchema = require('../../models/player-schema');
const guildSchema = require("../../models/guild-schema");
const { Inventory, Stats } = require('../../objects/Objects');
const mongooseConnection = require('../../events/mongooseConnection');

/*
 * Register a new user
 * Every discord account can only be registered once per server
 * All user's discord ID to database. (Add user to system)
 * Let user know if they have successfully registered. 
 */


// TODO: Users have 1 account per guild

module.exports = {
    category: "player",
    dev: true,
    cooldown: 1,
    data: new SlashCommandBuilder()
        .setName('register')
        .setDescription('Register a new player'),
    async execute(interaction) {
        // Check for database connection
        if(mongooseConnection.ready === false) {
            console.log("No connection to database. Player will not be added to database.");
            return;
        }

        let playerData = await playerSchema.findOne({_id: interaction.user.id});
        // If player does not exist in database, add it
        if(!playerData) {
            let guildData = await guildSchema.findOneAndUpdate(
                {
                    _id: interaction.guild.id
                },
                {
                    $push: { players: interaction.user.id }
                }
            );
            // Check if guild is registered with the database
            if(!guildData) {
                console.log("Guild not found. Please register the guild with /initialize");
                await interaction.reply("Guild not found. Please register the guild with /initialize");
                return;
            }
            // Add player to database
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
            await interaction.reply("You have successfully registered.");
            console.log(`Added player to database: ${interaction.user.username} (id: ${interaction.user.id}) (guild: ${interaction.guild.name})`);

        }
        else {
            await interaction.reply("You have already registered.");
            console.log(`Player already exists in database: ${interaction.user.username} (id: ${interaction.user.id})`);
        }
    },
};