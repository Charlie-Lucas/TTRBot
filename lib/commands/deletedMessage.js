var google = require('googleapis');
var Clapp = require('../modules/clapp-discord');
var calendar = require('../modules/calendar/calendar');
var manager = require('../modules/mongo/manager')

module.exports = new Clapp.Command({
    restrictions: [
        "285101105929519104"
    ],
    name: "msgs",
    desc: "Messages supprimés",
    fn: (argv, context) => {
        return manager.getLastMessages(argv.args.msgs);
        // This output will be redirected to your app's onReply function
    },
    args: [
        {
            name: 'msgs',
            desc: 'Nombre à récupérer',
            type: 'number',
            required: false,
            default: 10
        }
    ],
});