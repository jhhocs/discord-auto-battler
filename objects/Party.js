class Party {
    constructor(members) {
        this.members = members; // Array of Player IDs (Max party size of 4)
    }

    isFull() {
        return this.members.length === 4;
    }
}

module.exports = Party;