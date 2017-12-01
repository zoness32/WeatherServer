(function() {
    let darkSkyServiceFunc = function($http, $q, format) {
        let darkSkyService = this;

        darkSkyService._ = {};
        darkSkyService._.cache = undefined;

        darkSkyService.currently = {};
        darkSkyService.forecast = {};

        darkSkyService.getData = function() {
            return $http.get('api/dark_sky')
                .then(function(response) {
                    let data = response.data;
                    darkSkyService.currently = {
                        t: format.temp(data.currently.temperature),
                        h: format.dsPercentage(data.currently.humidity),
                        p: format.dsInHg(data.currently.pressure),
                        stormDistance: format.miles(data.currently.nearestStormDistance),
                        precipIntensity: data.currently.precipIntensity,
                        precipProbability: format.dsPercentage(data.currently.precipProbability),
                        precipType: data.currently.precipType,
                        apparent_t: format.temp(data.currently.apparentTemperature),
                        dewPoint: format.temp(data.currently.dewPoint),
                        windSpeed: format.speed(data.currently.windSpeed),
                        windBearing: format.bearing(data.currently.windBearing),
                        visibility: format.miles(data.currently.visibility),
                        cloudCover: format.dsPercentage(data.currently.cloudCover),
                        ozone: data.currently.ozone,
                        time: format.dsTime(data.currently.time)
                    };

                    let ds = data.daily.data[0];
                    darkSkyService.forecast = {
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

                    return data;
                })
        };

        // darkSkyService.getData = function() {
        //     let d = $q.defer();
        //     if (darkSkyService._.cache) {
        //         d.resolve(darkSkyService._.cache);
        //     } else {
        //         $http.get('api/dark_sky')
        //             .then(function(response) {
        //                 darkSkyService._.cache = response.data;
        //                 d.resolve(darkSkyService._.cache);
        //             });
        //     }
        //
        //     return d.promise;
        // };

        return darkSkyService;
    };

    angular.module('Weather').service('DarkSkyService', ['$http', '$q', 'format', darkSkyServiceFunc]);
})();