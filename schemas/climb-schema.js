const { Schema, model, models } = require('mongoose');

const ClimbSchema = new Schema({
    _id: {
        type: String,
        required: true,
    },
    partyId: {
        type: String,
        required: true,
    },
    currentFloor: {
        type: Number,
        required: true,
    },
    channel: {
        type: String,
        required: true,
    },

});
// Name of collection in database to add schema to
const name = "climbs"
module.exports = models[name] || model(name, ClimbSchema);