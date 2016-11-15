(function () {
    var chartServiceFunc = function($http) {
        var chartService = this;
        chartService._ = {};

        chartService._.createChart = function(chartId) {
            var apiUrl = "";
            switch(chartId) {
                case 'outside-chart':
                    apiUrl = 'api/all_outside';
                    break;
                case 'inside-chart':
                    apiUrl = 'api/all_inside';
                    break;
            }

            $http({
                method: 'GET',
                url: apiUrl
            }).then(function(data) {
                // split the data set into ohlc and volume
                var temp = [], humidity = [], pressure = [];
                var dataArray = data.data;
                // set the allowed units for data grouping
                // groupingUnits = [[
                //     'week',                         // unit name
                //     [1]                             // allowed multiples
                // ], [
                //     'month',
                //     [1, 2, 3, 4, 6]
                // ]],

                // i = 0;
                for (var i = 0; i < dataArray.length; i++) {
                    var datum = dataArray[i];
                    var date = new Date(datum.date).getTime() - (1000 * 3600 * 7); // x * 6hrs for non DST, x * 7hrs for DST
                    temp.push([
                        date,
                        parseFloat(datum.temperature)
                    ]);

                    humidity.push([
                        date,
                        parseFloat(datum.humidity)
                    ]);

                    pressure.push([
                        date,
                        parseFloat(datum.pressure)
                    ]);
                }

                // create the chart
                Highcharts.stockChart(chartId, {
                    rangeSelector: {
                        buttons: [
                            {count: 1, text: "1hr", type: "hour"},
                            {count: 3, text: "3hr", type: "hour"},
                            {count: 6, text: "6hr", type: "hour"},
                            {count: 12, text: "12hr", type: "hour"},
                            {count: 1, text: "Day", type: "day"},
                            {count: 1, text: "Week", type: "week"}
                        ],
                        selected: 4
                    },

                    yAxis: [{
                        labels: {
                            align: 'left',
                            x: 8,
                            y: 5
                        },
                        title: {
                            text: 'Temperature'
                        },
                        height: '40%',
                        lineWidth: 2
                    }, {
                        labels: {
                            align: 'left',
                            x: 8,
                            y: 5
                        },
                        title: {
                            text: 'Humidity'
                        },
                        top: '45%',
                        height: '35%',
                        offset: 0,
                        lineWidth: 2
                    }, {
                        labels: {
                            align: 'left',
                            x: 8,
                            y: 5
                        },
                        title: {
                            text: 'Pressure'
                        },
                        top: '85%',
                        height: '20%',
                        offset: 0,
                        lineWidth: 2
                    }],

                    series: [{
                        type: 'line',
                        name: 'Temperature',
                        data: temp,
                        tooltip: {
                            valueDecimals: 2
                        }
                    }, {
                        type: 'line',
                        name: 'Humidity',
                        data: humidity,
                        yAxis: 1,
                        tooltip: {
                            valueDecimals: 2
                        }
                    }, {
                        type: 'line',
                        name: 'Pressure',
                        data: pressure,
                        yAxis: 2,
                        tooltip: {
                            valueDecimals: 2
                        }
                    }]
                });
            });
        };

        chartService.createOutsideChart = function() {
            chartService._.createChart('outside-chart');
        };

        chartService.createInsideChart = function() {
            chartService._.createChart('inside-chart');
        };

        return chartService;
    };

    angular.module('Weather').service('chartService', chartServiceFunc);
})();