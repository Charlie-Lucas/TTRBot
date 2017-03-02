var Clapp = require('../modules/clapp-discord');
var weather = require('../modules/weather/weather');

module.exports = new Clapp.Command({
    name: "weather",
    desc: "Météo d'une ville",
    fn: (argv, context) => {
        var value =  weather.getCityWeather(argv.args.ville);
        return(value)
        // This output will be redirected to your app's onReply function
    },
    args: [
        {
            name: 'ville',
            desc: 'Nom de la ville',
            type: 'string',
            required: true,
            default: 'La ville n\'est pas définie'
        }
    ],
});