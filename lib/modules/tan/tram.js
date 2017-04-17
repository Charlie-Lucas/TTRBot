var scope = "http://open.tan.fr/ewp/horairesarret.json/LCAR/2/2";
module.exports = {
    getNextTram: function() {
        return fetch(scope)
            .then(function (response) {
                return response.json();
            })
            .then(function (JSON) {
                var result = "Le(s) prochain(s) tram(s) part(ent) à :\n```\n"
                for (var i = 0; i < JSON.prochainsHoraires.length; i++) {
                    result = result + JSON.prochainsHoraires[i].heure + JSON.prochainsHoraires[i].passages[0] +'\n'
                }
                return result + '```';
            }
        );
    }
}