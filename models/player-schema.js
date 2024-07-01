const { Schema, model, models } = require('mongoose');

const playerSchema = new Schema({
    _id: {
        type: String,
        required: true,
    },
    inventoryId: {
        type: String,
        required: true,
    },
    stats: {
        type: Object,
        required: true,
    },
});

const name = "players"
module.exports = models[name] || model(name, playerSchema);