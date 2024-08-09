const defaultInventory = {
    coins: 0,
    items: [],
    equippedItems: [],
    inventorySize: 50,
    cards: [],
    equippedCards: ["Strike", "Strike", "Strike", "Strike", "Neutralize"]
}

class Inventory {

    constructor(inventory) {
        this.coins = inventory.coins;
        this.items = inventory.items;
        this.equippedItems = inventory.equippedItems;
        this.inventorySize = inventory.inventorySize;
        this.cards = inventory.cards;
        this.equippedCards = inventory.equippedCards;
    }

    static defaultInventory() {
        return defaultInventory;
    }

    // Coins
    addCoins(amount) {
        this.coins += amount;
    }

    setCoins(amount) {
        this.coins = amount;
    }

    removeCoins(amount) {
        this.coins -= amount;
    }

    // Items
    equipItems(item) {
        this.equiptedItems.push(item);
        this.items = this.items.filter(i => i !== item);
    }

    unequipItems(item) {
        this.items.push(item);
        this.equiptedItems = this.equiptedItems.filter(i => i !== item);
    }

    // Display Inventory
    display() {
        let inventory = "";
        inventory += `Coins: ${this.coins}\n`;
        inventory += `Equipped Items: ${this.equippedItems}\n`;
        inventory += `Items: ${this.items}\n`;
        return inventory;
    }

}

module.exports = Inventory;