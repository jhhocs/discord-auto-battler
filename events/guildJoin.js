// Add guild to database if it does not yet exist. Guilds in the database should be stored using "guild-schema.js"

module.exports = {
	name: "guildCreate",
	execute(guild) {
        console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
	},
};