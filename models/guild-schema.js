const { Schema, model, models } = require('mongoose');

const guildSchema = new Schema({
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

const name = "guilds"
module.exports = models[name] || model(name, guildSchema);