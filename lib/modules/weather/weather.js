require('es6-promise').polyfill();
require('isomorphic-fetch');
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
var fs = require('fs');
var translations = [];
var readline = require('readline');
var scope = "http://api.apixu.com/v1/forecast.json";
fs.readFile('lib/modules/weather/translations.json', function processClientSecrets(err, content) {
    if (err) {
        console.log('Error loading translations secret file: ' + err);
        return;
    }
    allTranslations = JSON.parse(content);

    var icons = {
        1000: ":sunny:",
        1003: ":partly_sunny:",
        1006: ":cloud:",
        1009: ":cloud:",
        1030: ":cloud:",
        1063: ":white_sun_white_cloud:",
        1066: ":cloud_snow:",
        1069: ":white_sun_white_cloud:",
        1072: ":cloud_rain:",
        1087: ":cloud_lightning:",
        1114: ":cloud_snow:",
        1117: ":cloud_snow:",
        1135: ":cloud:",
        1147: ":cloud:",
        1150: ":cloud_rain:",
        1153: ":cloud_rain:",
        1168: ":cloud_rain:",
        1171: ":cloud_rain:",
        1180: ":cloud_rain:",
        1183: ":cloud_rain:",
        1186: ":cloud_rain:",
        1189: ":cloud_rain:",
        1192: ":cloud_rain:",
        1195: ":cloud_rain:",
        1198: ":cloud_rain:",
        1201: ":cloud_rain:",
        1204: ":cloud_rain:",
        1207: ":cloud_rain:",
        1210: ":cloud_snow:",
        1213: ":cloud_snow:",
        1216: ":cloud_snow:",
        1219: ":cloud_snow:",
        1222: ":cloud_snow:",
        1225: ":cloud_snow:",
        1237: ":snowflakes:",
        1240: ":cloud_rain:",
        1243: ":cloud_rain:",
        1246: ":cloud_rain:",
        1249: ":cloud_rain:",
        1252: ":cloud_rain:",
        1255: ":cloud_rain:",
        1258: ":cloud_snow:",
        1261: ":snowflakes:",
        1264: ":snowflakes:",
        1273: ":thunder_cloud_rain:",
        1276: ":thunder_cloud_rain:",
        1279: ":thunder_cloud_rain:",
        1282: ":cloud_lightning:",
    }
    for (var i = 0; i < allTranslations.length; i++) {
        var fulltranslation = allTranslations[i];

        for (var j = 0; j < fulltranslation.languages.length; j++) {
            var trans = fulltranslation.languages[j];
            if(trans.lang_iso == "fr"){
                var transfr = {
                    "day_text": trans.day_text,
                    "night_text": trans.night_text,
                }
            }
        }
        translations[fulltranslation.code] = {
            "day": fulltranslation.day,
            "night": fulltranslation.night,
            "icon": icons[fulltranslation.code],
            "trans": transfr,
        }

    }
})
module.exports = {
    getCityWeather: function(city) {
        return new Promise(
            function (resolve, reject) {
                fs.readFile('apixu.json', function processClientSecrets(err, content) {
                    if (err) {
                        console.log('Error loading client secret file: ' + err);
                        return;
                    }
                    // Authorize a client with the loaded credentials, then call the
                    // Google Calendar API.
                    resolve({'token': JSON.parse(content).token, 'city' : city});
                })
            }
        ).then(function (params) {

            var params = {
                "key" : params.token,
                "q" : params.city,
                "days" : 5
            };
            myHeaders = new Headers({
                "Content-Type": "application/json",
                "Cache-Control" : "no-cache"
            });
            var myInit = { method: 'GET',
                headers: myHeaders,
                cache: false };
            var esc = encodeURIComponent;
            var query = Object.keys(params)
                .map(k => esc(k) + '=' + esc(params[k]))
                .join('&');
            return fetch(scope + '?' + query)
                .then(function (response) {
                    return response.json();
                })
                .then(function (JSON) {
                        if (JSON.hasOwnProperty('error'))
                        {
                            if(JSON.error === "404")
                            {
                                return "La ville n'a pas été trouvé";
                            }else {
                                return "La requète à l'api a retourné une erreur : " + JSON.error;
                            }
                        }
                        else {
                            var result = "Le temps pour la ville de " + JSON.location.name + '\n ';
                            for (var i = 0; i < JSON.forecast.forecastday.length; i++) {
                                var forecast = JSON.forecast.forecastday[i];
                                var date = new Date(forecast.date);
                                result = result + 'Le ' + dateFormat(date, "dddd dd mmmm") +' : ' + translations[forecast.day.condition.code].icon + " " +translations[forecast.day.condition.code].trans.day_text + ', temp.min. : ' + forecast.day.mintemp_c + '°C ' + ', temp.max. : ' + forecast.day.maxtemp_c + '°C\n';

                            }
                            return result;
                        }
                    }
                );
        });
    }
}