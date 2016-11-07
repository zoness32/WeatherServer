(function() {
    angular.module('Weather').config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'partials/weather.html'
            })
            .otherwise({
                redirectTo: '/'
            });
    }]);
})();