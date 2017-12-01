(function() {
    let GarageComponent = function($http, chartService, moment, GarageService, format) {
        let garageCtrl = this;
        let datetime = '--/--/--, --:--:--';
        let dash4dot = '--.--';

        garageCtrl.humidity = [];
        garageCtrl.temp = [];
        garageCtrl.pressure = [];
        garageCtrl.labels = [];

        garageCtrl.currt = format.temp(dash4dot);
        garageCtrl.currh = format.percentage(dash4dot);
        garageCtrl.currp = format.inHg(dash4dot);
        garageCtrl.currdate = datetime;

        garageCtrl.getLatestInfo = function() {
            garageCtrl.latestTemp = 'unavailable';
            garageCtrl.latestHumidity = 'unavailable';
            garageCtrl.latestPressure = 'unavailable';
            garageCtrl.latestUpdateTime = 'unavailable';

            GarageService.getLatestInfo().then(function(data) {
                if (angular.isUndefined(data.error)) {
                    garageCtrl.currt = data.t;
                    garageCtrl.currh = data.h;
                    garageCtrl.currp = data.p;
                    garageCtrl.currdate = data.update;
                }
            });
        };

        garageCtrl.getLatestInfo();
        chartService.createGarageChart();

        return garageCtrl;
    };

    angular.module('Weather').component('garageInfo', {
        controller: ['$http', 'chartService', 'moment', 'GarageService', 'format', GarageComponent],
        templateUrl: '/javascripts/garageInfo/garageInfo.tpl.html'
    });
})();