const { SlashCommandBuilder } = require('@discordjs/builders');
const guildSchema = require("../../models/guild-schema");
const mongooseConnection = require("../../events/mongooseConnection");

module.exports = {
	category: 'initialize',
    dev: true,
    cooldown: 1,
    data: new SlashCommandBuilder()
        .setName('initialize')
        .setDescription('Register a new guild'),
	async execute(interaction) {
        // Check for database connection
		if(mongooseConnection.ready === false) {
			console.log("No connection to database. Guild will not be added to database.");
				return;
		}

		let guildData = await guildSchema.findOne({_id: interaction.guild.id});
		// If guild does not exist in database, add it
		if(!guildData) {
			guildData = new guildSchema({
				_id: interaction.guild.id,
				shop: [],
				players: [],
				parties: [],
			});
			await guildData.save().catch(err => {
				console.log("An error occurred while adding guild to the database.")
				console.error(err);
                interaction.reply("An error occurred, please try again later.");
				return;
			});
            await interaction.reply("Guild has been registered.");
            console.log(`New guild registered: ${interaction.guild.name} (id: ${interaction.guild.id}).`);
		}
		else {
            await interaction.reply("Guild has already been registered.");
			console.log(`Guild already exists in database: ${interaction.guild.name} (id: ${interaction.guild.id})`);
		}
	},
};