const Stats = require('./Stats');

class GameStats extends Stats {
    constructor(stats) {
        super(stats);
        this.currentHealth = stats.health;
        this.initiative = 0;
    }



    increaseInitiative() {
        this.initiative += this.speed;
        return this.initiative;
    }

    resetInitiative() {
        this.initiative -= 100;
    }

}

module.exports = GameStats;