const { Schema, model, models } = require('mongoose');

const CardSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    rarity: {
        type: String,
        required: true,
    },
});