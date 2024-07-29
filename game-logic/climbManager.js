const { EmbedBuilder } = require("discord.js");
const { PartySchema, PlayerSchema } = require("../schemas/Schemas");
const { Entity, GameStats, Inventory, Player } = require("../objects/Objects");

class FloorManager {
    constructor(climbData, channel, players) {
        this.climbData = climbData;
        this.players = players.slice();
        this.enemies = [new Entity('Training Dummy I', new GameStats({ health: 25, attack: 10, speed: 7, luck: 0 })),
                        new Entity('Training Dummy II', new GameStats({ health: 25, attack: 10, speed: 8, luck: 0 })),
                        new Entity('Training Dummy III', new GameStats({ health: 25, attack: 10, speed: 9, luck: 0 })),
                        new Entity('Training Dummy IV', new GameStats({ health: 25, attack: 10, speed: 10, luck: 0 })),
                        new Entity('Training Dummy V', new GameStats({ health: 25, attack: 10, speed: 11, luck: 0 }))
                        ];
        this.liveEnemies = this.enemies.slice();
        this.livePlayers = this.players.slice();
        this.channel = channel;
        this.tickTime = Date.now() + (5 * 1000); // Can make certain runs run faster, will need a different run array for every unique tick time
        this.turnCounter = 0;

        this.attackQueue = [];
        this.sorted = false;
    }

    tick() {
        // TODO: Make sure highest initiative goes first
        if(this.livePlayers.length === 0) {
            this.displayEnd(false);
            return false;
        }
        else if(this.liveEnemies.length === 0) {
            this.displayEnd(true);
            return false;
        }

        this.turnCounter++;

        // Reset sorted if attackQueue is empty
        if(this.attackQueue.length === 0) {
            this.sorted = false;
        }

        while(this.attackQueue.length === 0) {
            for(let player of this.livePlayers) {
                let initiative = player.gameStats.increaseInitiative();
                // console.log(`${player.name} has ${initiative} initiative`);
                if(initiative >= 100) {
                    this.attackQueue.push(player);
                }
            }
            for(let enemy of this.liveEnemies) {
                let initiative = enemy.gameStats.increaseInitiative();
                // console.log(`${enemy.name} has ${initiative} initiative`);
                if(initiative >= 100) {
                    this.attackQueue.push(enemy);
                }
            }
        }

        // Sort attackQueue. initiative -> speed -> random
        if(!this.sorted) {
            this.attackQueue.sort((a, b) => {
                if(a.gameStats.initiative > b.gameStats.initiative) {
                    return -1;
                }
                else if(a.gameStats.initiative < b.gameStats.initiative) {
                    return 1;
                }
                else { // If initiative is the same, tiebreaker: speed
                    if(a.gameStats.speed > b.gameStats.speed) {
                        return -1;
                    }
                    else if(a.gameStats.speed < b.gameStats.speed) {
                        return 1;
                    }
                    else { // If speed is the same, tiebreaker: random
                        return Math.random() < 0.5 ? -1 : 1;
                    }
                }
            });
            this.sorted = true;
        }

        // Fix calculation of attack. 

        let attacker = this.attackQueue.shift();

        // Check if attacker is dead
        if(attacker.gameStats.health <= 0) {
            return true;
        }

        let target, result;
        if(attacker instanceof Player) {
            target = this.liveEnemies[Math.floor(Math.random() * (this.liveEnemies.length))];
            result = attacker.attack(target);
            if(result.deaths > 0) {
                const index = this.liveEnemies.indexOf(target);
                this.liveEnemies.splice(index, 1);
            }

        }
        else {
            target = this.livePlayers[Math.floor(Math.random() * (this.livePlayers.length))];
            result = attacker.attack(target);
            if(result.deaths > 0) {
                const index = this.livePlayers.indexOf(target);
                this.livePlayers.splice(index, 1);
            }
        }

        // console.log(`Turn ${this.turnCounter} | Live Players: ${this.livePlayers.length} | Live Enemies: ${this.liveEnemies.length}`);
        this.display(attacker, target, result);

        if(this.turnCounter == 50) {
            console.log(`Party ${this.climbData.partyId}'s run has been terminated (Max turns). Active runs: ${runs.length - 1}`);
            return false;
        }
        this.setTickTime(7);
        return true;
    }

