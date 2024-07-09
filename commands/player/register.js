const { SlashCommandBuilder } = require('@discordjs/builders');
const playerSchema = require('../../schemas/player-schema');
const partySchema = require('../../schemas/party-schema');
const guildSchema = require("../../schemas/guild-schema");
const { Inventory, Stats } = require('../../objects/Objects');
const mongooseConnection = require('../../events/mongooseConnection');
const { EmbedType } = require('discord.js');

/*
 * Register a new user
 * Every discord account can only be registered once per server
 * All user's discord ID to database. (Add user to system)
 * Let user know if they have successfully registered. 
 */


// TODO: Users have 1 account per guild

// Probably want to change this to a react event. Player registers by reacting to a message

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

        let playerData = await playerSchema.findOne({userId: interaction.user.id, guildId: interaction.guild.id});
        // If player does not exist in database, add it
        if(!playerData) {
            let guildData = await guildSchema.findOneAndUpdate(
                {
                    _id: interaction.guild.id
                },
                {
                    // 
                    $addToSet: { players: interaction.user.id, parties: interaction.user.id },
                }
            );
            // Check if guild is registered with the database
            if(!guildData) {
                console.log("Guild not found. Please register the guild with /initialize");
                await interaction.reply({content: "Guild not found. Please register the guild with /initialize", ephemeral: true});
                return;
            }

            // Add player to database
            playerData = new playerSchema({
                userId: interaction.user.id,
                guildId: interaction.guild.id,
                inventory: new Inventory(Inventory.defaultInventory()),
                stats: new Stats(Stats.defaultStats()),
                party: interaction.user.id,
            });
            await playerData.save().catch(err => {
                console.log("An error occurred while adding player to the database.")
                console.error(err);
                return;
            });
            // Add party to database
            let partyData = new partySchema({
                partyId: interaction.user.id,
                guildId: interaction.guild.id,
                members: [interaction.user.id],
            })
            await partyData.save().catch(err => {
                console.log("An error occurred while adding the party to the database.")
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