(function() {
    let WeatherComponent = function($http, chartService, moment, WeatherService, DarkSkyService, format) {
        let weatherCtrl = this;
        let time = '--:--:--';
        let datetime = '--/--/--, --:--:--';
        let dash2 = '--';
        let dash3 = '---';
        let dash4 = '----';
        let dash3dot = '--.-';
        let dash4dot = '--.--';

        weatherCtrl.humidity = [];
        weatherCtrl.temp = [];
        weatherCtrl.pressure = [];
        weatherCtrl.labels = [];
        weatherCtrl.old = false;

        weatherCtrl.ds = {
            forecastSummary: dash4,
            forecastHigh: format.temp(dash4dot),
            forecastHighTime: time,
            forecastLow: format.temp(dash4dot),
            forecastLowTime: time,
            forecastPrecipType: dash4,
            forecastPrecipChance: format.percentage(dash2),
            forecastCloudCover: format.percentage(dash2),
            forecastWindSpeed: format.speed(dash4dot),
            forecastWindBearing: dash3,
            forecastGust: format.speed(dash4dot),
            forecastGustTime: time,
            forecastVisibility: format.miles(dash3dot)
        };

        weatherCtrl.currt = format.temp(dash4dot);
        weatherCtrl.currh = format.percentage(dash4dot);
        weatherCtrl.currp = format.inHg(dash4dot);
        weatherCtrl.currdate = datetime;

        weatherCtrl.hight = format.temp(dash4dot);
        weatherCtrl.hightdate = time;
        weatherCtrl.highh = format.percentage(dash4dot);
        weatherCtrl.highhdate = time;
        weatherCtrl.highp = format.inHg(dash4dot);
        weatherCtrl.highpdate = time;

        weatherCtrl.lowt = format.temp(dash4dot);
        weatherCtrl.lowtdate = time;
        weatherCtrl.lowh = format.temp(dash4dot);
        weatherCtrl.lowhdate = time;
        weatherCtrl.lowp = format.inHg(dash4dot);
        weatherCtrl.lowpdate = time;

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
                }
            });
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

        weatherCtrl.loadDarkSkyData = function(data) {
            let ds = data.daily.data[0];
            weatherCtrl.ds = {
                forecastSummary: ds.summary,
                forecastHigh: format.temp(ds.temperatureHigh),
                forecastHighTime: format.dsTime(ds.temperatureHighTime),
                forecastLow: format.temp(ds.temperatureLow),
                forecastLowTime: format.dsTime(ds.temperatureLowTime),
                forecastPrecipType: ds.precipType,
                forecastPrecipChance: format.dsPercentage(ds.precipProbability),
                forecastCloudCover: format.dsPercentage(ds.cloudCover),
                forecastWindSpeed: format.speed(ds.windSpeed),
                forecastWindBearing: format.bearing(ds.windBearing),
                forecastGust: format.speed(ds.windGust),
                forecastGustTime: format.dsTime(ds.windGustTime),
                forecastVisibility: format.miles(ds.visibility)
            };
        };

        weatherCtrl.getLatestOutsideInfo();
        weatherCtrl.getWundergroundData();
        chartService.createOutsideChart();
        DarkSkyService.getData().then(function(data) {
            if (!data.error) {
                weatherCtrl.loadDarkSkyData(data);
            }
        });

        return weatherCtrl;
    };

    angular.module('Weather').component('weatherInfo', {
        controller: ['$http', 'chartService', 'moment', 'WeatherService', 'DarkSkyService', 'format', WeatherComponent],
        templateUrl: '/javascripts/weatherInfo/weatherInfo.tpl.html'
    });
})();