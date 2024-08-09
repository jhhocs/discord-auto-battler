const { EmbedBuilder } = require("discord.js");
const { PartySchema, PlayerSchema } = require("../schemas/Schemas");
const { Entity, GameStats, Inventory, Player } = require("../objects/Objects");
const CardManager = require("./cardManager");

const cardManager = new CardManager();

class BattleManager {
    constructor(battleData, channel, party1, party2) {
        this.battleData = battleData; // Battle-schema object
        this.party1 = party1.slice(); // Array of Player objects
        this.party2 = party2.slice(); // Array of Player objects
        this.live1 = this.party1.slice(); // Array of Player objects
        this.live2 = this.party2.slice(); // Array of Player objects
        // this.liveEnemies = this.enemies.slice();
        // this.livePlayers = this.players.slice();
        this.channel = channel;
        this.tickTime = Date.now() + (5 * 1000); // Can make certain runs run faster, will need a different run array for every unique tick time
        this.turnCounter = 0;

        this.attackQueue = [];
        this.sorted = false;

        // For aligning player names in display
        this.characterNameSpacing = 10;
        for(let player of this.party1) {
            let nameLength = player.name.length;
            if(nameLength > this.characterNameSpacing) {
                this.characterNameSpacing = nameLength;
            }
        }
        for(let player of this.party2) {
            let nameLength = player.name.length;
            if(nameLength > this.characterNameSpacing) {
                this.characterNameSpacing = nameLength;
            }
        }
    }

