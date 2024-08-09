class CardManager {
    constructor() {
        this.cards = new Map();
        this.cards.set("Strike", require('../cards/Strike'));
        this.cards.set("Neutralize", require('../cards/Neutralize'));
    }

    play(attacker, target) {
        const card = this.cards.get(attacker.drawCard());
        if (card && typeof card.play === 'function') {
            return card.play(attacker, target);
        } else {
            console.log(`Card "${cardName}" not found or does not have a "play" method.`);
        }
        return false;
    }
}

module.exports = CardManager;