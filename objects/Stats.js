// Can add more stats later if needed
const defaultStats = {
    health: 100,
    attack: 10,
    speed: 10,
    luck: 0,
}

class Stats {

    constructor(object) {
        this.health = object.health;
        this.attack = object.attack;
        this.speed = object.speed;
        this.luck = object.luck;
    }

    static defaultStats() {
        return defaultStats;
    }

    display() {
        let stats = "";
        stats += `Health: ${this.health}\n`;
        stats += `Attack: ${this.attack}\n`;
        stats += `Speed: ${this.speed}\n`;
        stats += `Luck: ${this.luck}\n`;
        return stats
    }
}

module.exports = Stats;