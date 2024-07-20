const { Schema, model, models } = require('mongoose');

const InventorySchema = new Schema({
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
module.exports = models[name] || model(name, InventorySchema);;