(function () {
    var weatherServiceFunc = function () {
        var weatherService = this;

        weatherService.setLatestUpdate = function (update) {
            weatherService.latest = update;
        };

        return weatherService;
    };

    angular.module('Weather').service('weatherService', weatherServiceFunc);
})();