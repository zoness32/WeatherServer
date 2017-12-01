(function() {
    let formatServiceFunc = function(moment) {
        let service = this;

        service.temp = function(value) {
            return value + '\u00B0';
        };

        service.dsPercentage = function(value) {
            return Math.round(value * 100) + '%';
        };

        service.percentage = function(value) {
            return value + '%';
        };

        service.dsTime = function(value) {
            return moment.unix(parseInt(value)).tz('America/Denver').format('HH:mm:ss');
        };

        service.timeWithMMDDYY = function(value) {
            return moment(parseInt(value)).format('MM/DD/YY, HH:mm:ss');
        };

        service.time = function(value) {
            return moment(parseInt(value)).format('HH:mm:ss');
        };

        service.dsInHg = function(value) {
            return (value * 0.02953).toFixed(2) + ' inHg';
        };

        service.inHg = function(value) {
            return value + ' inHg';
        };

        service.miles = function(value) {
            return value + ' miles';
        };

        service.speed = function(value) {
            return value === '--.--' ? value + 'mph' : value.toFixed(2) + 'mph';
        };

        service.bearing = function(bearing) {
            let direction = '';

            let N = 348.75;
            let N2 = 0;
            let NNE = 11.25;
            let NE = 33.75;
            let ENE = 56.25;
            let E = 78.75;
            let ESE = 101.25;
            let SE = 123.75;
            let SSE = 146.25;
            let S = 168.75;
            let SSW = 191.25;
            let SW = 213.75;
            let WSW = 236.25;
            let W = 258.75;
            let WNW = 281.25;
            let NW = 303.75;
            let NNW = 326.25;

            if ((bearing >= N || bearing >= N2) && bearing < NNE) {
                direction = 'N';
            } else if (bearing >= NNE && bearing < NE) {
                direction = 'NNE';
            } else if (bearing >= NE && bearing < ENE) {
                direction = 'NE';
            } else if (bearing >= ENE && bearing < E) {
                direction = 'ENE';
            } else if (bearing >= E && bearing < ESE) {
                direction = 'E';
            } else if (bearing >= ESE && bearing < SE) {
                direction = 'ESE';
            } else if (bearing >= SE && bearing < SSE) {
                direction = 'SE';
            } else if (bearing >= SSE && bearing < S) {
                direction = 'SSE';
            } else if (bearing >= S && bearing < SSW) {
                direction = 'S';
            } else if (bearing >= SSW && bearing < SW) {
                direction = 'SSW';
            } else if (bearing >= SW && bearing < WSW) {
                direction = 'SW';
            } else if (bearing >= WSW && bearing < W) {
                direction = 'WSW';
            } else if (bearing >= W && bearing < WNW) {
                direction = 'W';
            } else if (bearing >= WNW && bearing < NW) {
                direction = 'WNW';
            } else if (bearing >= NW && bearing < NNW) {
                direction = 'NW';
            } else if (bearing >= NNW && bearing < N) {
                direction = 'NNW';
            }

            return direction;
        };

        return service;
    };

    angular.module('Weather').service('format', ['moment', formatServiceFunc])
})();