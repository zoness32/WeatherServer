(function() {
    let chartServiceFunc = function($http, moment) {
        let chartService = this;
        chartService._ = {
            colorArray: [{
                value: -20,
                color: '#FF00FF'
            }, {
                value: -15,
                color: '#D100FF'
            }, {
                value: -10,
                color: '#9E00FF'
            }, {
                value: -5,
                color: '#6600FF'
            }, {
                value: 0,
                color: '#0000FF'
            }, {
                value: 5,
                color: '#004AFF'
            }, {
                value: 10,
                color: '#0073FF'
            }, {
                value: 15,
                color: '#00A3FF'
            }, {
                value: 20,
                color: '#00CCFF'
            }, {
                value: 25,
                color: '#00E6FF'
            }, {
                value: 30,
                color: '#00FFFF'
            }, {
                value: 35,
                color: '#00FFB3'
            }, {
                value: 40,
                color: '#7FFF00'
            }, {
                value: 45,
                color: '#CEFF00'
            }, {
                value: 50,
                color: '#FFFF00'
            }, {
                value: 55,
                color: '#FFE600'
            }, {
                value: 60,
                color: '#FFCC00'
            }, {
                value: 65,
                color: '#FFAE00'
            }, {
                value: 70,
                color: '#FF9900'
            }, {
                value: 75,
                color: '#FF7F00'
            }, {
                value: 80,
                color: '#FF4F00'
            }, {
                value: 85,
                color: '#FF0000'
            }, {
                value: 90,
                color: '#FF4545'
            }, {
                value: 95,
                color: '#FF6868'
            }, {
                value: 100,
                color: '#FF8787'
            }, {
                value: 105,
                color: '#FF9E9E'
            }, {
                value: 110,
                color: '#FFB5B5'
            }, {
                value: 115,
                color: '#FFCFCF'
            }]
        };

        chartService.afterSetExtremes = function(e) {
            let chart = Highcharts.charts[0];

            chart.showLoading('Loading data from server...');
            $http({
                method: 'GET',
                url: 'api/info_in_range?min=' + e.min + '&max=' + e.max + '&unitId=1'
            }).then(function(data) {
                // 'https://www.highcharts.com/samples/data/from-sql.php?start=' + Math.round(e.min) +
                // '&end=' + Math.round(e.max) + '&callback=?'
                let temp = [];
                let humidity = [];
                let pressure = [];

                for (let i = 0; i < data.data.length; i++) {
                    let datum = data.data[i];
                    let date = moment(parseInt(datum.date)).valueOf();
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

                chart.series[0].setData(temp);
                chart.series[1].setData(humidity);
                chart.series[2].setData(pressure);

                chart.hideLoading();
            });
        };

        chartService.createDarkSkyChart = function(data) {
            Highcharts.setOptions({
                global: {
                    timezone: 'America/Denver'
                }
            });

            // create the chart
            Highcharts.stockChart('dark-sky', {
                rangeSelector: {
                    buttons: [
                        {count: 1, text: "Week", type: "week"}
                    ],
                    selected: 0,
                    inputStyle: {
                        color: '#000'
                    }
                },

                xAxis: {
                    type: 'datetime',
                    events: {
                        // afterSetExtremes: chartService.afterSetExtremes
                    },
                    minRange: 1000 * 3600 // one hour
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
                    data: data.t,
                    tooltip: {
                        valueDecimals: 2
                    },
                    zones: chartService._.colorArray
                }, {
                    type: 'line',
                    name: 'Humidity',
                    data: data.h,
                    yAxis: 1,
                    tooltip: {
                        valueDecimals: 2
                    }
                }, {
                    type: 'line',
                    name: 'Pressure',
                    data: data.p,
                    yAxis: 2,
                    tooltip: {
                        valueDecimals: 2
                    }
                }],

                plotOptions: {
                    series: {
                        groupPixelWidth: 20,
                        forced: true,
                        units: [
                            // [
                            //     'millisecond', // unit name
                            //     [1, 2, 5, 10, 20, 25, 50, 100, 200, 500] // allowed multiples
                            // ],
                            // [
                            //     'second',
                            //     [1, 2, 5, 10, 15, 30]
                            // ],
                            [
                                'minute',
                                [10, 30]
                            ],
                            [
                                'hour',
                                [2, 4, 6, 8, 12]
                            ]]
                    }
                },
            });
        };

        chartService._.createChart = function(chartId) {
            let apiUrl = "";
            let max = moment();
            let min = moment();
            switch (chartId) {
                case 'outside-chart':
                    apiUrl = 'api/info_in_range?min=' + min.subtract(1, 'week').format('x') + '&max=' + max + '&unitId=1';
                    // apiUrl = 'api/all_outside';
                    break;
            }

            $http({
                method: 'GET',
                url: apiUrl
            }).then(function(data) {
                let temp = [], humidity = [], pressure = [];
                let dataArray = data.data;
                // set the allowed units for data grouping
                // groupingUnits = [[
                //     'week',                         // unit name
                //     [1]                             // allowed multiples
                // ], [
                //     'month',
                //     [1, 2, 3, 4, 6]
                // ]],

                // i = 0;
                for (let i = 0; i < dataArray.length; i++) {
                    let datum = dataArray[i];
                    // let date = new Date(datum.date).getTime() - (1000 * 3600 * 7); // x * 6hrs for non DST, x * 7hrs for DST
                    let date = moment(parseInt(datum.date)).valueOf();
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

                Highcharts.setOptions({
                    global: {
                        timezone: 'America/Denver'
                    }
                });

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
                        selected: 4,
                        inputStyle: {
                            color: '#000'
                        }
                    },

                    xAxis: {
                        type: 'datetime',
                        events: {
                            // afterSetExtremes: chartService.afterSetExtremes
                        },
                        minRange: 1000 * 3600 // one hour
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
                        },
                        zones: chartService._.colorArray
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
                    }],

                    plotOptions: {
                        series: {
                            gapSize: 3,
                            groupPixelWidth: 20,
                            forced: true,
                            units: [
                                // [
                                //     'millisecond', // unit name
                                //     [1, 2, 5, 10, 20, 25, 50, 100, 200, 500] // allowed multiples
                                // ],
                                // [
                                //     'second',
                                //     [1, 2, 5, 10, 15, 30]
                                // ],
                                [
                                    'minute',
                                    [10, 30]
                                ],
                                [
                                    'hour',
                                    [2, 4, 6, 8, 12]
                                ]]
                        }
                    },
                });
            }, function(err) {
                console.log(err);
            });
        };

        chartService.createOutsideChart = function() {
            chartService._.createChart('outside-chart');
        };

        return chartService;
    };

    angular.module('Weather').service('chartService', ['$http', 'moment', chartServiceFunc]);
})();