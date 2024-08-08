class ActionResult {
    constructor(damage = 0, target = null, deaths = [], weak = false, poison = 0, bleed = 0) {
        this.damage = damage; // int
        this.target = target; // Entity
        this.deaths = deaths; // boolean
        this.weak = weak; // boolean
        this.poison = poison; // int
        this.bleed = bleed; // int
    }
    // constructor() {
    //     this.damage = 0; // int
    //     this.target = null; // Entity
    //     this.death = false; // boolean
    //     this.weak = false; // boolean
    //     this.poison = 0; // int
    //     this.bleed = 0; // int
    // }
}

module.exports = ActionResult;