const { Events } = require('discord.js');
const mongoose = require('mongoose');

require("dotenv").config();

module.exports = {
	name: Events.ClientReady,
	once: true,
    ready: false,
	async execute() {
        mongoose.Promise = global.Promise;
        
        // Wait for database connection
        try {
            await mongoose.connect(process.env.MONGODB_URI);
        }
        catch (error) {
            console.error("An error occurred while connecting to the database: ");
            console.error(error);
        }
        finally {
        // Log database connection state
            switch (mongoose.connection.readyState) {
                case 0:
                    console.log("Disconnected from database");
                    break;
                case 1:
                    console.log("Connected to database");
                    this.ready = true;
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
        }
	},
};