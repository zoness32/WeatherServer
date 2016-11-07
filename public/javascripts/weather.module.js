(function () {
    angular.module('Weather', ['ngResource', 'ngRoute', 'ngMaterial'])
        .config(function($mdThemingProvider) {
            $mdThemingProvider.theme('dark-blue')
                .backgroundPalette('blue')
                .dark();
    });
})();