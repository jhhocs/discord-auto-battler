const { Schema, model, models } = require('mongoose');

const inventorySchema = new Schema({
    coins: {
        type: Number,
        required: true,
    },
    items: {
        type: Array,
        required: true,
    },
    equippedItems: {
        type: Array,
        required: true,
    },
    inventorySize: {
        type: Number,
        required: true,
    }
});

const name = "inventories"
module.exports = inventorySchema;