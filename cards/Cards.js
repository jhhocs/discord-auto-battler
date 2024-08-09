module.exports = {
    Strike: require('./Strike'),
}


/*
Create map with card names as keys, and an instance of the card class as the value
battleManager will ask Entity for the next card, stored as a String
That string will be used to get the card from the map
All cards will have a playCard method that will be called by the battleManager

Additional things to fix:
- Add check for players in the same party / themself from battling themselves
*/