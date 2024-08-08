const { Card } = require('../objects/Objects');

class Strike extends Card {
    constructor() {
        super({
            name: 'Attack',
            description: 'Attack an enemy',
            rarity: 'Common',
            type: 'attack',
        });
    }

    play(user, target) {
        let result = user.attack(target)
        return result;
    }

    // use(user, target) {
        
    // }
}

module.exports = Strike;