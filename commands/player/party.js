const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const mongooseConnection = require('../../events/mongooseConnection');
const mongoose = require('mongoose');
const { PartySchema, PlayerSchema} = require('../../schemas/Schemas');


// May need to prevent party changes once a climb has started. May need to prevent users from being locked into parties if someone abandons / goes MIA
// Add a way to change party leader?

module.exports = {
    category: 'player',
    cooldown: 1,
    data: new SlashCommandBuilder()
	.setName('party')
	.setDescription('Manage your party')
	.addSubcommand(subcommand =>
		subcommand
			.setName('view')
			.setDescription('View current party'))
	.addSubcommand(subcommand =>
		subcommand
			.setName('invite')
			.setDescription('Invite a user to your party')
            .addUserOption((option) => 
                option.setName('user-to-invite')
                    .setDescription('The user to invite')
                    .setRequired(true)))
    .addSubcommand(subcommand =>
        subcommand
            .setName('leave')
            .setDescription('Leave your current party'))
    .addSubcommand(subcommand =>
        subcommand
            .setName('kick')
            .setDescription('Kick a user from your party')
            .addUserOption(option =>
                option.setName('user-to-kick')
                    .setDescription('The user to kick')
                    .setRequired(true))),
        
    async execute(interaction) {
        // Check for database connection
        if(mongooseConnection.ready === false) {
            console.log("No connection to database. (party.js)");
            return;
        }

        const playerData = await PlayerSchema.findOne({userId: interaction.user.id, guildId: interaction.guild.id});
        if(!playerData) {
            console.log(`/party: Player ${interaction.user.name} not found in database.`);
            await interaction.reply({ content: "Please register with /register before using this command", ephemeral: true});
            return;
        }

        let party = await PartySchema.findOne({partyId: playerData.partyId});

        switch (interaction.options.getSubcommand()) {
            case 'view':

                // Check if player is in a party
                if(playerData.partyId === "") {
                    await interaction.reply({ content: "You are currently not in a party", ephemeral: true});
                    return;
                }

                let displayedPartyData = "";
                const leaderData = await PlayerSchema.findOne({userId: party.leader, guildId: interaction.guild.id});

                displayedPartyData += `**👑 ${leaderData.username}**\n`;
                
                for(let member of party.members) {
                    const memberData = await PlayerSchema.findOne({userId: member, guildId: interaction.guild.id});
                    displayedPartyData += `**${memberData.username}**\n`;
                }

                const embed = new EmbedBuilder()
                    .setTitle("Party")
                    .setColor(0x0099FF)
                    .setDescription(displayedPartyData);

                await interaction.reply({ embeds: [embed], ephemeral: true});
                break;
            case 'invite':

                // Check if party is in a climb
                if(party.climbId !== "") {
                    await interaction.reply({ content: "You cannot invite players while in a climb", ephemeral: true});
                    return;
                }

                // Check if party is full
                if(party && isFull(party.members.length)) {
                    await interaction.reply({ content: "This party is already full!"});
                    return;
                }

                const user = interaction.options.getUser('user-to-invite');
                if(!user) return;

                const playerData2 = await PlayerSchema.findOne({userId: user.id, guildId: interaction.guild.id});
                if(!playerData2) {
                    console.log(`/party: Player ${user.name} not found in database.`);
                    await interaction.reply({ content: `${user.username} is not registered`, ephemeral: true});
                    return;
                }

                // Check if user is already in your party
                if(party?.members.includes(user.id)) {
                    await interaction.reply({ content: `${user.username} is already in your party!`, ephemeral: true});
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

                const response = await interaction.reply({ content: `Inviting user: ${user?.username}`, components:[row]});

                const collectorFilter = i => i.user.id === user.id;
                try {
                    const userResponse = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });
                    switch (userResponse.customId) {
                        case 'accept':
                            
                            if(party) {
                                // Check if user is already in this party
                                if(party.members.includes(user.id)) {
                                    await interaction.editReply({ content: `${user.toString()} you have already joined this party!`, components: []});
                                    return;
                                }

                                // Check if party is full
                                party = await PartySchema.findOne({partyId: playerData.partyId}); // Update party in case it was changed
                                if(isFull(party.members.length)) {
                                    await interaction.editReply({ content: "This party is full!", components: []});
                                    return;
                                }
                                // Check if user is already in a party
                                // const party2 = await partySchema.findOne({partyId: playerData2.partyId});
                                if(playerData2.partyId !== "") {
                                    await interaction.editReply({ content: `${user.toString()} You are already in a party!`, components: []});
                                    return;
                                }

                                playerData2.partyId = party.partyId;
                            }
                            else {
                                let id = new mongoose.Types.ObjectId();
                                party = new PartySchema({
                                    partyId: id,
                                    guildId: interaction.guild.id,
                                    climbId: "",
                                    leader: playerData.userId,
                                    members: [],
                                });
                                playerData.partyId = id;
                                playerData2.partyId = id;

                                await playerData.save().catch(err => {
                                    console.log(`An error occurred while updating ${playerData.username}'s partyId. User's _id: ${playerData._id}`);
                                    console.error(err);
                                    return;
                                });
                            }

                            // Add user to party
                            party.members.push(user.id);
                            await party.save().catch(err => {
                                console.log(`An error occurred while adding ${user.username} to ${playerData.username}'s party. partyId: ${party.partyId}`);
                                console.error(err);
                                return;
                            });

                            // Update user's partyId
                            await playerData2.save().catch(err => {
                                console.log(`An error occurred while updating ${user.username}'s partyId. User's _id: ${playerData2._id}`);
                                console.error(err);
                                return;
                            });

                            await interaction.editReply({ content: `${user.toString()} has joined the party`, components: [] });
                            break;
                        case 'decline':
                            await interaction.editReply({ content: `${user.toString()} has declined invite`, components: [] });
                            break;
                    }
                }
                catch (error) {
                    console.error(error);
                    await interaction.editReply({ content: 'Party Invite has timed out!', components: [] });
                }

                break;
            case 'leave':

                // Check if player is in a party
                if(playerData.partyId === "") {
                    await interaction.reply({ content: "You are currently not in a party", ephemeral: true});
                    return;
                }

                // Prevent player from leaving party while in a climb
                if(party.climbId !== "") {
                    await interaction.reply({ content: "You cannot leave a party while in a climb", ephemeral: true});
                    return;
                }

                if(party.members.length === 0) {
                    // Delete party from database
                    await PartySchema.deleteOne({partyId: party.partyId}).catch(err => {
                        console.log(`An error occurred while deleting party. partyId: ${playerData.partyId}`);
                        console.error(err);
                        return;
                    });
                }

                // Remove player from party
                else if(party.leader === playerData.userId) {
                    party.leader = party.members.shift();
                    // Update party in database
                    await party.save().catch(err => {
                        console.log(`An error occurred while removing ${playerData.username} from the party. partyId: ${party.partyId}`);
                        console.error(err);
                        return;
                    });

                }
                else {
                    party.members = party.members.filter((member) => member !== playerData.userId);
                    // Update party in database
                    await party.save().catch(err => {
                        console.log(`An error occurred while removing ${playerData.username} from the party. partyId: ${party.partyId}`);
                        console.error(err);
                        return;
                    });

                }

                // Update player's partyId in database
                playerData.partyId = "";
                await playerData.save().catch(err => {
                    console.log(`An error occurred while updating ${playerData.username}'s partyId. User's _id: ${playerData._id}`);
                    console.error(err);
                    return;
                });

                await interaction.reply({ content: "Leaving party!", ephemeral: true});
                break;
            case 'kick':

                // Prevent player from kicking while in a climb
                if(party.climbId !== "") {
                    await interaction.reply({ content: "You cannot kick players while in a climb", ephemeral: true});
                    return;
                }

                // Check if player is in a party
                if(playerData.partyId === "") {
                    await interaction.reply({ content: "You are currently not in a party!", ephemeral: true});
                    return;
                }

                // Check if player is the leader
                if(party.leader !== playerData.userId) {
                    await interaction.reply({ content: "You must be the party leader to use this command!", ephemeral: true});
                    return;
                }

                const userToKick = interaction.options.getUser('user-to-kick');

                // Check if you are trying to kick yourself
                if(userToKick.id === playerData.userId) {
                    await interaction.reply({ content: "You cannot kick yourself from your party", ephemeral: true});
                    return;
                }

                // Check if user is in the party
                if(!party.members.includes(userToKick.id)) {
                    await interaction.reply({ content: `${userToKick.username} is not in your party!`, ephemeral: true});
                    return;
                }

                // Remove user from party
                party.members = party.members.filter((member) => member !== userToKick.id);

                // Update party in database
                await party.save().catch(err => {
                    console.log(`An error occurred while removing ${userToKick.username} from the party. partyId: ${party.partyId}`);
                    console.error(err);
                    return;
                });

                // Update user's partyId in database
                await PlayerSchema.findOneAndUpdate(
                    {
                        userId: userToKick.id,
                        guildId: party.guildId,
                    },
                    {
                        partyId: "",
                    }
                ).catch(err => {
                    console.log(`An error occurred while updating ${userToKick.username}'s partyId. User's _id: ${playerData2._id}`);
                    console.error(err);
                    return;
                });

                await interaction.reply({ content: `${userToKick.username} has been kicked from your party`, ephemeral: true});
                break;
            default:
                return;
        }
    },
};

function isFull(numMembers) {
    return numMembers === 3;
}


// https://discordjs.guide/message-components/buttons.html#sending-buttons
// https://discordjs.guide/message-components/interactions.html#awaiting-components
// https://stackoverflow.com/questions/14763721/mongoose-delete-array-element-in-document-and-save