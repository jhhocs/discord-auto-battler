module.exports = {
	name: "guildDelete",
	execute(guild) {
        console.log(`Left guild: ${guild.name} (id: ${guild.id}). This guild had ${guild.memberCount} members!`);
	},
};