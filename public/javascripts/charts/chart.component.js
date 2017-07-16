(function() {
    function ChartComponent() {

    }

    angular.module('Weather').component('chartComponent', {
        controller: ['chartService', ChartComponent],
        template: `
                <md-card md-theme="dark-green">
                    <md-card-title>
                        <md-card-title-text layout-align="center center">
                            <span class="md-headline">{{$ctrl.title}}</span>
                        </md-card-title-text>
                    </md-card-title>
                    <md-card-content>
                        <div id={{$ctrl.chartId}} style="height: 600px; min-width:310px"></div>
                    </md-card-content>
                </md-card>
        `,
        bindings: {
            chartTitle: "@",
            chartId: "@"
        }
    });
})();