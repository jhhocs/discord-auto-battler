const { Card } = require('../objects/Objects');

class Neutralize extends Card {
    constructor() {
        super({
            name: 'Neutralize',
            description: 'Neutralize an enemy',
            rarity: 'Common',
            type: 'attack',
        });
    }

    play(attacker, target) {
        let result = attacker.attack(target, 0.5);
        target.applyWeak(1);
        result.combatReport += `${attacker.name} weakens ${target.name}\n`;
        result.combatReport += `${attacker.name} attacks ${target.name} for ${result.damage} damage.\n`;
        return result;
    }
}

module.exports = new Neutralize();