    setTickTime(seconds) {
        this.tickTime = Date.now() + (seconds * 1000);
    }

    display(attacker, target, result) {
        let combatStats = "\`\`\`prolog\n";
        combatStats += `Floor ${this.climbData.currentFloor}\n`;
        combatStats += `Turn ${this.turnCounter}\n\n`;
        for(let player of this.players) {
            combatStats += `${player.name}\t${player.gameStats.health} health | ${player.gameStats.attack} attack | ${player.gameStats.initiative} initiative\n`;
        }
        combatStats += "\n";
        for(let enemy of this.enemies) {
            combatStats += `${enemy.name}\t${enemy.gameStats.health} health | ${enemy.gameStats.attack} attack | ${enemy.gameStats.initiative} initiative\n`;
        }
        combatStats += "\`\`\`";

        let combatReport = `${attacker.name} attacks ${target.name} for ${result.damage} damage.`;

        let embed = new EmbedBuilder()
            .setTitle(`${attacker.name} attacks`)
            .setColor(0x0099FF)
            .setDescription(`${combatReport}`);
        this.channel.send({content: combatStats, embeds: [embed]});
    }

    displayEnd(playerVictory) {
        console.log(`Party ${this.climbData.partyId}'s run has completed. Active runs: ${runs.length - 1}`);
        let users = "";
        for(let player of this.players) {
            users += `<@${player.userId}> `;
        }
        let embed = new EmbedBuilder()
            .setTitle(`Floor ${this.climbData.currentFloor}`)
            .setColor(0x0099FF)
            .setDescription(`${playerVictory ? "You have cleared this floor" : "You have been defeated"}`);
        this.channel.send({content: users, embeds: [embed]});
    }
}

let runs = [];
let running = false;

async function startFloor(climbData, channel) {

    /*
     * Get player data (stats, items)
     * Get floor data
     */
    let players = [];
    let partyData = await PartySchema.findOne({partyId: climbData.partyId});
    if(!partyData) {
        console.log("Party not found. (climbManager.js)");
        return;
    }
    let playerData = await PlayerSchema.findOne({userId: partyData.leader, guildId: partyData.guildId});
    let player = new Player(playerData.username, new GameStats(playerData.stats), new Inventory(playerData.inventory), playerData.userId);
    players.push(player);
    for(let i = 0; i < partyData.members.length; i++) {
        playerData = await PlayerSchema.findOne({userId: partyData.members[i], guildId: partyData.guildId});
        player = new Player(playerData.username, new GameStats(playerData.stats), new Inventory(playerData.inventory), playerData.userId);
        players.push(player);
    }

    let floor = new FloorManager(climbData, channel, players)
    runs.push(floor);
    channel.send(`Starting floor ${climbData.currentFloor}`);
    console.log(`Starting floor ${climbData.currentFloor}. Active runs: ${runs.length}`);
    console.log("Players: ");
    for(let i = 0; i < floor.players.length; i++) {
        console.log(floor.players[i].toString());
    }
    console.log("Enemies: ");
    for(let i = 0; i < floor.enemies.length; i++) {
        console.log(floor.enemies[i].toString());
    }
    if(running === false) {
        startRuns();
        running = true;
    }
}

async function startRuns() {
    // Check if there are any runs left
    if(runs.length === 0) {
        running = false;
        console.log("All runs have completed");
        return;
    }
    // Set timeout for next tick
    setTimeout(() => {
        if(runs[0].tick()) {
            runs.push(runs[0]);
        }
        runs.shift();
        startRuns();
    }, Math.max((runs[0].tickTime - Date.now()), 0));
}

module.exports = {startFloor};