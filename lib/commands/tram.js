var Clapp = require('../modules/clapp-discord');
var tan = require('../modules/tan/tram');

module.exports = new Clapp.Command({
    restrictions: [
        "237553916215164928",
        "285101105929519104"
    ],
    name: "tram",
    desc: "prochain départ de la ligne 2",
    fn: (argv, context) => {
        var value =  tan.getNextTram();
        return(value)
    }
});