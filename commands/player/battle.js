const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, SlashCommandBuilder } = require('discord.js');
const mongoose = require('mongoose');
const mongooseConnection = require('../../events/mongooseConnection');
const { BattleSchema, PlayerSchema, PartySchema } = require('../../schemas/Schemas');
const { startBattle } = require('../../game-logic/battleManager');

/*
 * Show player their inventory
 * Display gold / currency and items
 */

module.exports = {
    category: 'player',
    cooldown: 1,
    data: new SlashCommandBuilder()
        .setName('battle')
        .setDescription('Fight! Fight! Fight!')
        .addStringOption((option) => 
            option.setName('battle-type')
                .setDescription('1v1 or party battle')
                .setRequired(true)
                .addChoices(
                    // {name: '1v1', value: '1v1'},
                    {name: 'party', value: 'party'},
                ))
        .addUserOption((option) =>
            option.setName('opponent')
                .setDescription('Opponent to fight')
                .setRequired(true)),
    async execute(interaction) {
       // Check for database connection
        if(mongooseConnection.ready === false) {
            console.log("No connection to database. (battle.js)");
            return;
        }

        // Check if command is used in a climb channel
        if(interaction.channel.parent.name.toLowerCase() !== "fight club") {
            await interaction.reply({ content: "This command can not be used in this channel", ephemeral: true });
            return;
        }

        // Check if commannd is being executed in lobby channel / previous climb channel?
        let channelName = interaction.channel.name.toLowerCase();
        if(channelName !== "lobby") {
            await interaction.reply({ content: "A battle can only be started in the lobby!", ephemeral: true });
            return;
        }

        const battleType = interaction.options.getString('battle-type');
        const opponent = interaction.options.getUser('opponent');
        if(!battleType || !opponent) {
            console.log("No battle type or opponent provided. (battle.js)");
            return;
        }

        // /climb start
        // Get player's party
        // Pass party data to climb manager
        // Set player / party's climb status to started
        // Create channel for climb & display initial climb info

        // Find player in database
        let player1Data = await PlayerSchema.findOne({userId: interaction.user.id, guildId: interaction.guild.id});
        if(!player1Data) {
            console.log("Player not found in database.");
            await interaction.reply({ content: "Please register with /register before using this command", ephemeral: true});
            return;
        }

        let party1Data = await PartySchema.findOne({partyId: player1Data.partyId});
        let battleData;
        // Check if initiating party is in a battle
        if(party1Data && party1Data?.battleId !== "") {
            await interaction.reply({ content: "You are already in a battle!", ephemeral: true });
            return;
        }

        let player2Data = await PlayerSchema.findOne({userId: opponent.id, guildId: interaction.guild.id});        
        if(!player2Data) {
            console.log("Opponent not found in database.");
            await interaction.reply({ content: "Error: Opponent is not registered!", ephemeral: true});
            return;
        }

        let party2Data = await PartySchema.findOne({partyId: player2Data.partyId});

        // Check if opponent party is in a battle
        if(party2Data && party2Data?.battleId !== "") {
            await interaction.reply({ content: "Opponent is already in a battle!", ephemeral: true });
            return;
        }

        const accept = new ButtonBuilder()
                    .setCustomId('accept')
                    .setLabel('Accept')
                    .setStyle(ButtonStyle.Primary);

        const decline = new ButtonBuilder()
            .setCustomId('decline')
            .setLabel('Decline')
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder()
            .addComponents(accept, decline);

        let message = "Channelging ";
        if(party2Data && party2Data?.members.length > 0) {
            message += `<@${party2Data.leader}> `;
            for(let i = 0; i < party2Data.members.length; i++) {
                message += `<@${party2Data.members[i]}> `;
            }
        }
        else {
            message += `<@${player2Data.userId}> `;
        }
        message += "to a battle!";

        const response = await interaction.reply({ content: message, components:[row]});

        const filter = (i) => {
            if(party2Data.leader == i.user.id) {
                return true;
            }
            for(let i = 0; i < party2Data.members.length; i++) {
                if(party2Data.members[i] == i.user.id) {
                    return true;
                }
            }
            return false;
        }

        try {
            const userResponse = await response.awaitMessageComponent({ filter: filter, time: 60000 });
            switch (userResponse.customId) {
                case 'accept':
                    console.log("accepted");
                    let battleId = new mongoose.Types.ObjectId();

                    // Check if initiating player is in a party
                    if(player1Data.partyId === "") {
                        // Create party for user
                        let partyId = new mongoose.Types.ObjectId();
                        party1Data = new PartySchema({
                            partyId: partyId,
                            guildId: interaction.guild.id,
                            battleId: battleId,
                            leader: player1Data.userId,
                            members: [],
                            temp: true,
                        });

                        // Update player's partyId
                        player1Data.partyId = partyId;

                        // Save player data
                        await player1Data.save().catch(err => {
                            console.log(`An error occurred while saving ${interaction.user.username}'s player data. (climb.js)`);
                            console.error(err);
                            return;
                        });
                    }

                    // Check if opponent is in a party
                    if(player2Data.partyId === "") {
                        // Create party for user
                        let partyId = new mongoose.Types.ObjectId();
                        party2Data = new PartySchema({
                            partyId: partyId,
                            guildId: interaction.guild.id,
                            battleId: battleId,
                            leader: player2Data.userId,
                            members: [],
                            temp: true,
                        });

                        // Update player's partyId
                        player2Data.partyId = partyId;

                        // Save player data
                        await player2Data.save().catch(err => {
                            console.log(`An error occurred while saving ${interaction.user.username}'s player data. (climb.js)`);
                            console.error(err);
                            return;
                        });
                    }

                    // Check if opponent player is in a party

                    // // Check if party is already in a battle
                    // else if(partyData.battleId !== "") {
                    //     await interaction.reply({ content: "You are already in a battle!", ephemeral: true });
                    //     return;
                    // }
                    // else {
                    //     let id = new mongoose.Types.ObjectId();
                    //     partyData.battleId = id;

                    //     // Generate new climb
                    //     battleData = new BattleSchema({
                    //         _id: id,
                    //         partyId: partyData.partyId,
                    //         inBattle: false,
                    //     });
                    // }

                    battleData = new BattleSchema({
                        _id: battleId,
                        partyId1: party1Data.partyId,
                        partyId2: party2Data.partyId,
                        inBattle: false,
                    });

                    // Create new channel for climb
                    try {
                        let partyLeader = await PlayerSchema.findOne({userId: party1Data.leader, guildId: interaction.guild.id});
                        // let channel = await interaction.guild.channels.create({
                        let channel = await interaction.channel.parent.children.create({
                            name: `${partyLeader.username}s Battle`,
                            type: ChannelType.GuildText,
                        })
                        battleData.channel = channel.id;
                        console.log(`Created channel for battle: ${channel.name} (id: ${channel.id})`);
                        startBattle(battleData, channel, party1Data, party2Data);
                        await interaction.editReply({ content: `Battle Started! <\#${channel.id}>`, components: [] });
                    }
                    catch(err) {
                        console.log("An error occurred while creating a channel for the battle.");
                        console.error(err);
                        return;
                    }

                    // Save party data
                    await party1Data.save().catch(err => {
                        console.log(`An error occurred while saving ${interaction.user.username}'s party data. (battle.js)`);
                        console.error(err);
                        return;
                    });
                    await party2Data.save().catch(err => {
                        console.log(`An error occurred while saving ${interaction.user.username}'s opponent's party data. (battle.js)`);
                        console.error(err);
                        return;
                    });

                    // Save battle data
                    await battleData.save().catch(err => {
                        console.log(`An error occurred while saving ${interaction.user.username}'s battle data. (battle.js)`);
                        console.error(err);
                        return;
                    });
                    break;
                case 'decline':
                    console.log("declined");
                    await interaction.editReply({ content: "Battle Declined! >:(", components: [] });
                    break;
                default:
                    break;
            }
        }
        catch (error) {
            console.log("Opponent did not respond to battle request.");
            await interaction.editReply({ content: "Battle Request has timed out!", components: [] });
        }
    },
};