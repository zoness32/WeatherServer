(function() {
    let DarkSkyComponent = function(chartService, moment, DarkSkyService, format) {
        let dsCtrl = this;

        dsCtrl.processCurrentDarkSkyData = function(data) {
            dsCtrl.currently = {
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

            let tarr = [];
            let harr = [];
            let parr = [];

            _.map(data.hourly.data, function(obj) {
                tarr.push([obj.time * 1000, obj.temperature]);
                harr.push([obj.time * 1000, obj.humidity * 100]);
                parr.push([obj.time * 1000, parseFloat((obj.pressure * 0.02953).toFixed(2))]);
            });

            dsCtrl.chartData = {
                t: tarr,
                h: harr,
                p: parr
            }
        };

        DarkSkyService.getData().then(function(data) {
            dsCtrl.processCurrentDarkSkyData(data);
            chartService.createDarkSkyChart(dsCtrl.chartData);
        });

        return dsCtrl;
    };

    angular.module('Weather').component('darkSky', {
        controller: ['chartService', 'moment', 'DarkSkyService', 'format', DarkSkyComponent],
        templateUrl: '/javascripts/darkSky/darkSky.tpl.html'
    });
})();