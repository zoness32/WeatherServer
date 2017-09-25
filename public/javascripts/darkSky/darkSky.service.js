(function() {
    let darkSkyServiceFunc = function($http, $q) {
        let darkSkyService = this;

        darkSkyService._ = {};
        darkSkyService._.cache = undefined;

        darkSkyService.getData = function() {
            let d = $q.defer();
            if (darkSkyService._.cache) {
                d.resolve(darkSkyService._.cache);
            } else {
                $http.get('api/dark_sky')
                    .then(function(response) {
                        darkSkyService._.cache = response.data;
                        d.resolve(darkSkyService._.cache);
                    });
            }

            return d.promise;
        };

        return darkSkyService;
    };

    angular.module('Weather').service('DarkSkyService', ['$http', '$q', darkSkyServiceFunc]);
})();