class Entity {
    constructor(name, gameStats, equippedItems) {
        this.name = name;
        this.gameStats = gameStats;
        // this.equippedItems = equippedItems
    }

    attack(target) {
        this.gameStats.resetInitiative();
        let damage = Math.floor(Math.random() * 10) + this.gameStats.attack;
        let deaths = 0;
        target.gameStats.health -= damage;
        if(target.gameStats.health <= 0) {
            target.gameStats.initiative = 0;
            target.gameStats.health = 0;
            deaths++;
        }
        return { damage: damage, deaths: deaths };
    }

    toString() {
        return `${this.name}: ${this.gameStats.health} health, ${this.gameStats.attack} attack, ${this.gameStats.speed} speed, and ${this.gameStats.luck} luck.`;
    }
}

module.exports = Entity;