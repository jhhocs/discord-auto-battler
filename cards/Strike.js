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

    play(attacker, target) {
        let result = attacker.attack(target);
        result.combatReport += `${attacker.name} attacks ${target.name} for ${result.damage} damage.\n`;
        return result;
    }
}

module.exports = new Strike();