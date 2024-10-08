const { SlashCommandBuilder } = require('@discordjs/builders');
// const { GuildSchema } = require("../../schemas/Schemas");
// const mongooseConnection = require("../../events/mongooseConnection");
const { registerGuild } = require("../../misc/setup");
module.exports = {
	category: 'initialize',
    cooldown: 1,
    data: new SlashCommandBuilder()
        .setName('initialize')
        .setDescription('Register a new guild'),
	async execute(interaction) {
		// let temp = new Setup();
		let registered = await registerGuild(interaction.guild);
		if(registered === 0) {
			await interaction.reply("An error occurred, please try again later.");
			return;
		}
		else if(registered === 1) {
			await interaction.reply("Guild has been registered.");
			return;
		}
		else if(registered === 2) {
			await interaction.reply("Guild has already been registered.");
			return;
		}
        // Check for database connection
		// if(mongooseConnection.ready === false) {
		// 	console.log("No connection to database. Guild will not be added to database.");
		// 		return;
		// }

		// let guildData = await GuildSchema.findOne({_id: interaction.guild.id});
		// // If guild does not exist in database, add it
		// if(!guildData) {
		// 	guildData = new GuildSchema({
		// 		_id: interaction.guild.id,
		// 		shop: [],
		// 		players: [],
		// 		parties: [],
		// 	});
		// 	await guildData.save().catch(err => {
		// 		console.log("An error occurred while adding guild to the database.")
		// 		console.error(err);
        //         interaction.reply("An error occurred, please try again later.");
		// 		return;
		// 	});
        //     await interaction.reply("Guild has been registered.");
        //     console.log(`New guild registered: ${interaction.guild.name} (id: ${interaction.guild.id}).`);
		// }
		// else {
        //     await interaction.reply("Guild has already been registered.");
		// 	console.log(`Guild already exists in database: ${interaction.guild.name} (id: ${interaction.guild.id})`);
		// }
	},
};