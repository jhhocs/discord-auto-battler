const ActionResult = require('./ActionResult');

class Entity {
    constructor(name, gameStats, equippedItems) {
        this.name = name;
        this.gameStats = gameStats;
        this.equippedItems = equippedItems
    }

    // targets is an array of entities
    // static attack(targets) {
    //     this.gameStats.resetInitiative();
    //     let damage = Math.floor(Math.random() * 10) + this.gameStats.attack;
    //     let deaths = [];
    //     let target = targets[Math.floor(Math.random() * targets.length)];
    //     target.gameStats.currentHealth -= damage;
    //     if(target.gameStats.currentHealth <= 0) {
    //         target.gameStats.initiative = 0;
    //         target.gameStats.currentHealth = 0;
    //         deaths.push(target);
    //         targets.splice(targets.indexOf(target), 1);
    //     }
    //     return { damage: damage, target: target, deaths: deaths };
    // }

    attack(target, multiplier = 1, refundedInitiative = 0) {
        this.gameStats.resetInitiative(refundedInitiative);
        let result = new ActionResult(0, null, [], false, 0, 0);
        result.target = target;
        let damage = Math.floor(Math.random() * 10) + this.gameStats.attack;
        result.damage = damage;
        // let deaths = [];

        if(this.gameStats.weak > 0) {
            damage = Math.floor(damage * 0.65);
            this.gameStats.weak -= 1;
            result.weak = true;
        }

        target.gameStats.currentHealth -= damage * multiplier;
        // let death = this.checkDeath()
        if(target.checkDeath()) {
            result.deaths.push(target);
        }
        // result.death = this.checkDeath();
        // this.checkDeath() ? deaths.push(this) : null;
        // if(target.gameStats.currentHealth <= 0) {
        //     target.gameStats.initiative = 0;
        //     target.gameStats.currentHealth = 0;
        //     deaths.push(target);
        // }
        // return new ActionResult(damage, target, death);
        return result;
    }

    applyWeak(stacks = 1) { // Number of turns to apply weak, 1 is default if not specified
        this.gameStats.weak += stacks;
    }

    applyPoison(stacks = 1) {
        this.gameStats.poison += stacks;
    }

    applyBleed(stacks = 1) {
        this.gameStats.bleed += stacks;
    }

    procPoison() {
        let damage = this.gameStats.poison--;
        let death = false;
        this.gameStats.currentHealth -= damage;
        death = this.checkDeath()
        return new ActionResult(damage, this, death);

    }

    checkDeath() {
        if(this.gameStats.currentHealth <= 0) {
            this.gameStats.initiative = 0;
            this.gameStats.currentHealth = 0;
            return true;
        }
        return false;
    }

    toString() {
        return `${this.name}: ${this.gameStats.health} health, ${this.gameStats.attack} attack, ${this.gameStats.speed} speed, and ${this.gameStats.luck} luck.`;
    }
}





module.exports = Entity;