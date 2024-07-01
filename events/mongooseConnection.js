const { Events } = require('discord.js');
const mongoose = require('mongoose');

require("dotenv").config();

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute() {
        mongoose.Promise = global.Promise;
        // Wait for database connection
		await mongoose.connect(process.env.MONGODB_URI)
		console.log(mongoose.connection.readyState);
	},
};