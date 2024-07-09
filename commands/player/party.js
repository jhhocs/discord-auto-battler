const { SlashCommandBuilder } = require('@discordjs/builders');
const { Stats } = require('../../objects/Objects');
const playerSchema = require('../../schemas/player-schema');
const mongooseConnection = require('../../events/mongooseConnection');

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
			// .addUserOption(option => option.setName('target').setDescription('The user')))
	.addSubcommand(subcommand =>
		subcommand
			.setName('invite')
			.setDescription('Invite a user to your party'))
    .addSubcommand(subcommand =>
        subcommand
            .setName('leave')
            .setDescription('Leave your current party'))
    .addSubcommand(subcommand =>
        subcommand
            .setName('kick')
            .setDescription('Kick a user from your party')),
        
    async execute(interaction) {
        // Check for database connection
        if(mongooseConnection.ready === false) {
            console.log("No connection to database. Player inventory will not be displayed.");
            return;
        }
        switch (interaction.options.getSubcommand()) {
            case 'view':
                await interaction.reply({ content: "Viewing party", ephemeral: true});
                break;
            case 'invite':
                await interaction.reply({ content: "Inviting user", ephemeral: true});
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


// https://discordjs.guide/message-components/buttons.html#sending-buttons
// https://discordjs.guide/message-components/interactions.html#awaiting-components
// https://stackoverflow.com/questions/14763721/mongoose-delete-array-element-in-document-and-save