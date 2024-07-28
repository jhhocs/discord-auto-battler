const Entity = require('./Entity.js');

// Player class for gameplay only
class Player extends Entity {
    constructor(name, gameStats, equippedItems, userId) {
        super(name, gameStats, equippedItems);
        this.userId = userId;

    }
}

module.exports = Player;