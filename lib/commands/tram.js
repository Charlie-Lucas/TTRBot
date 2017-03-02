var Clapp = require('../modules/clapp-discord');
var tan = require('../modules/tan/tram');

module.exports = new Clapp.Command({
    name: "tram",
    desc: "prochain départ de la ligne 2",
    fn: (argv, context) => {
        var value =  tan.getNextTram();
        return(value)
    }
});