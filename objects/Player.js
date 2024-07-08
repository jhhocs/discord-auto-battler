// Player class for gameplay only
class Player extends Entity {
    constructor(stats) {
        super(stats, equippedItems);
    }
}

module.exports = Player;