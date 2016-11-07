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
                    <md-card md-theme="dark-blue">
                        <md-card-title>
                            <md-card-title-text>
                                <span class="md-headline">Current Weather</span>
                            </md-card-title-text>
                        </md-card-title>
                        <md-card-content>
                            <div layout="column">
                                <span>Temperature: {{vm.latestTemp}}</span>
                                <span>Humidity: {{vm.latestHumidity}}%</span>
                                <span>Pressure: {{vm.latestPressure}}</span>
                                <span>Updated at: {{vm.latestUpdateTime}}</span>
                            </div>
                        </md-card-content>
                    </md-card>
                    <chart title="Weather Data" chart-id="combined-chart"></chart>
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

        weatherCtrl.getLatestInfo = function () {
            var datum = [];

            $http({
                method: 'GET',
                url: 'api/latest'
            }).then(function (latest) {
                datum = latest.data[0];

                weatherCtrl.latestTemp = datum.temp || "unavailable";
                weatherCtrl.latestHumidity = datum.humidity || "unavailable";
                weatherCtrl.latestPressure = datum.pressure || "unavailable";

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

                weatherCtrl.latestUpdateTime = new Intl.DateTimeFormat("en-US", options).format(new Date(datum.date));;
            }).catch(function (errRes) {
                console.log("ERROR");
                console.log(errRes);
            });
        };

        weatherCtrl.getLatestInfo();
        weatherCtrl.combinedChart = chartService.createChartCombined();

        return weatherCtrl;
    };
})();