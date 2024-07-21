// Add guild to database if it does not yet exist. Guilds in the database should be stored using "guild-schema.js"
const { registerGuild } = require("../misc/setup");

module.exports = {
	name: "guildCreate",
	async execute(guild) {
        registerGuild(guild);
	},
};