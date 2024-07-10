const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');
const mongooseConnection = require('../../events/mongooseConnection');
const partySchema = require('../../schemas/party-schema');
const playerSchema = require('../../schemas/player-schema');

module.exports = {
    category: 'player',
    dev: true,
    cooldown: 1,
    data: new SlashCommandBuilder()
	.setName('party')
	.setDescription('Get info about a user or a server!')
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
            console.log("No connection to database.");
            return;
        }

        const playerData = await playerSchema.findOne({userId: interaction.user.id, guildId: interaction.guild.id});
        if(!playerData) {
            console.log(`/party: Player ${interaction.user.name} not found in database.`);
            await interaction.reply({ content: "Please register with /register before using this command", ephemeral: true});
            return;
        }

        switch (interaction.options.getSubcommand()) {
            case 'view':
                
                await interaction.reply({ content: "Viewing party", ephemeral: true});
                break;
            case 'invite':

                let party = await partySchema.findOne({partyId: playerData.partyId});

                // Check if party is full
                if(isFull(party.members.length)) {
                    await interaction.reply({ content: "This party is already full!"});
                    return;
                }

                const user = interaction.options.getUser('user-to-invite');
                if(!user) return;

                // Check if user is already in your party
                if(party.members.includes(user.id)) {
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
                            // Check if user is already in this party
                            if(party.members.includes(user.id)) {
                                await interaction.editReply({ content: `${user.toString()} you have already joined this party!`, components: []});
                                return;
                            }

                            // Check if party is full
                            party = await partySchema.findOne({partyId: playerData.partyId});
                            if(isFull(party.members.length)) {
                                await interaction.editReply({ content: "This party is full!", components: []});
                                return;
                            }
                            // Check if user is already in a party
                            const playerData2 = await playerSchema.findOne({userId: user.id, guildId: interaction.guild.id});
                            const party2 = await partySchema.findOne({partyId: playerData2.partyId});
                            if(party2.members.length > 1) {
                                await interaction.editReply({ content: `${user.toString()} You are already in a party!`, components: []});
                                return;
                            }

                            // Add user to party
                            party.members.push(user.id);
                            await party.save().catch(err => {
                                console.log(`An error occurred while adding ${user.username} to ${playerData.username}'s party. partyId: ${party.partyId}`);
                                console.error(err);
                                return;
                            });

                            // Update user's partyId
                            playerData2.partyId = party.partyId;
                            await playerData2.save().catch(err => {
                                console.log(`An error occurred while updating ${user.username}'s partyId. User's _id: ${playerData2._id}`);
                                console.error(err);
                                return;
                            });

                            // Remove user from their pervious party
                            party2.members = []; // User must be in a party of 1 to join a new party. We can just set the array to empty
                            await party2.save().catch(err => {
                                console.log(`An error occurred while removing ${user.username} from their party. partyId: ${party2.partyId}`);
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
                    // console.error(error);
                    await interaction.editReply({ content: 'Party Invite has timed out!', components: [] });
                }

                break;
            case 'leave':
                await interaction.reply({ content: "Leaving party", ephemeral: true});
                break;
            case 'kick':
                await interaction.reply({ content: "Kicking user", ephemeral: true});
                break;
            default:
                await interaction.reply({ content: "wtf", ephemeral: true});
                break;
        }
    },
};

function isFull(numMembers) {
    return numMembers === 4;
}


// https://discordjs.guide/message-components/buttons.html#sending-buttons
// https://discordjs.guide/message-components/interactions.html#awaiting-components
// https://stackoverflow.com/questions/14763721/mongoose-delete-array-element-in-document-and-save