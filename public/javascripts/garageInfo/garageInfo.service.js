(function() {
    let garageServiceFunc = function($http, format) {
        let garageService = this;

        garageService.getLatestInfo = function() {
            return $http.get('api/latest_garage')
                .then(function(latest) {
                    let data = latest.data;
                    if (data && data.temp && data.humidity && data.pressure && data.date) {
                        return {
                            t: format.temp(data.temp),
                            h: format.percentage(data.humidity),
                            p: format.inHg(data.pressure),
                            update: format.timeWithMMDDYY(data.date)
                        }
                    } else {
                        console.log('api/latest_garage: Data undefined');
                        return {error: 'something went wrong'};
                    }
                }, function(err) {
                    console.log('api/latest_garage: promise rejected   ' + err);
                    return {error: err};
                }).catch(function(errRes) {
                    return {error: errRes};
                });
        };

        return garageService;
    };

    angular.module('Weather').service('GarageService', ['$http', 'format', garageServiceFunc]);
})();