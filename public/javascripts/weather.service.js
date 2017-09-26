(function() {
    let weatherServiceFunc = function($http, format) {
        let weatherService = this;

        weatherService.getLatestOutsideInfo = function() {
            return $http.get('api/latest_outside')
                .then(function(latest) {
                    datum = latest.data[0];
                    if (!angular.isUndefined(datum) && !angular.isUndefined(datum.temp) &&
                        !angular.isUndefined(datum.humidity) && !angular.isUndefined(datum.pressure) &&
                        !angular.isUndefined(datum.date)) {
                        return {
                            t: format.temp(datum.temp),
                            h: format.percentage(datum.humidity),
                            p: format.inHg(datum.pressure),
                            update: format.timeWithMMDDYY(datum.date)
                        }
                    } else {
                        console.log('api/latest_outside: Data undefined');
                        return {error: 'something went wrong'};
                    }
                }, function(err) {
                    console.log('api/latest_outside: promise rejected   ' + err);
                    return {error: err};
                }).catch(function(errRes) {
                    return {error: errRes};
                });
        };

        weatherService.getLatestOutsideHighs = function() {
            return $http.get('api/highs?unitId=1')
                .then(function(response) {
                    return {
                        t: format.temp(response.data.temp.temp),
                        tdate: format.time(response.data.temp.date),
                        h: format.percentage(response.data.humidity.humidity),
                        hdate: format.time(response.data.humidity.date),
                        p: format.inHg(response.data.pressure.pressure),
                        pdate: format.time(response.data.pressure.date)
                    }
                }, function(error) {
                    console.log(error);
                    return {error: error};
                });
        };

        weatherService.getLatestOutsideLows = function() {
            return $http.get('api/lows?unitId=1')
                .then(function(response) {
                    return {
                        t: format.temp(response.data.temp.temp),
                        tdate: format.time(response.data.temp.date),
                        h: format.percentage(response.data.humidity.humidity),
                        hdate: format.time(response.data.humidity.date),
                        p: format.inHg(response.data.pressure.pressure),
                        pdate: format.time(response.data.pressure.date)
                    }
                }, function(error) {
                    console.log(error);
                    return {error: error};
                });
        };

        return weatherService;
    };

    angular.module('Weather').service('WeatherService', ['$http', 'format', weatherServiceFunc]);
})();