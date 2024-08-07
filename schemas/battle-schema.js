const { Schema, model, models } = require('mongoose');

const BattleSchema = new Schema({
    _id: {
        type: String,
        required: true,
    },
    partyId1: {
        type: String,
        required: true,
    },
    partyId2: {
        type: String,
        required: true,
    },
    inBattle: {
        type: Boolean,
        required: true,
    },
    channel: {
        type: String,
        required: true,
    },

});
// Name of collection in database to add schema to
const name = "battles"
module.exports = models[name] || model(name, BattleSchema);