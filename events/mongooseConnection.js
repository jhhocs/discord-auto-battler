const { Events } = require('discord.js');
const mongoose = require('mongoose');

require("dotenv").config();

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute() {
        mongoose.Promise = global.Promise;
        
        // Wait for database connection
		await mongoose.connect(process.env.MONGODB_URI);

        // Log database connection state
        switch (mongoose.connection.readyState) {
            case 0:
                console.log("Disconnected from database");
                break;
            case 1:
                console.log("Connected to database");
                break;
            case 2:
                console.log("Connecting to database");
                break;
            case 3:
                console.log("Disconnecting from database");
                break;
            default:
                console.log("Unknown database state");
                break;
        }
	},
};