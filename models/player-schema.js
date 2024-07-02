const { Schema, model, models } = require('mongoose');

const { Inventory, Stats } = require('../objects/Objects');

const playerSchema = new Schema({
    _id: {
        type: String,
        required: true,
    },
    inventory: {
        type: Inventory,
        required: true,
    },
    stats: {
        type: Stats,
        required: true,
    },
});

const name = "players"
module.exports = models[name] || model(name, playerSchema);