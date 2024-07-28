const { SlashCommandBuilder } = require('@discordjs/builders');
const { PlayerSchema, PartySchema, ClimbSchema } = require('../../schemas/Schemas');
const mongoose = require('mongoose');
const mongooseConnection = require('../../events/mongooseConnection');
const { ChannelType } = require('discord.js');
const { startFloor } = require('../../game-logic/climbManager');

// Implement system to ask party members to accept?
// Implement system to allow party members to /ready
// Create role for party


module.exports = {
    category: 'player',
    dev: true,
    cooldown: 0,
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
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('ascend')
                .setDescription('Procede to the next floor.')
        ),

    async execute(interaction) {
        // Check for database connection
        if(mongooseConnection.ready === false) {
            console.log("No connection to database. (climb.js)");
            return;
        }

        // Check if command is used in a climb channel
        if(interaction.channel.parent.name.toLowerCase() !== "climbs") {
            await interaction.reply({ content: "This command can not be used in this channel", ephemeral: true });
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
            climbData = await ClimbSchema.findOne({_id: partyData.climbId});
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
                        inBattle: false,
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
                    let id = new mongoose.Types.ObjectId();
                    partyData.climbId = id;

                    // Generate new climb
                    climbData = new ClimbSchema({
                        _id: id,
                        partyId: partyData.partyId,
                        currentFloor: 0,
                        inBattle: false,
                    });
                }

                // Create new channel for climb
                try {
                    let partyLeader = await PlayerSchema.findOne({userId: partyData.leader, guildId: interaction.guild.id});
                    // let channel = await interaction.guild.channels.create({
                    let channel = await interaction.channel.parent.children.create({
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

                // Save party data
                await partyData.save().catch(err => {
                    console.log(`An error occurred while saving ${interaction.user.username}'s party data. (climb.js)`);
                    console.error(err);
                    return;
                });

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
            case 'ascend':
                // Check if player is in a climb
                if(playerData.partyId === "" || partyData && partyData?.climbId === "") {
                    await interaction.reply({ content: "You are not in a climb!", ephemeral: true });
                    return;
                }

                // Check if party is in battle
                if(climbData.inBattle === true) {
                    await interaction.reply({ content: "You already have an active floor", ephemeral: true });
                    return;
                }

                // Increment party's current floor
                climbData.currentFloor++;
                // climbData.inBattle = true;

                startFloor(climbData, interaction.channel);

                // Save climb data to database
                await climbData.save().catch(err => {
                    console.log(`An error occurred while saving ${interaction.user.username}'s climb data. (climb.js)`);
                    console.error(err);
                    return;
                });

                await interaction.reply({ content: `You have ascended to floor ${climbData.currentFloor}.`, ephemeral: true });
                break;
                default:
                break;
        }
    },
};