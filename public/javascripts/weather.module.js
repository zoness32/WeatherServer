(function () {
    angular.module('Weather', ['ngResource', 'ngRoute', 'ngMaterial', 'angularMoment'])
        .config(function($mdThemingProvider) {
            $mdThemingProvider.theme('dark-green')
                .backgroundPalette('green').dark();

            $mdThemingProvider.theme('default')
                .backgroundPalette('green');
    });
})();