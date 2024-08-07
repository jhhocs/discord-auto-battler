// Add guild to database if it does not yet exist. Guilds in the database should be stored using "guild-schema.js"
const { GuildSchema } = require("../schemas/Schemas");
const mongooseConnection = require("../events/mongooseConnection");

// class Setup{
//     constructor() {
        
//     }
async function registerGuild(guild) {
    if(mongooseConnection.ready === false) {
        console.log("No connection to database. Guild will not be added to database.");
            return;
    }

    let guildData = await GuildSchema.findOne({_id: guild.id});
    // If guild does not exist in database, add it
    if(!guildData) {
        guildData = new GuildSchema({
            _id: guild.id,
            shop: [],
            players: [],
            parties: [],
        });
        await guildData.save().catch(err => {
            console.log("An error occurred while adding guild to the database.")
            console.error(err);
            return 0;
        });
        console.log(`Added guild to database: ${guild.name} (id: ${guild.id})`);
        return 1;
    }
    else {
        console.log(`Guild already exists in database: ${guild.name} (id: ${guild.id})`);
        return 2
    }
}
// }


module.exports = { registerGuild };