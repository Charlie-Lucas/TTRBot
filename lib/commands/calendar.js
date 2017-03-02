var google = require('googleapis');
var Clapp = require('../modules/clapp-discord');
var calendar = require('../modules/calendar/calendar');

module.exports = new Clapp.Command({
    name: "cours",
    desc: "prochaine date de cours",
    fn: (argv, context) => {
        var value =  calendar.getEvents();
        return(value)
        // This output will be redirected to your app's onReply function
    }
});