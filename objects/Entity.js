class Entity {
    constructor(stats, equippedItems) {
        this.name = stats.name;
        this.health = stats.health;
        this.attack = stats.attack;
        this.equippedItems = equippedItems
    }

    attack(target) {
        target.health -= this.attack;
    }
}

module.exports = Entity;