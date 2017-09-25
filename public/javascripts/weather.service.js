(function() {
    let weatherServiceFunc = function($http, $q, DarkSkyService) {
        let weatherService = this;

        weatherService.getLatestOutsideInfo = function() {
            return $http.get('api/latest_outside')
                .then(function(latest) {
                    datum = latest.data[0];
                    if (!angular.isUndefined(datum) && !angular.isUndefined(datum.temp) &&
                        !angular.isUndefined(datum.humidity) && !angular.isUndefined(datum.pressure) &&
                        !angular.isUndefined(datum.date)) {
                        return {
                            t: datum.temp + '\u00B0',
                            h: datum.humidity + '%',
                            p: datum.pressure + ' inHg',
                            update: moment(parseInt(datum.date)).format('MM/DD/YY, HH:mm:ss')
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
                        t: response.data.temp.temp + '\u00B0',
                        tdate: moment(parseInt(response.data.temp.date)).format('HH:mm:ss'),
                        h: response.data.humidity.humidity + '%',
                        hdate: moment(parseInt(response.data.humidity.date)).format('HH:mm:ss'),
                        p: response.data.pressure.pressure + ' inHg',
                        pdate: moment(parseInt(response.data.pressure.date)).format('HH:mm:ss')
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
                        t: response.data.temp.temp + '\u00B0',
                        tdate: moment(parseInt(response.data.temp.date)).format('HH:mm:ss'),
                        h: response.data.humidity.humidity + '%',
                        hdate: moment(parseInt(response.data.humidity.date)).format('HH:mm:ss'),
                        p: response.data.pressure.pressure + ' inHg',
                        pdate: moment(parseInt(response.data.pressure.date)).format('HH:mm:ss')
                    }
                }, function(error) {
                    console.log(error);
                    return {error: error};
                });
        };

        weatherService.getDarkSkyData = function() {
            return DarkSkyService.getData()
                .then(function(response) {
                    return response;
                });
        };

        return weatherService;
    };

    angular.module('Weather').service('WeatherService', ['$http', '$q', 'DarkSkyService', weatherServiceFunc]);
})();