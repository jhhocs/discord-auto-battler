const Entity = require('./Entity.js');

// Player class for gameplay only
class Player extends Entity {
    constructor(name, gameStats, equippedItems, userId, partyId) {
        super(name, gameStats, equippedItems);
        this.userId = userId;
        this.partyId = partyId;

    }
}

module.exports = Player;