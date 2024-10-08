const { SlashCommandBuilder } = require('@discordjs/builders');
const { PlayerSchema, GuildSchema } = require('../../schemas/Schemas');
const { Inventory, Stats } = require('../../objects/Objects');
const mongooseConnection = require('../../events/mongooseConnection');
// const { EmbedType } = require('discord.js');

/*
 * Register a new user
 * Every discord account can only be registered once per server
 * All user's discord ID to database. (Add user to system)
 * Let user know if they have successfully registered. 
 */

// Probably want to change this to a react event. Player registers by reacting to a message

module.exports = {
    category: "player",
    cooldown: 1,
    data: new SlashCommandBuilder()
        .setName('register')
        .setDescription('Register a new player'),
    async execute(interaction) {
        // Check for database connection
        if(mongooseConnection.ready === false) {
            console.log("No connection to database. (register.js)");
            return;
        }

        let playerData = await PlayerSchema.findOne({userId: interaction.user.id, guildId: interaction.guild.id});
        // If player does not exist in database, add it
        if(!playerData) {
            let guildData = await GuildSchema.findOneAndUpdate(
                {
                    _id: interaction.guild.id
                },
                {
                    $addToSet: { players: interaction.user.id },
                }
            );
            // Check if guild is registered with the database
            if(!guildData) {
                console.log("Guild not found. Please register the guild with /initialize");
                await interaction.reply({content: "Guild not found. Please register the guild with /initialize", ephemeral: true});
                return;
            }

            // Add player to database
            playerData = new PlayerSchema({
                userId: interaction.user.id,
                guildId: interaction.guild.id,
                username: interaction.user.username,
                inventory: new Inventory(Inventory.defaultInventory()),
                stats: new Stats(Stats.defaultStats()),
                partyId: "",
            });
            await playerData.save().catch(err => {
                console.log("An error occurred while adding player to the database.")
                console.error(err);
                return;
            });

            await interaction.reply({content: "You have successfully registered.", ephemeral: true});
            console.log(`Added player to database: ${interaction.user.username} (id: ${interaction.user.id}) (guild: ${interaction.guild.name})`);

        }
        else {
            await interaction.reply({content: "You have already registered.", ephemeral: true});
            console.log(`Player already exists in database: ${interaction.user.username} (id: ${interaction.user.id})`);
        }
    },
};