    tick() {
        if(this.live1.length === 0) { // party1 loses
            this.displayEnd(false);
            return false;
        }
        else if(this.live2.length === 0) { // party1 wins
            this.displayEnd(true);
            return false;
        }

        this.turnCounter++;

        // Reset sorted if attackQueue is empty
        if(this.attackQueue.length === 0) {
            this.sorted = false;
        }

        // Increase initiative until someone has reached at least 100. (Ready to attack)
        while(this.attackQueue.length === 0) {
            for(let player of this.party1) {
                let initiative = player.gameStats.increaseInitiative();
                if(initiative >= 100) {
                    this.attackQueue.push(player);
                }
            }
            for(let player of this.party2) {
                let initiative = player.gameStats.increaseInitiative();
                if(initiative >= 100) {
                    this.attackQueue.push(player);
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

        let attacker = this.attackQueue.shift();

        // Check if attacker is dead
        if(attacker.gameStats.currentHealth <= 0) {
            return true;
        }

        let result;
        if(attacker.partyId === this.party1[0].partyId) {
            let target = this.live2[Math.floor(Math.random() * (this.live2.length))];
            // result = attacker.attack(target);
            
            result = cardManager.play(attacker, target);
            // console.log(result);
            if(result.deaths.length > 0) {
                const index = this.live2.indexOf(target);
                this.live2.splice(index, 1);
            }
        }
        else {
            let target = this.live1[Math.floor(Math.random() * (this.live1.length))];
            // result = attacker.attack(target);
            result = cardManager.play(attacker, target);
            // console.log(result);
            if(result.deaths.length > 0) {
                const index = this.live1.indexOf(target);
                this.live1.splice(index, 1);
            }
        }
        // if(attacker instanceof Player) {
        //     // target = this.liveEnemies[Math.floor(Math.random() * (this.liveEnemies.length))];
        //     result = attacker.attack(this.liveEnemies);
        //     // if(result.deaths > 0) {
        //     //     const index = this.liveEnemies.indexOf(target);
        //     //     this.liveEnemies.splice(index, 1);
        //     // }

        // }
        // else {
        //     // target = this.livePlayers[Math.floor(Math.random() * (this.livePlayers.length))];
        //     result = attacker.attack(this.livePlayers);
        //     // if(result.deaths > 0) {
        //     //     const index = this.livePlayers.indexOf(target);
        //     //     this.livePlayers.splice(index, 1);
        //     // }
        // }

        // console.log(`Turn ${this.turnCounter} | Live Players: ${this.livePlayers.length} | Live Enemies: ${this.liveEnemies.length}`);
        this.display(attacker, result);

        if(this.turnCounter == 50) {
            console.log(`Party ${this.battleData.partyId1} & ${this.battleData.partyId2}'s battle has been terminated (Max turns). Active battles: ${runs.length - 1}`);
            this.displayTimeout();
            return false;
        }
        this.setTickTime(7);
        return true;
    }

    setTickTime(seconds) {
        this.tickTime = Date.now() + (seconds * 1000);
    }

    display(attacker, result) {

        let combatStats = "\`\`\`prolog\n";
        // combatStats += `Floor ${this.battleData.currentFloor}\n`;
        combatStats += `Turn ${this.turnCounter}\n\n`;
        combatStats += `Characters${" ".repeat(this.characterNameSpacing - 8)}HP        ATK      SPD      INIT\n`;
        for(let player of this.party1) {
            combatStats += this.displayEntityStats(player);
            // combatStats += `${player.name}${" ".repeat(this.characterNameSpacing - player.name.length)}${player.gameStats.health} HP | ${player.gameStats.attack}-${player.gameStats.attack + 9} ATK | ${player.gameStats.speed} SPD | ${player.gameStats.initiative} INIT\n`;
        }
        combatStats += "\n";
        for(let player of this.party2) {
            combatStats += this.displayEntityStats(player);
            // combatStats += `${enemy.name}\t${enemy.gameStats.health} HP | ${enemy.gameStats.attack}-${enemy.gameStats.attack + 9} ATK | ${enemy.gameStats.speed} SPD | ${enemy.gameStats.initiative} INIT\n`;
        }
        combatStats += "\`\`\`";

        // let combatReport = `${attacker.name} attacks ${result.target.name} for ${result.damage} damage.\n`;
        for(let entity of result.deaths) {
            result.combatReport += `${entity.name} has died.\n`;
            // combatReport += `${entity.name} has died.`;
        }

        let embed = new EmbedBuilder()
            .setTitle(`${attacker.name} attacks`)
            .setColor(0x0099FF)
            .setDescription(`${result.combatReport}`);
        this.channel.send({content: combatStats, embeds: [embed]});
        result.combatReport = "";
    }

    displayEntityStats(entity) {
        // console.log(`${entity.name}` + " " + (Math.max((Math.log(entity.gameStats.currentHealth) * Math.LOG10E + 1 | 0), 1)));
        return `${entity.name}${" ".repeat(this.characterNameSpacing - entity.name.length + 2)}` +
        `${entity.gameStats.currentHealth}/${entity.gameStats.health}${" ".repeat(9 - (Math.max((Math.log(entity.gameStats.currentHealth) * Math.LOG10E + 1 | 0), 1)) - (Math.log(entity.gameStats.health) * Math.LOG10E + 1 | 0))}` +
        `${entity.gameStats.attack}-${entity.gameStats.attack + 9}${" ".repeat(8 - (Math.max((Math.log(entity.gameStats.attack) * Math.LOG10E + 1 | 0), 1)) - (Math.log(entity.gameStats.attack + 9) * Math.LOG10E + 1 | 0))}` +
        `${entity.gameStats.speed}${" ".repeat(9 - (Math.log(entity.gameStats.speed) * Math.LOG10E + 1 | 0))}` +
        `${entity.gameStats.initiative}\n`;
    }

    displayEnd(playerVictory) {
        console.log(`Party ${this.battleData.partyId}'s run has completed. Active runs: ${battles.length - 1}`);
        let party1Names = "";
        let party2Names = "";
        for(let player of this.party1) {
            party1Names += `<@${player.userId}> `;
        }
        for(let player of this.party2) {
            party2Names += `<@${player.userId}> `;
        }
        let embed = new EmbedBuilder()
            .setTitle(`Battle Complete!`)
            .setColor(0x0099FF)
            .setDescription(`${playerVictory ? "Congratulations " + party1Names : "Congratulations " + party2Names}`);
        this.channel.send({content: party1Names + " " + party2Names, embeds: [embed]});
    }

    displayTimeout() {
        let party1Names = "";
        let party2Names = "";
        for(let player of this.party1) {
            party1Names += `<@${player.userId}> `;
        }
        for(let player of this.party2) {
            party2Names += `<@${player.userId}> `;
        }
        let embed = new EmbedBuilder()
            .setTitle(`Battle Complete!`)
            .setColor(0x0099FF)
            .setDescription(`Draw :|`);
        this.channel.send({content: party1Names + " " + party2Names, embeds: [embed]});
    }
}

let battles = [];
let running = false;

async function startBattle(battleData, channel, party1Data, party2Data) {

    /*
     * Get player data (stats, items)
     * Get floor data
     */
    let party1 = [];
    let party2 = [];
    // let enemies = [new Entity('Training Dummy I', new GameStats({ health: 25, attack: 4, speed: 7, luck: 0 })),
    //             new Entity('Training Dummy II', new GameStats({ health: 25, attack: 3, speed: 8, luck: 0 })),
    //             new Entity('Training Dummy III', new GameStats({ health: 25, attack: 2, speed: 9, luck: 0 })),
    //             new Entity('Training Dummy IV', new GameStats({ health: 25, attack: 1, speed: 10, luck: 0 })),
    //             new Entity('Training Dummy V', new GameStats({ health: 25, attack: 0, speed: 11, luck: 0 }))
    //             ];

    let fetched = await fetchPartyData(party1Data, party1);
    if(!fetched) {
        return;
    }
    fetched = await fetchPartyData(party2Data, party2);
    if(!fetched) {
        return;
    }
    // let partyData = await PartySchema.findOne({partyId: battleData.partyId});
    // if(!partyData) {
    //     console.log("Party not found. (climbManager.js)");
    //     return;
    // }
    // let playerData = await PlayerSchema.findOne({userId: partyData.leader, guildId: partyData.guildId});
    // let player = new Player(playerData.username, new GameStats(playerData.stats), new Inventory(playerData.inventory), playerData.userId);
    // players.push(player);
    // for(let i = 0; i < partyData.members.length; i++) {
    //     playerData = await PlayerSchema.findOne({userId: partyData.members[i], guildId: partyData.guildId});
    //     player = new Player(playerData.username, new GameStats(playerData.stats), new Inventory(playerData.inventory), playerData.userId);
    //     players.push(player);
    // }

    let battle = new BattleManager(battleData, channel, party1, party2)
    battles.push(battle);
    // channel.send(`Starting floor ${climbData.currentFloor}`);
    console.log(`Starting battle for parties ${party1Data.partyId} & ${party2Data.partyId}. Active battles: ${battles.length}`);
    console.log("Party 1: ");
    for(let i = 0; i < battle.party1.length; i++) {
        console.log(battle.party1[i].toString());
    }
    console.log("Party 2: ");
    for(let i = 0; i < battle.party2.length; i++) {
        console.log(battle.party2[i].toString());
    }
    if(running === false) {
        startBattles();
        running = true;
    }
}

async function fetchPartyData(partyData, party) {
    try {
        // const partyData = await PartySchema.findOne({partyId: partyId});
        let playerData = await PlayerSchema.findOne({userId: partyData.leader, guildId: partyData.guildId});
        let player = new Player(playerData.username, new GameStats(playerData.stats), new Inventory(playerData.inventory).equippedCards, playerData.userId, partyData.partyId);
        party.push(player);
        for(let i = 0; i < partyData.members.legth; i++) {
            let playerData = await PlayerSchema.findOne({userId: partyData.members[i], guildId: partyData.guildId});
            let player = new Player(playerData.username, new GameStats(playerData.stats), new Inventory(playerData.inventory).equippedCards, playerData.userId, partyData.partyId);
            party.push(player);
        }
    }
    catch(err) {
        console.log(`An error occurred while fetching party/player data for party ${partyId} (battleManager.js)`);
        return false;
    }
    return true;
}

async function startBattles() {
    // Check if there are any runs left
    if(battles.length === 0) {
        running = false;
        console.log("All runs have completed");
        return;
    }
    // Set timeout for next tick
    setTimeout(async () => {
        if(battles[0].tick()) {
            battles.push(battles[0]);
        }
        else {
            battles[0].battleData.inBattle = false;
            await battles[0].battleData.save().catch(err => {
                console.log(`An error occurred while saving battle data for partys ${battles[0].battleData.partyId1} & ${battles[0].battleData.partyId2} (climbManager.js)`);
            });
        }
        battles.shift();
        startBattles();
    }, Math.max((battles[0].tickTime - Date.now()), 0));
}

module.exports = {startBattle};