(function () {
    angular.module('Weather').directive('chart', function () {
        return {
            scope: {
                title: "@",
                chartId: "@"
            },
            replace: true,
            restrict: 'E',
            controller: chartControllerFunc,
            controllerAs: 'vm',
            template: `
                <md-card md-theme="dark-green">
                    <md-card-title>
                        <md-card-title-text layout-align="center center">
                            <span class="md-headline">{{vm.title}}</span>
                        </md-card-title-text>
                    </md-card-title>
                    <md-card-content>
                        <div id={{vm.chartId}} style="height: 600px; min-width:310px"></div>
                    </md-card-content>
                </md-card>
        `,
        };
    });

    let chartControllerFunc = function ($scope) {
        let chartCtrl = this;
        chartCtrl.title = $scope.title;
        chartCtrl.chartId = $scope.chartId;
        return chartCtrl;
    };
})();