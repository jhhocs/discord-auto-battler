const { Schema, model, models } = require('mongoose');


const partySchema = new Schema({
    partyId: {
        type: String,
        required: true,
    },
    guildId: {
        type: String,
        required: true,
    },
    members: {
        type: Array,
        required: true,
        maxItems: 4,
    },
});

const name = "parties"
module.exports = models[name] || model(name, partySchema);