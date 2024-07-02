const { Schema, model, models } = require('mongoose');


const playerSchema = new Schema({
    _id: {
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
});

const name = "players"
module.exports = models[name] || model(name, playerSchema);