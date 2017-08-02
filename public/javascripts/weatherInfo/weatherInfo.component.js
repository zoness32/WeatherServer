(function() {
    let WeatherComponent = function($http, chartService, moment) {
        let weatherCtrl = this;
        weatherCtrl.humidity = [];
        weatherCtrl.temp = [];
        weatherCtrl.pressure = [];
        weatherCtrl.labels = [];

        weatherCtrl.getLatestOutsideInfo = function() {
            let datum = [];
            weatherCtrl.latestTempOutside = 'unavailable';
            weatherCtrl.latestHumidityOutside = 'unavailable';
            weatherCtrl.latestPressureOutside = 'unavailable';
            weatherCtrl.latestUpdateTimeOutside = 'unavailable';

            $http({
                method: 'GET',
                url: 'api/latest_outside'
            }).then(function(latest) {
                datum = latest.data[0];
                if (!angular.isUndefined(datum) && !angular.isUndefined(datum.temp) &&
                    !angular.isUndefined(datum.humidity) && !angular.isUndefined(datum.pressure) &&
                    !angular.isUndefined(datum.date)) {
                    weatherCtrl.latestTempOutside = datum.temp;
                    weatherCtrl.latestHumidityOutside = datum.humidity + '%';
                    weatherCtrl.latestPressureOutside = datum.pressure;
                    weatherCtrl.latestUpdateTimeOutside = moment(parseInt(datum.date)).format('dddd, MMM D, HH:mm:ss');
                } else {
                    console.log('api/latest_outside: Data undefined');
                }
            }, function(err) {
                console.log('api/latest_outside: promise rejected   ' + err);
            }).catch(function(errRes) {
                console.log("ERROR");
                console.log(errRes);
            });


            $http({
                method: 'GET',
                url: 'api/high_temp_for_day?unitId=1'
            }).then(function(response) {
                weatherCtrl.highTempToday = response.data;
            });

            $http({
                method: 'GET',
                url: 'api/high_humidity_for_day?unitId=1'
            }).then(function(response) {
                weatherCtrl.highHumidityToday = response.data;
            });

            $http({
                method: 'GET',
                url: 'api/high_pressure_for_day?unitId=1'
            }).then(function(response) {
                weatherCtrl.highPressureToday = response.data;
            });
        };

        weatherCtrl.getLatestInsideInfo = function() {
            let datum = [];
            weatherCtrl.latestTempInside = 'unavailable';
            weatherCtrl.latestHumidityInside = 'unavailable';
            weatherCtrl.latestPressureInside = 'unavailable';
            weatherCtrl.latestUpdateTimeInside = 'unavailable';
            weatherCtrl.highTempToday = 'unavailable';
            weatherCtrl.highHumidityToday = 'unavailable';

            $http({
                method: 'GET',
                url: 'api/latest_inside'
            }).then(function(latest) {
                datum = latest.data[0];
                if (!angular.isUndefined(datum) && !angular.isUndefined(datum.temp) &&
                    !angular.isUndefined(datum.humidity) && !angular.isUndefined(datum.pressure) &&
                    !angular.isUndefined(datum.date)) {
                    weatherCtrl.latestTempOutside = datum.temp;
                    weatherCtrl.latestHumidityOutside = datum.humidity + '%';
                    weatherCtrl.latestPressureOutside = datum.pressure;
                    weatherCtrl.latestUpdateTimeOutside = moment(parseInt(datum.date)).format('dddd, MMM D, HH:mm:ss');
                } else {
                    console.log('api/latest_inside: Data undefined');
                }
            }, function(error) {
                console.log('api/latest_inside: promise rejected    ' + error);
            }).catch(function(errRes) {
                console.log("ERROR");
                console.log(errRes);
            });
        };

        weatherCtrl.getLatestOutsideInfo();
        weatherCtrl.getLatestInsideInfo();
        chartService.createOutsideChart();
        chartService.createInsideChart();

        return weatherCtrl;
    };

    angular.module('Weather').component('weatherInfo', {
        controller: ['$http', 'chartService', 'moment', WeatherComponent],
        templateUrl: '/javascripts/weatherInfo/weatherInfo.tpl.html'
    });
})();