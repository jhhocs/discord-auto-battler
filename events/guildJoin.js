// Add guild to database if it does not yet exist. Guilds in the database should be stored using "guild-schema.js"
const guildSchema = require("../models/guild-schema");
const mongooseConnection = require("./mongooseConnection");

module.exports = {
	name: "guildCreate",
	async execute(guild) {
        console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);

		if(mongooseConnection.ready === false) {
			console.log("No connection to database. Guild will not be added to database.");
				return;
		}

		let guildData = await guildSchema.findOne({_id: guild.id});
		// If guild does not exist in database, add it
		if(!guildData) {
			guildData = new guildSchema({
				_id: guild.id,
				shop: [],
				players: [],
				parties: [],
			});
			await guildData.save().catch(err => {
				console.log("An error occurred while adding guild to the database.")
				console.error(err);
				return;
			});
			console.log(`Added guild to database: ${guild.name} (id: ${guild.id})`);
		}
		else {
			console.log(`Guild already exists in database: ${guild.name} (id: ${guild.id})`);
		}
	},
};