var google = require('googleapis');
var Clapp = require('../modules/clapp-discord');
var calendar = require('../modules/calendar/calendar');

module.exports = new Clapp.Command({
    restrictions: [
        "237553916215164928",
        "285101105929519104"
    ],
    name: "cours",
    desc: "prochaine date de cours",
    fn: (argv, context) => {
        var value =  calendar.getEvents();
        return(value)
        // This output will be redirected to your app's onReply function
    }
});