const { Schema, model, models } = require('mongoose');

const GuildSchema = new Schema({
    _id: {
        type: String,
        required: true,
    },
    shop: {
        type: Array,
        required: true,
    },
    players: {
        type: Array,
        required: true,
    },
    parties: {
        type: Array,
        required: true,
    }
});
// Name of collection in database to add schema to
const name = "guilds"
module.exports = models[name] || model(name, GuildSchema);