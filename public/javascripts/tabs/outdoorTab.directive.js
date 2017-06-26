(function () {
    angular.module('Weather').directive('outdoorTab', function () {
        return {
            scope: {},
            replace: true,
            restrict: 'E',
            controller: outdoorTabFunc,
            controllerAs: 'vm',
            template: `
                <div layout="row">
                    <chart flex="80" title="Outside Weather Data" chart-id="outside-chart"></chart>
                    <div layout="column">
                        <md-card class="md-primary md-hue-3">
                            <md-card-title>
                                <md-card-title-text>
                                    <span class="md-headline">Current Data</span>
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
                        <md-card class="md-primary md-hue-3">
                            <md-card-title>
                                <md-card-title-text>
                                    <span class="md-headline">Daily Extremes</span>
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
                    </div>
                </div>
            `
        };
    });

    let outdoorTabFunc = function () {

    };
})();