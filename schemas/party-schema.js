const { Schema, model, models } = require('mongoose');


const PartySchema = new Schema({
    partyId: {
        type: String,
        required: true,
    },
    guildId: {
        type: String,
        required: true,
    },
    climbId: {
        type: String,
        required: false,
    },
    battleId: {
        type: String,
        required: false,
    },
    leader: {
        type: String,
        required: true,
    },
    members: {
        type: Array,
        required: true,
        maxItems: 3,
    },
    temp: {
        type: Boolean,
        required: false,
    }
});

const name = "parties"
module.exports = models[name] || model(name, PartySchema);