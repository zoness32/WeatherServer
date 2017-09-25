(function() {
    let WeatherComponent = function($http, chartService, moment, WeatherService) {
        let weatherCtrl = this;
        weatherCtrl.humidity = [];
        weatherCtrl.temp = [];
        weatherCtrl.pressure = [];
        weatherCtrl.labels = [];
        weatherCtrl.old = false;
        weatherCtrl.showLows = false;
        weatherCtrl.showHighs = false;
        weatherCtrl.showCurrent = false;

        weatherCtrl.getLatestOutsideInfo = function() {
            weatherCtrl.latestTempOutside = 'unavailable';
            weatherCtrl.latestHumidityOutside = 'unavailable';
            weatherCtrl.latestPressureOutside = 'unavailable';
            weatherCtrl.latestUpdateTimeOutside = 'unavailable';

            WeatherService.getLatestOutsideInfo().then(function(data) {
                if (angular.isUndefined(data.error)) {
                    weatherCtrl.currt = data.t;
                    weatherCtrl.currh = data.h;
                    weatherCtrl.currp = data.p;
                    weatherCtrl.currdate = data.update;
                    weatherCtrl.showCurrent = true;
                } else {
                    weatherCtrl.showCurrent = false;
                }
            });

            WeatherService.getLatestOutsideHighs().then(function(data) {
                if (angular.isUndefined(data.error)) {
                    weatherCtrl.hight = data.t;
                    weatherCtrl.hightdate = data.tdate;
                    weatherCtrl.highh = data.h;
                    weatherCtrl.highhdate = data.hdate;
                    weatherCtrl.highp = data.p;
                    weatherCtrl.highpdate = data.pdate;
                    weatherCtrl.showHighs = true;
                } else {
                    weatherCtrl.showHighs = false;
                }
            });

            WeatherService.getLatestOutsideLows().then(function(data) {
                if (angular.isUndefined(data.error)) {
                    weatherCtrl.lowt = data.t;
                    weatherCtrl.lowtdate = data.tdate;
                    weatherCtrl.lowh = data.h;
                    weatherCtrl.lowhdate = data.hdate;
                    weatherCtrl.lowp = data.p;
                    weatherCtrl.lowpdate = data.pdate;
                    weatherCtrl.showLows = true;
                } else {
                    weatherCtrl.showLows = false;
                }
            });
        };

        weatherCtrl.getWindDirection = function(bearing) {
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

        weatherCtrl.processCurrentDarkSkyData = function(data) {
            weatherCtrl.dsCurrently = {
                t: data.currently.temperature + '\u00B0',
                h: (data.currently.humidity * 100).toFixed(2) + '%',
                p: (data.currently.pressure * 0.02953).toFixed(2) + ' inHg',
                stormDistance: data.currently.nearestStormDistance + ' miles',
                precipIntensity: data.currently.precipIntensity,
                precipProbability: data.currently.precipProbability * 100 + '%',
                precipType: data.currently.precipType,
                apparent_t: data.currently.apparentTemperature + '\u00B0',
                dewPoint: data.currently.dewPoint + '\u00B0',
                windSpeed: data.currently.windSpeed,
                windBearing: weatherCtrl.getWindDirection(data.currently.windBearing),
                visibility: data.currently.visibility + ' miles',
                cloudCover: data.currently.cloudCover * 100 + '%',
                ozone: data.currently.ozone,
                time: moment.unix(parseInt(data.currently.time)).tz('America/Denver').format('HH:mm:ss')
            };

            let tarr = [];
            let harr = [];
            let parr = [];
            weatherCtrl.dsForecastChartData = _.map(data.hourly.data, function(obj) {
                tarr.push([obj.time * 1000, obj.temperature]);
                harr.push([obj.time * 1000, obj.humidity * 100]);
                parr.push([obj.time * 1000, parseFloat((obj.pressure * 0.02953).toFixed(2))]);
            });

            weatherCtrl.dsChartData = {
                t: tarr,
                h: harr,
                p: parr
            }
        };

        weatherCtrl.getWundergroundData = function() {
            $http({
                method: 'GET',
                url: 'https://api.wunderground.com/api/fae65a96a64c4a3b/alerts/conditions/forecast/hourly10day/q/ID/Nampa.json'
            }).then(function(response) {
                let current = response.data.current_observation;
                let alerts = response.data.alerts;
                let forecast3Day = response.data.forecast;
                let forecastHourly = response.data.hourly_forecast;
                weatherCtrl.w_currTemp = current.temp_f + '\u00B0';
                weatherCtrl.w_currHumidity = current.relative_humidity;
                weatherCtrl.w_currPressure = current.pressure_in + ' inHg';
                weatherCtrl.w_updateTime = current.observation_time;

                // weatherCtrl.w_hourlyForecastData = _.map(forecastHourly, function(data) {
                //     return {
                //         date: moment(data.FCTTIME.epoch),
                //         temp: data.temp.english,
                //         humidity: data.humidity,
                //         pressure: data.
                //     };
                // });
            });
        };

        weatherCtrl.getLatestOutsideInfo();
        weatherCtrl.getWundergroundData();
        chartService.createOutsideChart();
        WeatherService.getDarkSkyData().then(function(data) {
            weatherCtrl.processCurrentDarkSkyData(data);
            chartService.createDarkSkyChart(weatherCtrl.dsChartData);
        });

        return weatherCtrl;
    };

    angular.module('Weather').component('weatherInfo', {
        controller: ['$http', 'chartService', 'moment', 'WeatherService', WeatherComponent],
        templateUrl: '/javascripts/weatherInfo/weatherInfo.tpl.html'
    });
})();