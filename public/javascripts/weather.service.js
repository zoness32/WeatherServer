(function() {
    let weatherServiceFunc = function() {
        let weatherService = this;

        weatherService.humidity = [];
        weatherService.temp = [];
        weatherService.pressure = [];
        weatherService.labels = [];

        weatherService.setLatestUpdate = function(update) {
            weatherService.latest = update;
        };

        weatherService.getLatestOutsideInfo = function() {
            let datum = [];

            $http({
                method: 'GET',
                url: 'api/latest_outside'
            }).then(function(latest) {
                datum = latest.data[0];

                weatherService.latestTempOutside = datum.temp || "unavailable";
                weatherService.latestHumidityOutside = datum.humidity || "unavailable";
                weatherService.latestPressureOutside = datum.pressure || "unavailable";

                let options = {
                    year: "2-digit",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    timeZoneName: "short",
                    hour12: false
                };

                weatherService.latestUpdateTimeOutside = new Intl.DateTimeFormat("en-US", options).format(new Date(datum.date));
            }).catch(function(errRes) {
                console.log("ERROR");
                console.log(errRes);
            });
        };

        weatherService.getLatestInsideInfo = function() {
            let datum = [];

            $http({
                method: 'GET',
                url: 'api/latest_inside'
            }).then(function(latest) {
                datum = latest.data[0];

                weatherService.latestTempInside = datum.temp || "unavailable";
                weatherService.latestHumidityInside = datum.humidity || "unavailable";
                weatherService.latestPressureInside = datum.pressure || "unavailable";

                let options = {
                    year: "2-digit",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    timeZoneName: "short",
                    hour12: false
                };

                weatherService.latestUpdateTimeInside = new Intl.DateTimeFormat("en-US", options).format(new Date(datum.date));
            }, function(error) {
                console.log(error);
                weatherService.latestTempInside = "unavailable";
            }).catch(function(errRes) {
                console.log("ERROR");
                console.log(errRes);
            });
        };

        weatherService.getExtremeForDate = function(date) {
            let datum = [];

            $http({
                method: 'GET',
                url: 'api/extreme',
                data: date
            }).then(function(latest) {
                datum = latest.data[0];

                weatherService.latestTempOutside = datum.temp || "unavailable";
                weatherService.latestHumidityOutside = datum.humidity || "unavailable";
                weatherService.latestPressureOutside = datum.pressure || "unavailable";

                let options = {
                    year: "2-digit",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    timeZoneName: "short",
                    hour12: false
                };

                weatherService.latestUpdateTimeOutside = new Intl.DateTimeFormat("en-US", options).format(new Date(datum.date));
            }).catch(function(errRes) {
                console.log("ERROR");
                console.log(errRes);
            });
        };

        return weatherService;
    };

    angular.module('Weather').service('weatherService', [weatherServiceFunc]);
})();