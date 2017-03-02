var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var dateFormat = require('dateformat');
dateFormat.i18n = {
    dayNames: [
        'Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam',
        'Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'
    ],
    monthNames: [
        'Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec',
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ]
};

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/calendar-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'calendar-nodejs-quickstart.json';

// Load client secrets from a local file.
fs.readFile('googleapi.json', function processClientSecrets(err, content) {
    if (err) {
        console.log('Error loading client secret file: ' + err);
        return;
    }
    // Authorize a client with the loaded credentials, then call the
    // Google Calendar API.
    authorize(JSON.parse(content), listEvents);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];
    var auth = new googleAuth();
    var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, function(err, token) {
        if (err) {
            getNewToken(oauth2Client, callback);
        } else {
            oauth2Client.credentials = JSON.parse(token);
            callback(oauth2Client);
    }
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
    var authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });
    console.log('Authorize this app by visiting this url: ', authUrl);
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('Enter the code from that page here: ', function(code) {
        rl.close();
        oauth2Client.getToken(code, function(err, token) {
            if (err) {
                console.log('Error while trying to retrieve access token', err);
                return;
            }
            oauth2Client.credentials = token;
            storeToken(token);
            callback(oauth2Client);
        });
    });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
    try {
        fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
        if (err.code != 'EEXIST') {
            throw err;
        }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token));
    console.log('Token stored to ' + TOKEN_PATH);
}

/**
 * Lists the next 10 events on the user's primary calendar.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listEvents(auth) {

}
module.exports = {
    getEvents : function() {
        return new Promise(
            function (resolve, reject) {
                fs.readFile('googleapi.json', function processClientSecrets(err, content) {
                    if (err) {
                        console.log('Error loading client secret file: ' + err);
                        return;
                    }
                    // Authorize a client with the loaded credentials, then call the
                    // Google Calendar API.
                    authorize(JSON.parse(content), resolve);
                })
            }).then(function(auth){
            return new Promise(
                function (resolve, reject) {
                    var calendar = google.calendar('v3');
                    var d = new Date();
                    d.setDate(d.getDate() + (1 + 7 - d.getDay()) % 7);
                    console.log(d.toISOString())
                    calendar.events.list({
                        auth: auth,
                        calendarId: 'hojthn7vqubtskt7lpaap2pb84@group.calendar.google.com',

                        timeMin: (new Date()).toISOString(),
                        maxResults: 10,
                        singleEvents: true,
                        orderBy: 'startTime'
                    }, function (err, response) {
                        if (err) {
                            resolve ('The API returned an error: ' + err);
                        }
                        var events = response.items;
                        if (events.length == 0) {
                            resolve ('Pas de semaine de cours trouvée');
                        } else {
                       //     var options = {weekday: "long", year: false, month: "long", day: "numeric", timeZone: "UTC"};
                            var start = new Date(events[0].start.date);
                            var end = new Date(start.getFullYear(),start.getMonth(),start.getDate()+(7-start.getDay()))
                            var result = 'Planning de la prochaine semaine :\n ```';

                            for (var i = 0; i < events.length; i++) {
                                var event = events[i];
                                if( new Date(event.start.date) < end )
                                {;
                                    var eventStart = new Date(event.start.date);
                                    var eventEnd = new Date(event.end.date);
                                    eventEnd.setDate(eventEnd.getDate() - 1);
                                    result = result + 'Du ' + dateFormat(eventStart, "dddd dd mmmm") +' au ' + dateFormat(eventEnd, "dddd dd mmmm") + ' : ' + event.summary + '\n';
                                }

                            }
                            result = result + '```';
                            resolve(result);
                        }
                    });
                }
            ).then(function(val){
                return val;
            })
        })
    }
}
