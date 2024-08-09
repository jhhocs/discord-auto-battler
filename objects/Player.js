const Entity = require('./Entity.js');

// Player class for gameplay only
class Player extends Entity {
    constructor(name, gameStats, equippedCards, userId, partyId) {
        super(name, gameStats, equippedCards);
        this.userId = userId;
        this.partyId = partyId;

    }
}

module.exports = Player;