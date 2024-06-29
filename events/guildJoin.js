// Add guild to database if it does not yet exist. Guilds in the database should be stored using "guild-schema.js"
const guildSchema = require("../models/guild-schema");

module.exports = {
	name: "guildCreate",
	async execute(guild) {
        console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
		let guildData = await guildSchema.findOne();
		// If guild does not exist in database, add it
		if(!guildData) {
			guildData = new guildSchema({
				_id: guild.id,
				shop: [],
				players: [],
				parties: [],
			});
			await guildData.save().catch(err => console);
			console.log(`Added guild to database: ${guild.name} (id: ${guild.id})`);
		}
		else {
			console.log(`Guild already exists in database: ${guild.name} (id: ${guild.id})`);
		}
	},
};