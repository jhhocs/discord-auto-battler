const { Schema, model, models } = require('mongoose');


const playerSchema = new Schema({
    userId: {
        type: String,
        required: true,
    },
    guildId: {
        type: String,
        required: true,
    },
    inventory: {
        type: Object,
        required: true,
    },
    stats: {
        type: Object,
        required: true,
    },
    partyId: {
        type: String,
        required: true,
    }
});

const name = "players"
module.exports = models[name] || model(name, playerSchema);