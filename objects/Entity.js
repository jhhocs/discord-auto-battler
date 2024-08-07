class Entity {
    constructor(name, gameStats, equippedItems) {
        this.name = name;
        this.gameStats = gameStats;
        this.equippedItems = equippedItems
    }

    // targets is an array of entities
    attack(targets) {
        this.gameStats.resetInitiative();
        let damage = Math.floor(Math.random() * 10) + this.gameStats.attack;
        let deaths = [];
        let target = targets[Math.floor(Math.random() * targets.length)];
        target.gameStats.currentHealth -= damage;
        if(target.gameStats.currentHealth <= 0) {
            target.gameStats.initiative = 0;
            target.gameStats.currentHealth = 0;
            deaths.push(target);
            targets.splice(targets.indexOf(target), 1);
        }
        return { damage: damage, target: target, deaths: deaths };
    }

    toString() {
        return `${this.name}: ${this.gameStats.health} health, ${this.gameStats.attack} attack, ${this.gameStats.speed} speed, and ${this.gameStats.luck} luck.`;
    }
}

module.exports = Entity;