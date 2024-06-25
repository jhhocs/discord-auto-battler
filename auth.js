require("dotenv").config({path: '.env'});

module.exports = {
	clientId: process.env.DEV_CLIENT_ID,
	guildId: process.env.DEV_GUILD_ID,
	token: process.env.DEV_TOKEN
};