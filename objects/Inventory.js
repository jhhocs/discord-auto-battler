class Inventory {
    constructor() {
        this.coins = 0;
        this.items = [];
        this.equiptedItems = [];
        this.inventorySize = 50;
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

}

module.exports = Inventory;