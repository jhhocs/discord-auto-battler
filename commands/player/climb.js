const { SlashCommandBuilder } = require('@discordjs/builders');
const { Inventory } = require('../../objects/Objects');
const { PlayerSchema, PartySchema, ClimbSchema } = require('../../schemas/Schemas');
const mongoose = require('mongoose');
const mongooseConnection = require('../../events/mongooseConnection');
const { ChannelType } = require('discord.js');

// Implement system to ask party members to accept?
// Implement system to allow party members to /ready
// Create role for party


module.exports = {
    category: 'player',
    dev: true,
    cooldown: 1,
    data: new SlashCommandBuilder()
        .setName('climb')
        .setDescription('Manage your climb')
        .addSubcommand(subcommand =>
            subcommand
                .setName('start')
                .setDescription('Start your climb')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('forfeit')
                .setDescription('End your climb early.')
        ),

    async execute(interaction) {
        // Check for database connection
        if(mongooseConnection.ready === false) {
            console.log("No connection to database. (climb.js)");
            return;
        }

        // /climb start
        // Get player's party
        // Pass party data to climb manager
        // Set player / party's climb status to started
        // Create channel for climb & display initial climb info

        // Find player in database
        let playerData = await PlayerSchema.findOne({userId: interaction.user.id, guildId: interaction.guild.id});
        if(!playerData) {
            console.log("Player not found in database.");
            await interaction.reply({ content: "Please register with /register before using this command", ephemeral: true});
            return;
        }

        let partyData = await PartySchema.findOne({partyId: playerData.partyId});
        let climbData;
        if(partyData && partyData?.climbId !== "") {
            climbData = await ClimbSchema.findOne({climbId: partyData.climbId});
        }

        switch (interaction.options.getSubcommand()) {
            case 'start':
                // Check if player is in a party
                if(playerData.partyId === "") {
                    // Generate climbId
                    let id = new mongoose.Types.ObjectId();
                    // Create party for user
                    let id2 = new mongoose.Types.ObjectId();
                    partyData = new PartySchema({
                        partyId: id2,
                        guildId: interaction.guild.id,
                        climbId: id,
                        leader: interaction.user.id,
                        members: [],
                    });

                    // Generate new climb
                    climbData = new ClimbSchema({
                        _id: id,
                        partyId: id2,
                        currentFloor: 0,
                    });

                    // Update player's partyId
                    playerData.partyId = id2;

                    // Save player data
                    await playerData.save().catch(err => {
                        console.log(`An error occurred while saving ${interaction.user.username}'s player data. (climb.js)`);
                        console.error(err);
                        return;
                    });
                }

                // Check if party is already in a climb
                else if(partyData.climbId !== "") {
                    await interaction.reply({ content: "You are already in a climb!", ephemeral: true });
                    return;
                }
                else {
                    partyData.climbId = id;

                    // Generate new climb
                    climbData = new ClimbSchema({
                        _id: id,
                        partyId: partyData.partyId,
                        currentFloor: 0,
                    });
                }

                // Save party data
                await partyData.save().catch(err => {
                    console.log(`An error occurred while saving ${interaction.user.username}'s party data. (climb.js)`);
                    console.error(err);
                    return;
                });

                // Create new channel for climb
                try {
                    let partyLeader = await PlayerSchema.findOne({userId: partyData.leader, guildId: interaction.guild.id});
                    let channel = await interaction.guild.channels.create({
                        name: `${partyLeader.username}s Climb`,
                        type: ChannelType.GuildText,
                    })
                    climbData.channel = channel.id;
                    console.log(`Created channel for climb: ${channel.name} (id: ${channel.id})`);
                    await interaction.reply({ content: `You have started a climb! <\#${channel.id}>`, ephemeral: true });
                }
                catch(err) {
                    console.log("An error occurred while creating a channel for the climb.");
                    console.error(err);
                    return;
                }

                // Save climb data
                await climbData.save().catch(err => {
                    console.log(`An error occurred while saving ${interaction.user.username}'s climb data. (climb.js)`);
                    console.error(err);
                    return;
                });

                break;
            case 'forfeit':
                // Check if player is in a party
                if(playerData.partyId === "" || partyData && partyData?.climbId === "") {
                    await interaction.reply({ content: "You are not in a climb!", ephemeral: true });
                    return;
                }

                partyData.climbId = "";
                await partyData.save().catch(err => {
                    console.log(`An error occurred while saving ${interaction.user.username}'s party data. (climb.js)`);
                    console.error(err);
                    return;
                });

                await interaction.reply({ content: "You have forfeited the climb.", ephemeral: true });
                break;
            default:
                break;
        }
    },
};