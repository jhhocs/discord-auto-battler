const Stats = require('./Stats');

class GameStats extends Stats {
    constructor(stats) {
        super(stats);
        this.currentHealth = stats.health;
        this.initiative = 0;
        this.weak = 0;
        this.currentAttack = stats.attack;
        this.poison = 0;
        this.bleed = 0;
    }

    increaseInitiative() {
        this.initiative += this.speed;
        return this.initiative;
    }

    resetInitiative(refundedInitiative = 0) {
        this.initiative -= 100 - refundedInitiative;
    }

    toString() {
        return `Current Health: ${this.currentHealth}\nCurrent Attack: ${this.currentAttack}\nCurrent Initiative: ${this.initiative}\nWeak: ${this.weak}\nPoison: ${this.poison}\nBleed: ${this.bleed}`;
    }

}

module.exports = GameStats;