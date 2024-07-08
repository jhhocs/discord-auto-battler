const { EmbedBuilder } = require("discord.js");

// Can add more stats later if needed
const defaultStats = {
    health: 100,
    attack: 10,
    speed: 10,
    luck: 0,
}

class Stats {

    constructor(stats) {
        this.health = stats.health;
        this.attack = stats.attack;
        this.speed = stats.speed;
        this.luck = stats.luck;
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
        const embed = new EmbedBuilder()
            .setTitle("Stats")
            .setColor(0x0099FF)
            .setDescription(stats);
        return embed;
    }
}

module.exports = Stats;