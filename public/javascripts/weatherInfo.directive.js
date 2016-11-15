(function () {
    angular.module('Weather').directive('weatherInfo', function () {
        return {
            scope: {},
            replace: true,
            restrict: 'E',
            controller: weatherControllerFunc,
            controllerAs: 'vm',
            template: `
                <div>
                    <md-card md-theme="dark-green">
                        <md-card-title>
                            <md-card-title-text>
                                <span class="md-headline">Current Weather</span>
                            </md-card-title-text>
                        </md-card-title>
                        <md-card-content>
                            <div layout="row">
                                <md-card class="md-primary md-hue-3">
                                    <md-card-title>
                                        <md-card-title-text>
                                            <span class="md-headline">Outside</span>
                                        </md-card-title-text>
                                    </md-card-title>
                                    <md-card-content>
                                        <div layout="column">
                                            <span>Temperature: {{vm.latestTempOutside}}</span>
                                            <span>Humidity: {{vm.latestHumidityOutside}}%</span>
                                            <span>Pressure: {{vm.latestPressureOutside}}</span>
                                            <span>Updated at: {{vm.latestUpdateTimeOutside}}</span>
                                        </div>
                                    </md-card-content>
                                </md-card>
                                <md-card md-theme="green">
                                    <md-card-title>
                                        <md-card-title-text>
                                            <span class="md-headline">Inside</span>
                                        </md-card-title-text>
                                    </md-card-title>
                                    <md-card-content>
                                        <div layout="column">
                                            <span>Temperature: {{vm.latestTempInside}}</span>
                                            <span>Humidity: {{vm.latestHumidityInside}}%</span>
                                            <span>Pressure: {{vm.latestPressureInside}}</span>
                                            <span>Updated at: {{vm.latestUpdateTimeInside}}</span>
                                        </div>
                                    </md-card-content>
                                </md-card>
                            </div>
                        </md-card-content>
                    </md-card>
                    <div layout="row" layout-xs="column">
                        <chart flex title="Outside Weather Data" chart-id="outside-chart"></chart>
                        <chart flex title="Inside Weather Data" chart-id="inside-chart"></chart>
                    </div>
                </div>
            `
        };
    });

    var weatherControllerFunc = function ($http, chartService) {
        var weatherCtrl = this;
        weatherCtrl.humidity = [];
        weatherCtrl.temp = [];
        weatherCtrl.pressure = [];
        weatherCtrl.labels = [];

        weatherCtrl.getLatestOutsideInfo = function () {
            var datum = [];

            $http({
                method: 'GET',
                url: 'api/latest_outside'
            }).then(function (latest) {
                datum = latest.data[0];

                weatherCtrl.latestTempOutside = datum.temp || "unavailable";
                weatherCtrl.latestHumidityOutside = datum.humidity || "unavailable";
                weatherCtrl.latestPressureOutside = datum.pressure || "unavailable";

                var options = {
                    year: "2-digit",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    timeZoneName: "short",
                    hour12: false
                };

                weatherCtrl.latestUpdateTimeOutside = new Intl.DateTimeFormat("en-US", options).format(new Date(datum.date));;
            }).catch(function (errRes) {
                console.log("ERROR");
                console.log(errRes);
            });
        };

        weatherCtrl.getLatestInsideInfo = function () {
            var datum = [];

            $http({
                method: 'GET',
                url: 'api/latest_inside'
            }).then(function (latest) {
                datum = latest.data[0];

                weatherCtrl.latestTempInside = datum.temp || "unavailable";
                weatherCtrl.latestHumidityInside = datum.humidity || "unavailable";
                weatherCtrl.latestPressureInside = datum.pressure || "unavailable";

                var options = {
                    year: "2-digit",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    timeZoneName: "short",
                    hour12: false
                };

                weatherCtrl.latestUpdateTimeInside = new Intl.DateTimeFormat("en-US", options).format(new Date(datum.date));;
            }).catch(function (errRes) {
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
})();